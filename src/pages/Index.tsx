import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Users, Music, Search, Heart, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SongLibrary from "@/components/SongLibrary";
import SongModal from "@/components/SongModal";
import AdminButton from "@/components/AdminButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChoirMembershipRequest from "@/components/ChoirMembershipRequest";
import { Card, CardContent } from "@/components/ui/card";
import type { Song } from "@/hooks/useSongs";
import heroImage from "@/assets/hymnal-hero.jpg";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Sacred music background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>
        
        {/* Mobile App Header */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg">Sanctuary's Library</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <AdminButton />
              ) : (
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 text-xs px-3 py-1"
                >
                  <Link to="/choir-signup">
                    <Users className="w-3 h-3 mr-1" />
                    Join Choir
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
              <Music className="w-10 h-10 text-primary-foreground animate-float" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Sanctuary's <span className="text-primary">Library</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Join our choir community
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search hymns or lyrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-background/80 backdrop-blur-sm border-border shadow-lg rounded-2xl 
              focus:ring-2 focus:ring-primary/50 font-medium"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Feature Cards */}
        {!searchTerm && (
          <div className="space-y-4">
            {/* Top Row - Two Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-background to-primary/5 border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
                    <Heart className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">Timeless Hymns</h3>
                  <p className="text-xs text-muted-foreground">Classic hymns for worship</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-accent/5 border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-accent/25">
                    <Music className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">Beautiful Lyrics</h3>
                  <p className="text-xs text-muted-foreground">Inspiring meaningful words</p>
                </CardContent>
              </Card>
            </div>

            {/* Join Choir Member CTA */}
            {!user && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="font-display font-bold text-lg mb-3">Join our choir to access the complete song collection!</h3>
                  <Button 
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 px-6 py-2 rounded-xl"
                  >
                    <Link to="/choir-signup">
                      Join as Choir Member
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Song Library - Only show when searching */}
        {searchTerm && (
          <div className="pt-4">
            <SongLibrary 
              searchTerm={searchTerm}
              onSongSelect={handleSongSelect}
              userRole={userRole}
            />
          </div>
        )}
      </div>

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
