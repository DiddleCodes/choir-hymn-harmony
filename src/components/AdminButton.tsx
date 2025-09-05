import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDialog from './AdminDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminButton = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [showAdminDialog, setShowAdminDialog] = useState(false);

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
        <AdminDialog
          open={showAdminDialog}
          onClose={() => setShowAdminDialog(false)}
        />
      )}
    </>
  );
};

export default AdminButton;