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
  userRole?: 'super_admin' | 'admin' | 'choir_member' | 'guest' | null;
}

const AdminDialog = ({ open, onClose, userRole }: AdminDialogProps) => {
  // Only allow admins and super admins to access
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
    category: '',
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
      type: 'song' as 'song' | 'hymn',
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
    
    // Validation based on type
    if (!newSong.title || !newSong.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isHymn && (!newSong.englishLyrics || !newSong.yorubaLyrics)) {
      toast({
        title: "Error",
        description: "Please provide both English and Yoruba lyrics for hymns",
        variant: "destructive",
      });
      return;
    }
    
    if (!isHymn && !newSong.lyrics) {
      toast({
        title: "Error",
        description: "Please provide lyrics for the song",
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
      const itemData = {
        title: newSong.title,
        author: newSong.author || null,
        composer: newSong.composer || null,
        type: newSong.type,
        category_id: categoryData.id,
        year_written: newSong.year ? parseInt(newSong.year) : null,
        number: newSong.number ? parseInt(newSong.number) : null,
        hymn_number: isHymn && newSong.hymnNumber ? parseInt(newSong.hymnNumber) : null,
        english_lyrics: isHymn ? newSong.englishLyrics : null,
        yoruba_lyrics: isHymn ? newSong.yorubaLyrics : null,
        tags: newSong.tags ? newSong.tags.split(',').map(t => t.trim()) : [],
      };

      const { data: createdItem, error: itemError } = await supabase
        .from('items')
        .insert(itemData)
        .select('id')
        .single();

      if (itemError) throw itemError;

      // For songs, create primary version with lyrics; hymns store lyrics directly
      if (!isHymn) {
        const { error: versionError } = await supabase
          .from('item_versions')
          .insert({
            item_id: createdItem.id,
            lyrics: newSong.lyrics,
            is_primary: true,
          });

        if (versionError) throw versionError;
      }
      toast({
        title: "Success",
        description: `${newSong.type === 'hymn' ? 'Hymn' : 'Song'} added successfully`,
      });

      resetForm();
      invalidateSongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to add ${newSong.type}`,
        variant: "destructive",
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
      category: song.category || '',
      lyrics: song.lyrics || '',
      englishLyrics: song.englishLyrics || song.english_lyrics || '',
      yorubaLyrics: song.yorubaLyrics || song.yoruba_lyrics || '',
      hymnNumber: song.hymnNumber?.toString() || song.hymn_number?.toString() || '',
      year: song.year?.toString() || song.year_written?.toString() || '',
      number: song.number?.toString() || '',
      tags: song.tags?.join(', ') || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    const isHymn = newSong.type === 'hymn';
    
    // Validation
    if (!newSong.title || !newSong.category) {
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

      // Update the item
      const itemData = {
        title: newSong.title,
        author: newSong.author || null,
        composer: newSong.composer || null,
        type: newSong.type,
        category_id: categoryData.id,
        year_written: newSong.year ? parseInt(newSong.year) : null,
        number: newSong.number ? parseInt(newSong.number) : null,
        hymn_number: isHymn && newSong.hymnNumber ? parseInt(newSong.hymnNumber) : null,
        english_lyrics: isHymn ? newSong.englishLyrics : null,
        yoruba_lyrics: isHymn ? newSong.yorubaLyrics : null,
        tags: newSong.tags ? newSong.tags.split(',').map(t => t.trim()) : [],
      };

      const { error: itemError } = await supabase
        .from('items')
        .update(itemData)
        .eq('id', editingSong);

      if (itemError) throw itemError;

      // For songs, update primary version with lyrics
      if (!isHymn) {
        const { error: versionError } = await supabase
          .from('item_versions')
          .update({ lyrics: newSong.lyrics })
          .eq('item_id', editingSong)
          .eq('is_primary', true);

        if (versionError) throw versionError;
      }

      toast({
        title: "Success",
        description: `${newSong.type === 'hymn' ? 'Hymn' : 'Song'} updated successfully`,
      });

      setIsEditing(false);
      setEditingSong(null);
      resetForm();
      invalidateSongs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${newSong.type}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSong(null);
    resetForm();
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

        <Tabs defaultValue={isEditing ? "add" : "add"} className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" disabled={isEditing}>
                {isEditing ? "Edit Song" : "Add Song"}
              </TabsTrigger>
              <TabsTrigger value="manage" disabled={isEditing}>Manage Songs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="add" className="p-6 pt-4">
            <ScrollArea className="h-[600px]">
              <form onSubmit={isEditing ? handleSaveEdit : handleSubmit} className="space-y-6 pr-4">
                 {/* Type Selection */}
                 <div className="border rounded-lg p-4 bg-primary/5">
                   <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 bg-primary rounded-full"></span>
                     Content Type
                   </h4>
                   <div>
                     <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
                     <Select value={newSong.type} onValueChange={(value: 'song' | 'hymn') => setNewSong({...newSong, type: value})}>
                       <SelectTrigger className="mt-1">
                         <SelectValue placeholder="Select type" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="song">Song (Simple verse/chorus format)</SelectItem>
                         <SelectItem value="hymn">Hymn (English/Yoruba bilingual)</SelectItem>
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground mt-1">
                       Choose "Song" for simple format or "Hymn" for bilingual content
                     </p>
                   </div>
                 </div>

                 {/* Required Fields Section */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                    Required Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        Song Title *
                      </Label>
                      <Input
                        id="title"
                        value={newSong.title}
                        onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                        placeholder="e.g., Amazing Grace"
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter the full, official title of the song</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                      <Select value={newSong.category} onValueChange={(value) => setNewSong({...newSong, category: value})}>
                        <SelectTrigger className="mt-1">
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
                      <p className="text-xs text-muted-foreground mt-1">Choose the most appropriate category</p>
                    </div>
                     
                     {newSong.type === 'song' ? (
                       <div>
                         <Label htmlFor="lyrics" className="text-sm font-medium">
                           Lyrics *
                         </Label>
                         <Textarea
                           id="lyrics"
                           value={newSong.lyrics}
                           onChange={(e) => setNewSong({...newSong, lyrics: e.target.value})}
                           placeholder="Verse 1:&#10;Amazing grace, how sweet the sound&#10;That saved a wretch like me&#10;&#10;Chorus:&#10;[Enter chorus here]&#10;&#10;Verse 2:&#10;[Continue with verses]"
                           className="min-h-[200px] mt-1 font-mono text-sm"
                           required
                         />
                         <p className="text-xs text-muted-foreground mt-1">
                           Use clear structure: "Verse 1:", "Chorus:", "Bridge:", etc. Separate sections with blank lines.
                         </p>
                       </div>
                     ) : (
                       <div className="space-y-4">
                         <div>
                           <Label htmlFor="englishLyrics" className="text-sm font-medium">
                             English Lyrics *
                           </Label>
                           <Textarea
                             id="englishLyrics"
                             value={newSong.englishLyrics}
                             onChange={(e) => setNewSong({...newSong, englishLyrics: e.target.value})}
                             placeholder="Verse 1:&#10;Amazing grace, how sweet the sound&#10;That saved a wretch like me&#10;&#10;Verse 2:&#10;[Continue with verses]"
                             className="min-h-[150px] mt-1 font-mono text-sm"
                             required
                           />
                         </div>
                          <div>
                            <Label htmlFor="yorubaLyrics" className="text-sm font-medium">
                              Yoruba/Other Language Lyrics *
                            </Label>
                            <Textarea
                              id="yorubaLyrics"
                              value={newSong.yorubaLyrics}
                              onChange={(e) => setNewSong({...newSong, yorubaLyrics: e.target.value})}
                              placeholder="Àfikún 1:&#10;[Yoruba or other language lyrics here]&#10;&#10;Àfikún 2:&#10;[Continue with verses]"
                              className="min-h-[150px] mt-1 font-mono text-sm"
                              style={{ fontFamily: 'monospace, "Noto Sans", "Arial Unicode MS"' }}
                              lang="yo"
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Both English and Yoruba/other language versions are required for hymns. The text field supports all Unicode languages including Yoruba, Arabic, Chinese, etc. Use matching verse structures.
                          </p>
                       </div>
                     )}
                  </div>
                </div>

                 {/* Song Details Section */}
                 <div className="border rounded-lg p-4">
                   <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                     {newSong.type === 'hymn' ? 'Hymn Details' : 'Song Details'}
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {newSong.type === 'hymn' ? (
                       <div>
                         <Label htmlFor="hymnNumber" className="text-sm font-medium">Hymn Number</Label>
                         <Input
                           id="hymnNumber"
                           type="number"
                           value={newSong.hymnNumber}
                           onChange={(e) => setNewSong({...newSong, hymnNumber: e.target.value})}
                           placeholder="e.g., 123"
                           className="mt-1"
                         />
                         <p className="text-xs text-muted-foreground mt-1">Official hymnal number for easy reference</p>
                       </div>
                     ) : (
                       <div>
                         <Label htmlFor="number" className="text-sm font-medium">Song Number</Label>
                         <Input
                           id="number"
                           type="number"
                           value={newSong.number}
                           onChange={(e) => setNewSong({...newSong, number: e.target.value})}
                           placeholder="e.g., 123"
                           className="mt-1"
                         />
                         <p className="text-xs text-muted-foreground mt-1">Song number (if applicable)</p>
                       </div>
                     )}
                    
                    <div>
                      <Label htmlFor="year" className="text-sm font-medium">Year Written</Label>
                      <Input
                        id="year"
                        type="number"
                        min="1000"
                        max={new Date().getFullYear()}
                        value={newSong.year}
                        onChange={(e) => setNewSong({...newSong, year: e.target.value})}
                        placeholder="e.g., 1779"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Year the song was written</p>
                    </div>
                  </div>
                </div>

                {/* Attribution Section */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">Attribution & Credits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author" className="text-sm font-medium">Lyricist/Author</Label>
                      <Input
                        id="author"
                        value={newSong.author}
                        onChange={(e) => setNewSong({...newSong, author: e.target.value})}
                        placeholder="e.g., John Newton"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Person who wrote the lyrics</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="composer" className="text-sm font-medium">Composer</Label>
                      <Input
                        id="composer"
                        value={newSong.composer}
                        onChange={(e) => setNewSong({...newSong, composer: e.target.value})}
                        placeholder="e.g., John P. Holbrook"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Person who composed the music</p>
                    </div>
                  </div>
                </div>

                {/* Tags & Classification */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">Tags & Classification</h4>
                  <div>
                    <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                    <Input
                      id="tags"
                      value={newSong.tags}
                      onChange={(e) => setNewSong({...newSong, tags: e.target.value})}
                      placeholder="worship, praise, christmas, traditional, contemporary"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated keywords for easy searching. Examples: worship, praise, christmas, easter, traditional, contemporary
                    </p>
                  </div>
                </div>

                 <div className="flex gap-2 sticky bottom-0 bg-background pt-4 border-t">
                   {isEditing ? (
                     <>
                       <Button type="submit" disabled={isSubmitting} className="flex-1">
                         {isSubmitting ? (
                           <>
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                             Updating {newSong.type === 'hymn' ? 'Hymn' : 'Song'}...
                           </>
                         ) : (
                           <>
                             <Save className="w-4 h-4 mr-2" />
                             Save Changes
                           </>
                         )}
                       </Button>
                       <Button type="button" variant="outline" onClick={handleCancelEdit}>
                         <X className="w-4 h-4 mr-2" />
                         Cancel
                       </Button>
                     </>
                   ) : (
                     <>
                       <Button type="submit" disabled={isSubmitting} className="flex-1">
                         {isSubmitting ? (
                           <>
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                             Adding {newSong.type === 'hymn' ? 'Hymn' : 'Song'}...
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
                     </>
                   )}
                 </div>
              </form>
            </ScrollArea>
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
                                <Badge variant="secondary" className="capitalize">
                                  {song.type}
                                </Badge>
                                {song.year && <Badge variant="secondary">{song.year}</Badge>}
                                {song.type === 'hymn' && song.hymnNumber && (
                                  <Badge variant="secondary">Hymn #{song.hymnNumber}</Badge>
                                )}
                                {song.type === 'song' && song.number && (
                                  <Badge variant="secondary">#{song.number}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(song)}
                                className="text-primary hover:text-primary"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
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