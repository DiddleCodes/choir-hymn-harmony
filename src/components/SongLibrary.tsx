import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filter, Grid, List } from "lucide-react";
import { songs, categories, type Song } from "@/data/songs";
import SongCard from "./SongCard";

interface SongLibraryProps {
  searchTerm: string;
  onSongSelect: (song: Song) => void;
}

const SongLibrary = ({ searchTerm, onSongSelect }: SongLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredSongs = useMemo(() => {
    let filtered = songs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(song => song.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(search) ||
        song.author?.toLowerCase().includes(search) ||
        song.composer?.toLowerCase().includes(search) ||
        song.lyrics.some(verse => verse.toLowerCase().includes(search)) ||
        song.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-semibold mb-2 text-center">
          Song Library
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Discover sacred songs and hymns from various traditions and time periods.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8 bg-card/30 backdrop-blur-sm border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground mr-2" />
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {filteredSongs.length === 0 ? 'No songs found' : 
           filteredSongs.length === 1 ? '1 song found' :
           `${filteredSongs.length} songs found`}
          {searchTerm && (
            <span> for "{searchTerm}"</span>
          )}
        </p>
      </div>

      {/* Song Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onSelect={onSongSelect}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSongs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No songs found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or category filters
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </section>
  );
};

export default SongLibrary;