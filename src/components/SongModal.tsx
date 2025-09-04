import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Music, User, Calendar, FileText, Heart, Share2 } from "lucide-react";
import type { Song } from "@/data/songs";

interface SongModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

const SongModal = ({ song, isOpen, onClose }: SongModalProps) => {
  if (!song) return null;

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
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-card/30">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-display font-semibold mb-2 pr-8">
                {song.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {song.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Written by {song.author}</span>
                  </div>
                )}
                {song.composer && (
                  <div className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    <span>Composed by {song.composer}</span>
                  </div>
                )}
                {song.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{song.year}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className={getCategoryColor(song.category)}>
                  {song.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{song.verses} verses</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[60vh] p-6">
            <div className="space-y-8">
              {/* Lyrics */}
              <div className="space-y-6">
                {song.lyrics.map((verse, index) => (
                  <Card key={index} className="bg-card/20 border-border/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <pre className="font-body text-foreground leading-relaxed whitespace-pre-wrap">
                            {verse}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tags */}
              {song.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-muted-foreground">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {song.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-muted/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t bg-card/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Add to Favorites
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SongModal;