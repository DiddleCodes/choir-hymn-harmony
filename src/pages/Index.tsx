import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import SongLibrary from "@/components/SongLibrary";
import SongModal from "@/components/SongModal";
import type { Song } from "@/data/songs";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <SongLibrary 
        searchTerm={searchTerm}
        onSongSelect={handleSongSelect}
      />
      <SongModal 
        song={selectedSong}
        isOpen={!!selectedSong}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
