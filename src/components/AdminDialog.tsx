import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSongs, useCategories, useInvalidateSongs } from '@/hooks/useSongs';

interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
}

const AdminDialog = ({ open, onClose }: AdminDialogProps) => {
  const { toast } = useToast();
  const { data: songs = [], isLoading: songsLoading } = useSongs();
  const { data: categories = [] } = useCategories();
  const invalidateSongs = useInvalidateSongs();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSong, setEditingSong] = useState<string | null>(null);
  
  const [newSong, setNewSong] = useState({
    title: '',
    author: '',
    composer: '',
    category: '',
    lyrics: '',
    year: '',
    number: '',
    tags: '',
  });

  const resetForm = () => {
    setNewSong({
      title: '',
      author: '',
      composer: '',
      category: '',
      lyrics: '',
      year: '',
      number: '',
      tags: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.lyrics || !newSong.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', newSong.category)
        .single();

      if (!categoryData) {
        throw new Error('Category not found');
      }

      // Create the item
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .insert({
          title: newSong.title,
          author: newSong.author || null,
          composer: newSong.composer || null,
          category_id: categoryData.id,
          year_written: newSong.year ? parseInt(newSong.year) : null,
          number: newSong.number ? parseInt(newSong.number) : null,
          tags: newSong.tags ? newSong.tags.split(',').map(t => t.trim()) : [],
        })
        .select('id')
        .single();

      if (itemError) throw itemError;

      // Create the primary version with lyrics
      const { error: versionError } = await supabase
        .from('item_versions')
        .insert({
          item_id: itemData.id,
          lyrics: newSong.lyrics,
          is_primary: true,
        });

      if (versionError) throw versionError;

      toast({
        title: "Success",
        description: "Song added successfully",
      });

      resetForm();
      invalidateSongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add song",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const { error } = await supabase
        .from('items')
        .update({ is_active: false })
        .eq('id', songId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Song deleted successfully",
      });

      invalidateSongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete song",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="font-display text-2xl">Admin Panel</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="add" className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Song</TabsTrigger>
              <TabsTrigger value="manage">Manage Songs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="add" className="p-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    placeholder="Song title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newSong.category} onValueChange={(value) => setNewSong({...newSong, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.id !== 'all').map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={newSong.author}
                    onChange={(e) => setNewSong({...newSong, author: e.target.value})}
                    placeholder="Song author"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="composer">Composer</Label>
                  <Input
                    id="composer"
                    value={newSong.composer}
                    onChange={(e) => setNewSong({...newSong, composer: e.target.value})}
                    placeholder="Song composer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newSong.year}
                    onChange={(e) => setNewSong({...newSong, year: e.target.value})}
                    placeholder="Year written"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Hymn Number</Label>
                  <Input
                    id="number"
                    type="number"
                    value={newSong.number}
                    onChange={(e) => setNewSong({...newSong, number: e.target.value})}
                    placeholder="Hymn number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={newSong.tags}
                    onChange={(e) => setNewSong({...newSong, tags: e.target.value})}
                    placeholder="grace, love, worship"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lyrics">Lyrics *</Label>
                <Textarea
                  id="lyrics"
                  value={newSong.lyrics}
                  onChange={(e) => setNewSong({...newSong, lyrics: e.target.value})}
                  placeholder="Enter lyrics here... Separate verses with double line breaks"
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Separate verses with double line breaks (press Enter twice)
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Song
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Clear
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="manage" className="p-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">All Songs</h3>
                <Badge variant="secondary">{songs.length} songs</Badge>
              </div>
              
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {songsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : songs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No songs found
                    </div>
                  ) : (
                    songs.map((song) => (
                      <Card key={song.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{song.title}</h4>
                            {(song.author || song.composer) && (
                              <p className="text-sm text-muted-foreground">
                                {song.author && song.composer 
                                  ? `${song.author} • ${song.composer}`
                                  : song.author || song.composer
                                }
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{song.category}</Badge>
                              {song.year && <Badge variant="secondary">{song.year}</Badge>}
                              {song.number && <Badge variant="secondary">#{song.number}</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(song.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;