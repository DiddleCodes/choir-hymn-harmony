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
      {/* Mobile App Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
              <Music className="w-4 h-4 text-primary-foreground" />
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
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25"
              >
                <Link to="/choir-signup">
                  <Users className="w-4 h-4 mr-2" />
                  Join as Choir Member
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search hymns or lyrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-6 text-lg bg-background border-border shadow-lg rounded-2xl 
            focus:ring-2 focus:ring-primary/50 font-medium"
          />
        </div>

        {/* Feature Cards */}
        {!searchTerm && (
          <div className="space-y-4">
            {/* Top Row - Two Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-background to-primary/5 border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                    <Heart className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Timeless Hymns</h3>
                  <p className="text-sm text-muted-foreground">Classic hymns for worship and reflection</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-accent/5 border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/25">
                    <Music className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Beautiful Lyrics</h3>
                  <p className="text-sm text-muted-foreground">Inspiring songs with meaningful words</p>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row - Full Width Card */}
            <Card className="bg-gradient-to-r from-background to-secondary/5 border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary/25">
                  <BookOpen className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">Song Collection</h3>
                <p className="text-muted-foreground mb-6">Available for approved choir members</p>
              </CardContent>
            </Card>

            {/* Join Choir Member CTA */}
            {!user && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="font-display font-bold text-xl mb-3">Join our choir to access the complete song collection!</h3>
                  <Button 
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 px-8 py-3 rounded-xl"
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
