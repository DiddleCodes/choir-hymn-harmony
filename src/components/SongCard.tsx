import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
import type { Song } from "@/hooks/useSongs";
import { toSentenceCase } from "@/utils/textUtils";
import { motion } from "framer-motion";

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
  searchTerm?: string;
}

const HighlightedText = ({ text, searchTerm }: { text: string; searchTerm: string }) => {
  if (!searchTerm) return <>{text}</>;

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-primary rounded px-1 font-medium"
          >
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
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      onClick={() => onSelect(song)}
      className="cursor-pointer"
    >
      <Card
        className="group relative overflow-hidden rounded-2xl border border-border/40
                   bg-gradient-to-br from-background/70 to-background/30 
                   backdrop-blur-xl shadow-sm hover:shadow-lg
                   transition-all duration-300"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition 
                        bg-gradient-to-r from-primary/5 via-accent/5 to-transparent" />

        <CardContent className="relative p-6 flex items-start gap-4">
          {/* Left side - Song Info */}
          <div className="flex-1 space-y-2">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs tracking-wide font-medium bg-background/60 backdrop-blur-sm"
              >
                {toSentenceCase(song.type)}
              </Badge>
              {song.hymnNumber && (
                <Badge variant="secondary" className="text-xs bg-primary/10">
                  Hymn #{song.hymnNumber}
                </Badge>
              )}
              {song.number && (
                <Badge variant="secondary" className="text-xs bg-accent/10">
                  Song #{song.number}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-display font-semibold text-lg md:text-xl leading-snug 
                           group-hover:text-primary transition-colors line-clamp-2">
              <HighlightedText text={song.title} searchTerm={searchTerm} />
            </h3>

            {/* Author */}
            {song.author && (
              <p className="text-sm text-muted-foreground italic">
                by <HighlightedText text={song.author} searchTerm={searchTerm} />
              </p>
            )}

            {/* Categories & Tags */}
            {(song.category || song.tags?.length) && (
              <div className="flex flex-wrap gap-1.5">
                {song.category && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-background/60 backdrop-blur-sm"
                  >
                    <HighlightedText
                      text={toSentenceCase(song.category)}
                      searchTerm={searchTerm}
                    />
                  </Badge>
                )}
                {song.tags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-muted/40 backdrop-blur-sm"
                  >
                    <HighlightedText text={tag} searchTerm={searchTerm} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Lyrics Preview */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-2">
              {song.type === "hymn"
                ? song.englishLyrics?.[0] || "English lyrics available"
                : song.lyrics?.[0] || "Lyrics available"}
            </p>
          </div>

          {/* Right side - Icon */}
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="flex-shrink-0 self-start mt-1"
          >
            <Music className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SongCard;
