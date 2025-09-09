import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Filter, X, Loader2 } from "lucide-react";
import SongCard from "./SongCard";
import { useSongs, useCategories, type Song } from "@/hooks/useSongs";
import { toSentenceCase } from "@/utils/textUtils";

interface SongLibraryProps {
  searchTerm: string;
  onSongSelect: (song: Song) => void;
  userRole?: 'admin' | 'choir_member' | 'guest' | null;
}

const SongLibrary = ({ searchTerm, onSongSelect, userRole }: SongLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: songs = [], isLoading } = useSongs(searchTerm, selectedCategory, userRole);
  const { data: categories = [] } = useCategories();

  // Show categories only for choir members, admins, and super admins
  const canSeeFilters = userRole === 'choir_member' || userRole === 'admin';
  
  // For guests without search, don't show results
  const showResults = userRole !== 'guest' || searchTerm.trim().length > 0;

  const clearFilters = () => {
    setSelectedCategory("all");
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading songs...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
        /* Mobile responsive section */
        <section className="py-8 md:py-16 px-4 overflow-x-hidden">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                Song Library
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore our collection of sacred hymns and worship songs
              </p>
            </div>

        {/* Filters and Controls */}
        {canSeeFilters && (
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Category Filters */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
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
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {songs.length === 1 
                ? "1 song found" 
                : `${songs.length} songs found`
              }
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
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              : "space-y-4"
          }>
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No songs found</h3>
            <p className="text-muted-foreground mb-6">
              {userRole === 'guest' 
                ? "Try searching for hymn numbers or lyrics" 
                : "Try adjusting your search or filter criteria"
              }
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
        {!showResults && userRole === 'guest' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Search to explore hymns</h3>
            <p className="text-muted-foreground">
              Use the search bar above to find hymns by number or lyrics
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SongLibrary;