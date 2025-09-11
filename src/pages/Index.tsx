import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Users, Music, Search } from "lucide-react";
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

  const handleSongSelect = (song: Song) => setSelectedSong(song);
  const handleCloseModal = () => setSelectedSong(null);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/20">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg">Sanctuary's Library</h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <ThemeSelector />
                <AdminButton />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-primary/20 text-primary hover:bg-primary/10 text-xs px-2 py-1"
                >
                  <Link to="/auth">
                    <LogIn className="w-3 h-3 mr-1" />
                    Sign In
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 text-xs px-2 py-1"
                >
                  <Link to="/choir-signup">
                    <Users className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search hymns or lyrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-5 text-base bg-background/80 backdrop-blur-sm border-border shadow rounded-xl focus:ring-2 focus:ring-primary/50 font-medium"
            />
          </div>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Feature Cards (only when not searching & not signed in) */}
        {!searchTerm && !user && (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-background to-primary/5 border-border/20 shadow hover:shadow-lg transition">
                <CardContent className="p-4 text-center">
                  <h3 className="font-display font-bold text-base mb-2">Timeless Hymns</h3>
                  <p className="text-xs text-muted-foreground">Classic hymns for worship</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-background to-accent/5 border-border/20 shadow hover:shadow-lg transition">
                <CardContent className="p-4 text-center">
                  <h3 className="font-display font-bold text-base mb-2">Beautiful Lyrics</h3>
                  <p className="text-xs text-muted-foreground">Inspiring meaningful words</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Song Library */}
        <SongLibrary
          searchTerm={searchTerm}
          onSongSelect={handleSongSelect}
          userRole={userRole}
        />
      </main>

      {/* Song Modal */}
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
