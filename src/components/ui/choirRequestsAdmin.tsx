import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, CheckCircle, XCircle, Mail, User, MessageSquare, Calendar } from 'lucide-react';

const ChoirRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('choir_member_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch choir requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (request) => {
    try {
      const res = await fetch("/functions/v1/approve-choir-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: request.email,
          full_name: request.full_name,
          request_id: request.id,
        }),
      });
  
      const result = await res.json();
  
      if (!result.success) {
        console.error("Approval error:", result.error);
        throw new Error(result.error || "Failed to approve");
      }
  
      toast({
        title: "Request Approved",
        description: `Choir member created with user ID: ${result.user_id}`,
      });
  
      fetchRequests();
      setActionDialog({ open: false, type: null });
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: `Failed to approve request: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  

  const handleReject = async (requestId) => {
    try {
      const { error } = await supabase
        .from('choir_member_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "The choir member request has been rejected.",
      });

      fetchRequests();
      setActionDialog({ open: false, type: null });
      setRejectionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const reviewedRequests = requests.filter(req => req.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading choir requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Choir Member Requests</h2>
        <Badge variant="outline" className="ml-2">
          {pendingRequests.length} pending
        </Badge>
      </div>

      {pendingRequests.length === 0 && reviewedRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
            <p className="text-muted-foreground text-center">
              When people request to join the choir, their requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {request.full_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.email}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {request.message && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <MessageSquare className="w-3 h-3" />
                            Message
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {request.message}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Submitted {formatDate(request.created_at)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionDialog({ open: true, type: 'approve' });
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionDialog({ open: true, type: 'reject' });
                          }}
                          className="flex-1"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Requests */}
          {reviewedRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recently Reviewed</h3>
              <div className="space-y-2">
                {reviewedRequests.slice(0, 5).map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{request.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Reviewed {formatDate(request.reviewed_at || request.created_at)}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onOpenChange={(open) => setActionDialog({ open, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  {actionDialog.type === 'approve' 
                    ? `Approve choir membership request for ${selectedRequest.full_name}?`
                    : `Reject choir membership request for ${selectedRequest.full_name}?`
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {actionDialog.type === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (actionDialog.type === 'approve') {
                  handleApprove(selectedRequest);
                } else {
                  handleReject(selectedRequest?.id);
                }
              }}
            >
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChoirRequestsAdmin;