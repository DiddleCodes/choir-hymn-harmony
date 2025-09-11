import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List, Filter, X, ArrowUp, Music } from "lucide-react";
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

  const canSeeFilters =
    userRole === "choir_member" || userRole === "admin" || userRole === "super_admin";

  const showResults = userRole !== "guest" || searchTerm.trim().length > 0;

  const clearFilters = () => setSelectedCategory("all");

  // Scroll to results on search
  useEffect(() => {
    if (searchTerm.trim().length > 0 && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchTerm]);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Skeleton Loader
  if (isLoading) {
    return (
      <section className="py-16 px-6 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading songs...</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-6 md:py-10 px-4 overflow-x-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header (only show if no search term) */}
        {searchTerm.trim().length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-2">
              Song Library
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Explore our collection of sacred hymns and worship songs
            </p>
          </motion.div>
        )}

        {/* Filters & Controls */}
        {canSeeFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-6 mb-8"
          >
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
                    className="rounded-full shadow-sm hover:shadow-md transition"
                  >
                    {toSentenceCase(category.name)}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <div className="flex bg-muted rounded-xl p-1 shadow-inner">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9 p-0 rounded-lg"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9 p-0 rounded-lg"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
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
          </motion.div>
        )}

        {/* Songs Grid/List */}
        {showResults && (
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {songs.map((song) => (
                <motion.div
                  key={song.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  <SongCard
                    song={song}
                    onSelect={onSongSelect}
                    searchTerm={searchTerm}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {showResults && songs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-muted-foreground" />
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
          </motion.div>
        )}

        {/* Guest Message */}
        {!showResults && userRole === "guest" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Search to explore hymns</h3>
            <p className="text-muted-foreground">
              Use the search bar above to find hymns by number or lyrics
            </p>
          </motion.div>
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
                       p-3 rounded-full bg-primary text-white shadow-lg 
                       hover:scale-110 transition-transform"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SongLibrary;
