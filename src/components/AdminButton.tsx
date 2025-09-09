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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import ChoirRequestsAdmin from './ui/choirRequestsAdmin';
import { DialogHeader } from './ui/dialog';

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
          
          {/* Choir Requests Dialog */}
          <Dialog open={showChoirRequests} onOpenChange={setShowChoirRequests}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Choir Requests</DialogTitle>
                <DialogDescription>
                  Review and approve or reject choir membership requests
                </DialogDescription>
              </DialogHeader>
              <ChoirRequestsAdmin />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AdminButton;
