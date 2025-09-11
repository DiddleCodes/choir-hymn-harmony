import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { PlusCircle, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SongForm from "./SongForm";
import SongManager from "./SongManager";

interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  userRole?: "super_admin" | "admin" | "choir_member" | "guest" | null;
}

const AdminDialog = ({ open, onClose, userRole }: AdminDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Normalize role to lowercase
  const normalizedRole = userRole?.toLowerCase();

  // Block access if not admin or super_admin
  if (
    !normalizedRole ||
    (normalizedRole !== "admin" && normalizedRole !== "super_admin")
  ) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col modal-enter">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-2xl font-display font-semibold">
            Manage Hymns & Songs
          </DialogTitle>
        </DialogHeader>

        <Tabs
          // Default to Add unless editing, then switch to Manage
          value={isEditing ? "manage" : "add"}
          className="flex-1 flex flex-col"
        >
          {/* Tab Controls */}
          <div className="flex justify-center border-b mb-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md rounded-xl p-1 bg-muted shadow-sm">
              <TabsTrigger
                value="add"
                className="flex items-center gap-2 rounded-lg transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-white
                  hover:bg-accent hover:text-accent-foreground
                  shadow-sm active:scale-[0.97] active:shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Song</span>
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                className="flex items-center gap-2 rounded-lg transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-white
                  hover:bg-accent hover:text-accent-foreground
                  shadow-sm active:scale-[0.97] active:shadow-md"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Manage Songs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Add Song */}
          <TabsContent value="add" className="flex-1 px-2 md:px-4">
            <AnimatePresence mode="wait">
              {!isEditing && (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="h-full overflow-y-auto smooth-scroll"
                >
                  <SongForm
                    onDone={() => setIsEditing(false)}
                    onSwitchToManage={() => setIsEditing(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Manage Songs */}
          <TabsContent value="manage" className="flex-1 px-2 md:px-4">
            <AnimatePresence mode="wait">
              {isEditing && (
                <motion.div
                  key="manage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="h-full overflow-y-auto smooth-scroll"
                >
                  <SongManager
                    onEditStart={() => setIsEditing(true)}
                    onDoneEditing={() => setIsEditing(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;