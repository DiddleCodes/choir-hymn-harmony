import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/HeroSection";
import SongLibrary from "@/components/SongLibrary";
import SongModal from "@/components/SongModal";
import AdminButton from "@/components/AdminButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChoirMembershipRequest from "@/components/ChoirMembershipRequest";
import type { Song } from "@/hooks/useSongs";

const Index = () => {
  const { user, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showChoirRequest, setShowChoirRequest] = useState(false);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 right-0 z-50 p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {user ? (
              <AdminButton />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <Link to="/choir-signup">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Choir Member</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>

      <HeroSection 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <SongLibrary 
        searchTerm={searchTerm}
        onSongSelect={handleSongSelect}
        userRole={userRole}
      />
      <SongModal 
        song={selectedSong}
        isOpen={!!selectedSong}
        onClose={handleCloseModal}
      />
      
      {/* Choir Membership Request Dialog */}
      <Dialog open={showChoirRequest} onOpenChange={setShowChoirRequest}>
        <DialogContent>
          <ChoirMembershipRequest onClose={() => setShowChoirRequest(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
