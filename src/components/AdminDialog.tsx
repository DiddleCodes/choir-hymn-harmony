import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSongs, useCategories, useInvalidateSongs } from '@/hooks/useSongs';

interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  userRole?: 'super_admin' | 'admin' | 'choir_member' | 'guest' | null;
}

const AdminDialog = ({ open, onClose, userRole }: AdminDialogProps) => {
  if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin')) {
    return null;
  }

  const { toast } = useToast();
  const { data: songs = [], isLoading: songsLoading } = useSongs();
  const { data: categories = [] } = useCategories();
  const invalidateSongs = useInvalidateSongs();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSong, setEditingSong] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newSong, setNewSong] = useState({
    title: '',
    author: '',
    composer: '',
    type: 'song' as 'song' | 'hymn',
    category: '', // will hold category.id
    lyrics: '',
    englishLyrics: '',
    yorubaLyrics: '',
    hymnNumber: '',
    year: '',
    number: '',
    tags: '',
  });

  const resetForm = () => {
    setNewSong({
      title: '',
      author: '',
      composer: '',
      type: 'song',
      category: '',
      lyrics: '',
      englishLyrics: '',
      yorubaLyrics: '',
      hymnNumber: '',
      year: '',
      number: '',
      tags: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isHymn = newSong.type === 'hymn';

    if (!newSong.title || !newSong.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (isHymn && (!newSong.englishLyrics || !newSong.yorubaLyrics)) {
      toast({
        title: 'Error',
        description: 'Please provide both English and Yoruba lyrics for hymns',
        variant: 'destructive',
      });
      return;
    }

    if (!isHymn && !newSong.lyrics) {
      toast({
        title: 'Error',
        description: 'Please provide lyrics for the song',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        title: newSong.title,
        author: newSong.author || null,
        composer: newSong.composer || null,
        type: newSong.type,
        category_id: newSong.category, // ✅ now using ID directly
        year_written: newSong.year ? parseInt(newSong.year) : null,
        number: newSong.number ? parseInt(newSong.number) : null,
        hymn_number: isHymn && newSong.hymnNumber ? parseInt(newSong.hymnNumber) : null,
        english_lyrics: isHymn ? newSong.englishLyrics : null,
        yoruba_lyrics: isHymn ? newSong.yorubaLyrics : null,
        tags: newSong.tags ? newSong.tags.split(',').map((t) => t.trim()) : [],
      };

      const { data: createdItems, error: itemError } = await supabase
        .from('items')
        .insert(itemData)
        .select('id');

      if (itemError) throw itemError;

      const createdItem = createdItems?.[0];
      if (!createdItem) throw new Error('Item creation failed');

      if (!isHymn) {
        const { error: versionError } = await supabase.from('item_versions').insert({
          item_id: createdItem.id,
          lyrics: newSong.lyrics,
          is_primary: true,
        });

        if (versionError) throw versionError;
      }

      toast({
        title: 'Success',
        description: `${newSong.type === 'hymn' ? 'Hymn' : 'Song'} added successfully`,
      });

      resetForm();
      invalidateSongs();
    } catch (error: any) {
      console.error('Add song error:', error); // ✅ better debugging
      toast({
        title: 'Error',
        description: error.message || `Failed to add ${newSong.type}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (song: any) => {
    setEditingSong(song.id);
    setIsEditing(true);
    setNewSong({
      title: song.title || '',
      author: song.author || '',
      composer: song.composer || '',
      type: song.type || 'song',
      category: song.category_id || '', // ✅ use category_id here
      lyrics: song.lyrics || '',
      englishLyrics: song.englishLyrics || song.english_lyrics || '',
      yorubaLyrics: song.yorubaLyrics || song.yoruba_lyrics || '',
      hymnNumber: song.hymnNumber?.toString() || song.hymn_number?.toString() || '',
      year: song.year?.toString() || song.year_written?.toString() || '',
      number: song.number?.toString() || '',
      tags: song.tags?.join(', ') || '',
    });
  };

  // handleSaveEdit + handleDelete remain unchanged...

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="font-display text-2xl">Admin Panel</DialogTitle>
        </DialogHeader>

        <Tabs value={isEditing ? 'add' : 'manage'} className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" disabled={isEditing}>
                {isEditing ? 'Edit Song' : 'Add Song'}
              </TabsTrigger>
              <TabsTrigger value="manage" disabled={isEditing}>
                Manage Songs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="add" className="p-6 pt-4">
            <ScrollArea className="h-[600px]">
              <form onSubmit={isEditing ? () => {} : handleSubmit} className="space-y-6 pr-4">
                {/* Required fields */}
                <div>
                  <Label htmlFor="title">Song Title *</Label>
                  <Input
                    id="title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newSong.category}
                    onValueChange={(value) => setNewSong({ ...newSong, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lyrics / hymn fields etc. ... keep your existing UI */}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add {newSong.type === 'hymn' ? 'Hymn' : 'Song'}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Clear Form
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>

          {/* Manage tab stays same */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;