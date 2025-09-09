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
          created_at,
          categories(name),
          item_versions(
            lyrics,
            is_primary
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

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
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase();
        
        if (userRole === 'guest') {
          // Guests can only search hymns by number or english lyrics
          filteredData = filteredData.filter(item => {
            if (item.type !== 'hymn') return false;
            
            // Check hymn number match
            const hymnNumberMatch = item.hymn_number && item.hymn_number.toString() === searchTerm.trim();
            
            // Check english lyrics match
            const englishLyricsMatch = item.english_lyrics?.toLowerCase().includes(searchLower);
            
            return hymnNumberMatch || englishLyricsMatch;
          });
        } else {
          // For authenticated users, search in all fields
          filteredData = filteredData.filter(item => {
            const titleMatch = item.title?.toLowerCase().includes(searchLower);
            const authorMatch = item.author?.toLowerCase().includes(searchLower);
            const composerMatch = item.composer?.toLowerCase().includes(searchLower);
            const lyricsMatch = item.item_versions?.some(version => 
              version.lyrics?.toLowerCase().includes(searchLower)
            );
            const englishLyricsMatch = item.english_lyrics?.toLowerCase().includes(searchLower);
            const yorubaLyricsMatch = item.yoruba_lyrics?.toLowerCase().includes(searchLower);
            
            // Check for number match (hymn number or song number)
            const hymnNumberMatch = item.hymn_number && item.hymn_number.toString() === searchTerm.trim();
            const songNumberMatch = item.number && item.number.toString() === searchTerm.trim();
            
            return titleMatch || authorMatch || composerMatch || lyricsMatch || englishLyricsMatch || yorubaLyricsMatch || hymnNumberMatch || songNumberMatch;
          });
        }
      }

      // Filter by user role (guests can only see hymns)
      if (userRole === 'guest') {
        filteredData = filteredData.filter(item => item.type === 'hymn');
      }

      // Transform the data to match our Song interface
      let songs: Song[] = filteredData.map(item => {
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

      // For "All Songs" filter without search, show only 2 most recent items for authenticated users
      if (categoryId === 'all' && (!searchTerm || !searchTerm.trim()) && userRole !== 'guest') {
        songs = songs.slice(0, 2);
      }

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
        { id: 'all', name: 'All songs', description: 'All available songs' },
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