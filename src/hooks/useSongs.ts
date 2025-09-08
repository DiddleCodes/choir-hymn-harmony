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

export const useSongs = (searchTerm?: string, categoryId?: string, userRole?: 'admin' | 'choir_member' | 'guest' | null) => {
  return useQuery({
    queryKey: ['songs', searchTerm, categoryId, userRole],
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
          categories(name),
          item_versions(
            lyrics,
            is_primary
          )
        `)
        .eq('is_active', true)

      const { data, error } = await query;

      if (error) throw error;

      // Filter the data on the client side to avoid JOIN issues
      let filteredData = data || [];

      // Filter by category if specified
      if (categoryId && categoryId !== 'all') {
        filteredData = filteredData.filter(item => 
          item.categories?.name?.toLowerCase() === categoryId.toLowerCase()
        );
      }

      // Apply search filter if specified
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item => {
          const titleMatch = item.title?.toLowerCase().includes(searchLower);
          const authorMatch = item.author?.toLowerCase().includes(searchLower);
          const composerMatch = item.composer?.toLowerCase().includes(searchLower);
          const lyricsMatch = item.item_versions?.some(version => 
            version.lyrics?.toLowerCase().includes(searchLower)
          );
          const englishLyricsMatch = item.english_lyrics?.toLowerCase().includes(searchLower);
          const yorubaLyricsMatch = item.yoruba_lyrics?.toLowerCase().includes(searchLower);
          
          return titleMatch || authorMatch || composerMatch || lyricsMatch || englishLyricsMatch || yorubaLyricsMatch;
        });
      }

      // Filter by user role (guests can only see hymns)
      if (userRole === 'guest') {
        filteredData = filteredData.filter(item => item.type === 'hymn');
      }

      // Transform the data to match our Song interface
      const songs: Song[] = filteredData.map(item => {
        const isHymn = item.type === 'hymn';
        
        // For songs, use item_versions lyrics; for hymns, use dedicated columns
        const primaryVersion = item.item_versions?.find(v => v.is_primary) || item.item_versions?.[0];
        const lyrics = isHymn ? [] : (primaryVersion?.lyrics || '').split('\n\n').filter(Boolean);
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