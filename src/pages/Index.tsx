import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Users, Music, Search, Library, Heart, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/HeroSection";
import SongLibrary from "@/components/SongLibrary";
import SongModal from "@/components/SongModal";
import AdminButton from "@/components/AdminButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeSelector } from "@/components/ThemeSelector";
import { MobileNavigation } from "@/components/MobileNavigation";
import { MobileSearchBar } from "@/components/MobileSearchBar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChoirMembershipRequest from "@/components/ChoirMembershipRequest";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Song } from "@/hooks/useSongs";

const Index = () => {
  const { user, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showChoirRequest, setShowChoirRequest] = useState(false);
  const [currentSection, setCurrentSection] = useState("home");
  const isMobile = useIsMobile();

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Mobile Navigation Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Music className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">Choir Harmony</h1>
                <p className="text-xs text-muted-foreground">Sacred Songs & Hymns</p>
              </div>
            </div>
            <MobileNavigation 
              currentSection={currentSection} 
              onSectionChange={setCurrentSection} 
            />
          </div>
        </div>
      )}

      {/* Enhanced Mobile Search Section */}
      {isMobile && (
        <div className="p-4 bg-gradient-to-r from-primary/5 via-background to-accent/5 border-b border-border/10">
          <MobileSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search hymns, songs, lyrics..."
          />
          
          {/* Quick Stats for Mobile */}
          <div className="flex gap-2 mt-4 justify-center">
            <Badge variant="secondary" className="flex items-center gap-1 hover-scale">
              <Library className="w-3 h-3" />
              500+ Songs
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 hover-scale">
              <Heart className="w-3 h-3" />
              Bilingual
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 hover-scale">
              <Sparkles className="w-3 h-3" />
              Interactive
            </Badge>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      {!isMobile && (
        <nav className="fixed top-0 right-0 z-50 p-4 md:p-6 mobile-slide-up">
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeSelector />
            <ThemeToggle />
            {user ? (
              <AdminButton />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 mobile-button-press mobile-transition"
                >
                  <Link to="/choir-signup">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Choir Member</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 mobile-button-press mobile-transition">
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Hero Section - Hidden on mobile when searching */}
      {(!isMobile || !searchTerm) && (
        <HeroSection 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
      
      {/* Song Library section - Enhanced for mobile */}
      <div className={`mobile-fade-in ${isMobile ? 'pb-20' : ''}`}>
        <SongLibrary 
          searchTerm={searchTerm}
          onSongSelect={handleSongSelect}
          userRole={userRole}
        />
      </div>

      {/* Mobile Quick Actions Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/20 p-4 z-30">
          <div className="flex justify-center space-x-4">
            {searchTerm && (
              <Card className="px-4 py-2 bg-primary/10 border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Searching:</span>
                  <span className="font-medium text-primary truncate max-w-32">
                    "{searchTerm}"
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      <SongModal 
        song={selectedSong}
        isOpen={!!selectedSong}
        onClose={handleCloseModal}
      />
      
      {/* Choir Membership Request Dialog */}
      <Dialog open={showChoirRequest} onOpenChange={setShowChoirRequest}>
        <DialogContent className="mobile-scale-in">
          <ChoirMembershipRequest onClose={() => setShowChoirRequest(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
