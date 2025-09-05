import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Calendar, User, FileText } from "lucide-react";
import type { Song } from "@/hooks/useSongs";

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
}

const SongCard = ({ song, onSelect }: SongCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'traditional': return 'bg-primary/10 text-primary border-primary/20';
      case 'contemporary': return 'bg-accent/10 text-accent border-accent/20';
      case 'seasonal': return 'bg-sacred-burgundy/10 text-sacred-burgundy border-sacred-burgundy/20';
      case 'psalms': return 'bg-sacred-deep/10 text-sacred-deep border-sacred-deep/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="group hover:shadow-sacred transition-sacred cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-display group-hover:text-primary transition-gentle line-clamp-2">
              {song.title}
            </CardTitle>
            {(song.author || song.composer) && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {song.author && song.composer 
                    ? `${song.author} • ${song.composer}`
                    : song.author || song.composer
                  }
                </span>
              </div>
            )}
          </div>
          <Badge variant="outline" className={getCategoryColor(song.category)}>
            {song.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Lyrics Preview */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {song.lyrics[0]?.replace(/\n/g, ' ')}
          </p>
          
          {/* Song Details */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{song.verses} verses</span>
              </div>
              {song.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{song.year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {song.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {song.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(song)}
            className="w-full mt-3 group-hover:bg-primary/5 group-hover:text-primary transition-gentle"
          >
            <Music className="w-4 h-4 mr-2" />
            View Lyrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongCard;