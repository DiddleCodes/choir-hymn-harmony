import { Search, Music, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hymnal-hero.jpg";

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const HeroSection = ({ searchTerm, onSearchChange }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Sacred music background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sacred-deep/70 via-sacred-deep/50 to-background/90" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <Music className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-white">
            Sanctuary's
            <span className="text-primary ml-4">Library</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
            A beautiful collection of Hymns and Songs for Congregational Worship, 
            Choir and hearts seeking divine melody.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search hymns, songs, or lyrics..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-sacred rounded-2xl focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center items-center gap-8 mt-12 text-white/80">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-medium">Timeless Hymns</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-medium">Beautiful Lyrics</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-2">
            <span className="font-medium">Song Collection</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;