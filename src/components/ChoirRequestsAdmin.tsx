import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, Mail, User } from 'lucide-react';

interface ChoirRequest {
  id: string;
  email: string;
  full_name: string;
  message?: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

const ChoirRequestsAdmin = () => {
  const [requests, setRequests] = useState<ChoirRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('choir_member_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch choir requests",
          variant: "destructive",
        });
        return;
      }

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
  };

  const handleApproveRequest = async (requestId: string, email: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from('choir_member_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to approve request",
          variant: "destructive",
        });
        return;
      }

      // Get the request data to send welcome email
      const { data: requestData, error: fetchError } = await supabase
        .from('choir_member_requests')
        .select('full_name, email')
        .eq('id', requestId)
        .single();

      if (!fetchError && requestData) {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: requestData.email,
              fullName: requestData.full_name,
            },
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't show error to user, just log it
        }
      }

      toast({
        title: "Request Approved",
        description: `${email} has been approved as a choir member and will receive a welcome email`,
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId: string, email: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from('choir_member_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to reject request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Request Rejected",
        description: `${email}'s request has been rejected`,
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600"><Check className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choir Membership Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Choir Membership Requests
        </CardTitle>
        <CardDescription>
          Review and manage choir membership applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending choir membership requests found
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{request.full_name}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </div>
                      {request.message && (
                        <div className="text-sm bg-muted/50 p-2 rounded">
                          <strong>Message:</strong> {request.message}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                        {request.reviewed_at && (
                          <span> • Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproveRequest(request.id, request.email)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id, request.email)}
                          disabled={processing === request.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChoirRequestsAdmin;