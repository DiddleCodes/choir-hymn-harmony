import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Music,
  User,
  Calendar,
  FileText,
  Heart,
  Share2,
  List,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import type { Song } from "@/hooks/useSongs";
import { toSentenceCase } from "@/utils/textUtils";

interface SongModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

const SongModal = ({ song, isOpen, onClose }: SongModalProps) => {
  const [viewMode, setViewMode] = useState<"english" | "yoruba" | "bilingual">(
    "bilingual"
  );
  const [layout, setLayout] = useState<"list" | "card">("card");
  const [fontSize, setFontSize] = useState<number>(16);

  if (!song) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "traditional":
        return "bg-primary/10 text-primary border-primary/20";
      case "contemporary":
        return "bg-accent/10 text-accent border-accent/20";
      case "seasonal":
        return "bg-sacred-burgundy/10 text-sacred-burgundy border-sacred-burgundy/20";
      case "psalms":
        return "bg-sacred-deep/10 text-sacred-deep border-sacred-deep/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-card/30">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-display font-semibold mb-2 pr-8">
                {toSentenceCase(song.title)}
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
                <Badge
                  variant="outline"
                  className={getCategoryColor(song.category)}
                >
                  {toSentenceCase(song.category)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>
                    {song.type === "hymn"
                      ? `${(song.englishLyrics?.length || 0)} verses`
                      : `${song.verses} verses`}
                  </span>
                </div>
                {song.type === "hymn" && song.hymnNumber && (
                  <Badge variant="secondary">Hymn #{song.hymnNumber}</Badge>
                )}
                {song.type === "song" && song.number && (
                  <Badge variant="secondary">#{song.number}</Badge>
                )}
              </div>

              {/* Toggles */}
              {song.type === "hymn" && song.yorubaLyrics && (
                <div className="space-y-3 mt-3 pt-3 border-t border-border/30">
                  {/* Language Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      View:
                    </span>
                    <div className="flex flex-1 bg-muted/40 rounded-lg overflow-hidden">
                      {["english", "yoruba", "bilingual"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode as any)}
                          className={`flex-1 px-3 py-2 text-xs ${
                            viewMode === mode
                              ? "bg-primary text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {mode === "english"
                            ? "English"
                            : mode === "yoruba"
                            ? "Yoruba"
                            : "Both"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layout Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Layout:
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant={layout === "list" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setLayout("list")}
                        className="h-8 w-8"
                        title="List View"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={layout === "card" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setLayout("card")}
                        className="h-8 w-8"
                        title="Card View"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Font Size Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Font:
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFontSize((s) => Math.max(12, s - 2))}
                        className="h-7 px-2 text-xs"
                      >
                        A-
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFontSize(16)}
                        className="h-7 px-2 text-xs"
                      >
                        A
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                        className="h-7 px-2 text-xs"
                      >
                        A+
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[70vh] p-6">
            <div className="space-y-8">
              <div className="space-y-6">
                {song.type === "hymn"
                  ? song.englishLyrics?.map((englishVerse, index) => {
                      const yorubaVerse = song.yorubaLyrics?.[index];

                      // Select verses to show based on view mode
                      let versesToRender: { label: string; text: string }[] = [];
                      if (viewMode === "english")
                        versesToRender = [
                          { label: "English", text: englishVerse },
                        ];
                      else if (viewMode === "yoruba" && yorubaVerse)
                        versesToRender = [
                          { label: "Yoruba", text: yorubaVerse },
                        ];
                      else if (viewMode === "bilingual") {
                        versesToRender = [
                          { label: "English", text: englishVerse },
                          ...(yorubaVerse
                            ? [{ label: "Yoruba", text: yorubaVerse }]
                            : []),
                        ];
                      }

                      return (
                        <div key={index}>
                          {layout === "card" ? (
                            <Card className="bg-card/20 border-border/30 mb-4">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {versesToRender.map((v, idx) => (
                                      <div key={idx}>
                                        <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                          {v.label}
                                        </h5>
                                        <pre
                                          className="font-body text-foreground leading-relaxed whitespace-pre-wrap"
                                          style={{ fontSize }}
                                        >
                                          {v.text}
                                        </pre>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-primary">
                                Verse {index + 1}
                              </h5>
                              {versesToRender.map((v, idx) => (
                                <pre
                                  key={idx}
                                  className="font-body text-foreground leading-relaxed whitespace-pre-wrap"
                                  style={{ fontSize }}
                                >
                                  {v.text}
                                </pre>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  : song.lyrics.map((verse, index) => (
                      <Card
                        key={index}
                        className="bg-card/20 border-border/30 mb-4"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <pre
                                className="font-body text-foreground leading-relaxed whitespace-pre-wrap"
                                style={{ fontSize }}
                              >
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
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-muted/50"
                      >
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
