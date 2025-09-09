import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
import type { Song } from "@/hooks/useSongs";
import { toSentenceCase } from "@/utils/textUtils";

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
  searchTerm?: string;
}

const HighlightedText = ({ text, searchTerm }: { text: string; searchTerm: string }) => {
  if (!searchTerm) return <>{text}</>;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-primary/20 text-primary rounded px-1">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const SongCard = ({ song, onSelect, searchTerm = "" }: SongCardProps) => {
  return (
    <Card className="group cursor-pointer card-hover transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 animate-fade-in mobile-button-press" onClick={() => onSelect(song)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {toSentenceCase(song.type)}
              </Badge>
              {song.hymnNumber && (
                <Badge variant="secondary" className="text-xs">
                  #{song.hymnNumber}
                </Badge>
              )}
              {song.number && (
                <Badge variant="secondary" className="text-xs">
                  Song #{song.number}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              <HighlightedText text={song.title} searchTerm={searchTerm} />
            </h3>
            {song.author && (
              <p className="text-sm text-muted-foreground">
                by <HighlightedText text={song.author} searchTerm={searchTerm} />
              </p>
            )}
            {(song.category || song.tags?.length) && (
              <div className="flex flex-wrap gap-1">
                {song.category && (
                  <Badge variant="outline" className="text-xs">
                    <HighlightedText text={toSentenceCase(song.category)} searchTerm={searchTerm} />
                  </Badge>
                )}
                {song.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <HighlightedText text={tag} searchTerm={searchTerm} />
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Lyrics Preview */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {song.type === 'hymn' 
                ? song.englishLyrics?.[0] || 'English lyrics available'
                : song.lyrics?.[0] || 'Lyrics available'
              }
            </p>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <Music className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongCard;