import { useState, useEffect } from "react";
import { Search, X, Music, Filter, Mic, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  popularSearches?: string[];
}

export const MobileSearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search hymns and songs...",
  recentSearches = [],
  popularSearches = ["Amazing Grace", "How Great Thou Art", "Blessed Assurance", "Victory", "Praise"]
}: MobileSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock suggestions based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const mockSuggestions = [
        `${searchTerm}...`,
        `"${searchTerm}" in lyrics`,
        `Hymn ${searchTerm}`,
        `${searchTerm} by author`,
      ].filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      setSuggestions(mockSuggestions.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleClearSearch = () => {
    onSearchChange("");
    setIsFocused(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion.replace(/"/g, '').replace(' in lyrics', '').replace('Hymn ', '').replace(' by author', ''));
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Search Input */}
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'scale-105' : 'hover:scale-102'
      }`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors duration-200 ${
            isFocused ? 'text-primary animate-pulse' : 'text-muted-foreground'
          }`} />
        </div>
        
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className={`pl-12 pr-12 h-12 text-base rounded-2xl bg-background/60 backdrop-blur-sm border-2 transition-all duration-300 ${
            isFocused 
              ? 'border-primary shadow-lg shadow-primary/25 bg-background/90' 
              : 'border-border/30 hover:border-border/50'
          }`}
        />
        
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="p-1 h-8 w-8 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      {isFocused && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-0 shadow-2xl border-border/20 bg-background/95 backdrop-blur-lg z-50 animate-fade-in">
          <ScrollArea className="max-h-96">
            <div className="p-4 space-y-4">
              
              {/* Live Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Suggestions</h3>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-10 px-3 hover:bg-primary/10 hover:text-primary hover-scale"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="truncate">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && suggestions.length === 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Recent</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors hover-scale"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {searchTerm.length === 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Popular</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all hover-scale"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        <Music className="w-3 h-3 mr-1" />
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Search (Future Feature) */}
              <div className="pt-2 border-t border-border/20">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-10 px-3 text-muted-foreground hover:text-accent hover:bg-accent/10"
                  disabled
                >
                  <Mic className="w-4 h-4 mr-3" />
                  <span>Voice Search</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Coming Soon
                  </Badge>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};