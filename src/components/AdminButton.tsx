import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus, LogOut, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDialog from './AdminDialog';
import ChoirRequestsAdmin from './ChoirRequestsAdmin';
import UserManagement from './UserManagement';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';

const AdminButton = () => {
  const { user, isSuperAdmin, isAdmin, signOut } = useAuth();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showChoirRequests, setShowChoirRequests] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  if (!user) return null;

  const canManage = isSuperAdmin || isAdmin;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            {isSuperAdmin ? 'Super Admin' : canManage ? 'Admin' : 'Account'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canManage && (
            <>
              <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Manage Songs
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuItem onClick={() => setShowChoirRequests(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Choir Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowUserManagement(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {canManage && (
        <>
        <AdminDialog
          open={showAdminDialog}
          onClose={() => setShowAdminDialog(false)}
          userRole={userRole}
        />
          
          {isSuperAdmin && (
            <>
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

              <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0 pb-4 border-b">
                    <DialogTitle className="text-2xl font-display">User Management</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      View and manage all registered users
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-1">
                    <UserManagement />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      )}
    </>
  );
};

export default AdminButton;