import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Song {
  id: string;
  title: string;
  author?: string;
  composer?: string;
  category: string;
  type: 'song' | 'hymn';
  // For regular songs
  lyrics: string[];
  verses: number;
  // For hymns
  englishLyrics?: string[];
  yorubaLyrics?: string[];
  hymnNumber?: number;
  // Common fields
  year?: number;
  tags: string[];
  number?: number;
  sheet_music_url?: string;
  video_url?: string;
  audio_url?: string;
  key_signature?: string;
  time_signature?: string;
  tempo?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const useSongs = (searchTerm?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['songs', searchTerm, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select(`
          id,
          title,
          author,
          composer,
          type,
          year_written,
          number,
          hymn_number,
          english_lyrics,
          yoruba_lyrics,
          sheet_music_url,
          video_url,
          audio_url,
          key_signature,
          time_signature,
          tempo,
          tags,
          categories!inner(name),
          item_versions!inner(
            lyrics,
            is_primary
          )
        `)
        .eq('is_active', true)
        .eq('item_versions.is_primary', true);

      // Filter by category if specified
      if (categoryId && categoryId !== 'all') {
        query = query.eq('categories.name', categoryId);
      }

      // Apply search filter if specified
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,composer.ilike.%${searchTerm}%,item_versions.lyrics.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our Song interface
      const songs: Song[] = (data || []).map(item => {
        const isHymn = item.type === 'hymn';
        
        // For songs, use item_versions lyrics; for hymns, use dedicated columns
        const lyrics = isHymn ? [] : (item.item_versions[0]?.lyrics || '').split('\n\n').filter(Boolean);
        const englishLyrics = isHymn && item.english_lyrics ? item.english_lyrics.split('\n\n').filter(Boolean) : undefined;
        const yorubaLyrics = isHymn && item.yoruba_lyrics ? item.yoruba_lyrics.split('\n\n').filter(Boolean) : undefined;
        
        return {
          id: item.id,
          title: item.title,
          author: item.author || undefined,
          composer: item.composer || undefined,
          category: item.categories?.name || 'traditional',
          type: item.type as 'song' | 'hymn',
          lyrics,
          verses: lyrics.length,
          englishLyrics,
          yorubaLyrics,
          hymnNumber: item.hymn_number || undefined,
          year: item.year_written || undefined,
          tags: item.tags || [],
          number: item.number || undefined,
          sheet_music_url: item.sheet_music_url || undefined,
          video_url: item.video_url || undefined,
          audio_url: item.audio_url || undefined,
          key_signature: item.key_signature || undefined,
          time_signature: item.time_signature || undefined,
          tempo: item.tempo || undefined,
        };
      });

      return songs;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Add "All Songs" category
      const categories = [
        { id: 'all', name: 'All Songs', description: 'All available songs' },
        ...(data || []).map(cat => ({
          id: cat.name.toLowerCase(),
          name: cat.name,
          description: cat.description || undefined,
        }))
      ];

      return categories;
    },
  });
};

export const useInvalidateSongs = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['songs'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };
};