import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus, LogOut, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDialog from './AdminDialog';
import ChoirRequestsAdmin from './ChoirRequestsAdmin';
import UserManagement from './UserManagement';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader,
} from '@/components/ui/dialog';

const AdminButton = () => {
  const { user, isSuperAdmin, isAdmin, signOut, userRole } = useAuth();
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
            <span className="hidden sm:inline">
              {isSuperAdmin ? 'Super Admin' : canManage ? 'Admin' : 'Account'}
            </span>
            <span className="sm:hidden">
              {isSuperAdmin ? 'S.A.' : canManage ? 'Admin' : 'User'}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {canManage && (
            <>
              <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Manage Songs
              </DropdownMenuItem>

              {isSuperAdmin && (
                <>
                  <DropdownMenuItem onClick={() => setShowUserManagement(true)}>
                    <Users className="w-4 h-4 mr-2" /> User Management
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowChoirRequests(true)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Choir Requests
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminDialog
        open={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        userRole={userRole}
      />

      <Dialog open={showChoirRequests} onOpenChange={setShowChoirRequests}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choir Requests</DialogTitle>
            <DialogDescription>
              Manage requests to join the choir
            </DialogDescription>
          </DialogHeader>
          <ChoirRequestsAdmin />
        </DialogContent>
      </Dialog>

      <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Management</DialogTitle>
            <DialogDescription>
              Manage user roles and access levels
            </DialogDescription>
          </DialogHeader>
          <UserManagement />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminButton;
