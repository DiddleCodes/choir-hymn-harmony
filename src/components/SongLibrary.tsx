import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Filter, X, Loader2 } from "lucide-react";
import SongCard from "./SongCard";
import { useSongs, useCategories, type Song } from "@/hooks/useSongs";

interface SongLibraryProps {
  searchTerm: string;
  onSongSelect: (song: Song) => void;
}

const SongLibrary = ({ searchTerm, onSongSelect }: SongLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: songs = [], isLoading } = useSongs(searchTerm, selectedCategory);
  const { data: categories = [] } = useCategories();

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
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Song Library
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of sacred hymns and worship songs
          </p>
        </div>

        {/* Filters and Controls */}
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
                  {category.name}
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

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {songs.length === 1 
              ? "1 song found" 
              : `${songs.length} songs found`
            }
          </p>
          {(selectedCategory !== "all" || searchTerm) && (
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

        {/* Songs Grid/List */}
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onSelect={onSongSelect}
            />
          ))}
        </div>

        {/* Empty State */}
        {songs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No songs found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={clearFilters} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SongLibrary;