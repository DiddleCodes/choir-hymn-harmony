import { Search, Music, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hymnal-hero.jpg";

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const HeroSection = ({ searchTerm, onSearchChange }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden mobile-fade-in">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 mobile-scale-in">
        <img
          src={heroImage}
          alt="Sacred music background"
          className="w-full h-full object-cover mobile-transition"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sacred-deep/70 via-sacred-deep/50 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mobile-slide-up">
        <div className="mb-4 md:mb-6">
          <Music className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-3 md:mb-5 text-primary mobile-bounce-in" />
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-2 md:mb-4 text-white mobile-fade-in">
            Sanctuary&apos;s
            <span className="text-primary ml-2">Library</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 font-light max-w-xl mx-auto leading-snug mobile-fade-in">
            A collection of Hymns and Songs for Worship, Choir, and hearts seeking
            divine melody.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto px-2 sm:px-0 mobile-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search hymns, songs, or lyrics..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-3 py-3 text-base bg-white border-0 shadow-sacred rounded-xl 
              focus:ring-2 focus:ring-primary/50 
              text-gray-900 placeholder:text-gray-500 w-full font-medium mobile-transition"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mt-6 md:mt-10 text-white/80 px-2 mobile-fade-in">
          <div className="flex items-center gap-1.5 mobile-transition hover:text-primary">
            <Heart className="w-4 h-4 text-primary" />
            <span className="font-medium text-xs md:text-sm">Timeless Hymns</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block" />
          <div className="flex items-center gap-1.5 mobile-transition hover:text-primary">
            <Music className="w-4 h-4 text-primary" />
            <span className="font-medium text-xs md:text-sm">Beautiful Lyrics</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block" />
          <div className="flex items-center gap-1.5 mobile-transition hover:text-primary">
            <Music className="w-4 h-4 text-primary" />
            <span className="font-medium text-xs md:text-sm">Song Collection</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
