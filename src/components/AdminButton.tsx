import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDialog from './AdminDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import ChoirRequestsAdmin from './ui/choirRequestsAdmin';

const AdminButton = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showChoirRequests, setShowChoirRequests] = useState(false);

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            {isAdmin ? 'Admin' : 'Account'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Manage Songs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowChoirRequests(true)}>
                <Users className="w-4 h-4 mr-2" />
                Choir Requests
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAdmin && (
        <>
          <AdminDialog
            open={showAdminDialog}
            onClose={() => setShowAdminDialog(false)}
          />
          
          {/* Fixed Choir Requests Dialog with proper styling */}
          <Dialog open={showChoirRequests} onOpenChange={setShowChoirRequests}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4 border-b">
                <DialogTitle className="text-2xl font-display">Manage Choir Requests</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Review and approve or reject choir membership requests
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-1">
                <ChoirRequestsAdmin />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AdminButton;