import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List, Filter, X, ArrowUp } from "lucide-react";
import SongCard from "./SongCard";
import { useSongs, useCategories, type Song } from "@/hooks/useSongs";
import { toSentenceCase } from "@/utils/textUtils";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface SongLibraryProps {
  searchTerm: string;
  onSongSelect: (song: Song) => void;
  userRole?: "super_admin" | "admin" | "choir_member" | "guest" | null;
}

const SongLibrary = ({ searchTerm, onSongSelect, userRole }: SongLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: songs = [], isLoading } = useSongs(searchTerm, selectedCategory, userRole);
  const { data: categories = [] } = useCategories();

  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Show categories only for choir members, admins, and super admins
  const canSeeFilters =
    userRole === "choir_member" || userRole === "admin" || userRole === "super_admin";

  // For guests without search, don't show results
  const showResults = userRole !== "guest" || searchTerm.trim().length > 0;

  const clearFilters = () => {
    setSelectedCategory("all");
  };

  // Auto-scroll to results when searching
  useEffect(() => {
    if (searchTerm.trim().length > 0 && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchTerm]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="bass-clef-loader text-4xl text-primary">𝄢</div>
            <span className="ml-3 text-muted-foreground">Loading songs...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    /* Mobile responsive section with animation */
    <section
      ref={sectionRef}
      className="py-6 md:py-10 px-4 overflow-x-hidden mobile-fade-in"
    >
      <div className="container mx-auto max-w-7xl">
{/* Header (only show if no search term) */}
{searchTerm.trim().length === 0 && (
  <div className="text-center mb-4 md:mb-6">
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-1">
      Song Library
    </h2>
    <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
      Explore our collection of sacred hymns and worship songs
    </p>
  </div>
)}


        {/* Filters and Controls */}
        {canSeeFilters && (
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Category Filters */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Categories</span>
              </div>

              {/* Mobile Dropdown */}
              <div className="block lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {selectedCategory === "all"
                        ? "All Songs"
                        : toSentenceCase(
                            categories.find((c) => c.id === selectedCategory)?.name || ""
                          )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {toSentenceCase(category.name)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Inline Buttons */}
              <div className="hidden lg:flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="transition-gentle"
                  >
                    {toSentenceCase(category.name)}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {showResults && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {songs.length === 1 ? "1 song found" : `${songs.length} songs found`}
            </p>
            {(selectedCategory !== "all" || searchTerm) && canSeeFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Songs Grid/List */}
        {showResults && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onSelect={onSongSelect}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {showResults && songs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">No songs found</h3>
            <p className="text-muted-foreground mb-4">
              {userRole === "guest"
                ? "Try searching for hymn numbers or lyrics"
                : "Try adjusting your search or filter criteria"}
            </p>
            {canSeeFilters && (
              <Button onClick={clearFilters} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Guest Message */}
        {!showResults && userRole === "guest" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Search to explore hymns</h3>
            <p className="text-muted-foreground">
              Use the search bar above to find hymns by number or lyrics
            </p>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 
                       p-2 md:p-3 rounded-full bg-primary text-white 
                       shadow-lg transition 
                       opacity-80 hover:opacity-100 hover:bg-primary/90"
          >
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SongLibrary;
