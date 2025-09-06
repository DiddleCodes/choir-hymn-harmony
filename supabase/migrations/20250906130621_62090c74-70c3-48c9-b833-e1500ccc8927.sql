-- Fix RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix RLS policies for playlists table
CREATE POLICY "Users can view public playlists or their own" 
ON public.playlists 
FOR SELECT 
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own playlists" 
ON public.playlists 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own playlists" 
ON public.playlists 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own playlists" 
ON public.playlists 
FOR DELETE 
USING (created_by = auth.uid());

-- Fix RLS policies for playlist_items table
CREATE POLICY "Users can view items in playlists they have access to" 
ON public.playlist_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND (playlists.is_public = true OR playlists.created_by = auth.uid())
  )
);

CREATE POLICY "Users can add items to their own playlists" 
ON public.playlist_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND playlists.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update items in their own playlists" 
ON public.playlist_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND playlists.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete items from their own playlists" 
ON public.playlist_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND playlists.created_by = auth.uid()
  )
);

-- Fix RLS policies for search_history table
CREATE POLICY "Users can view their own search history" 
ON public.search_history 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can insert search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);