-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add RLS policies for items (songs) table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Allow public read access for all songs
CREATE POLICY "Anyone can view songs"
ON public.items
FOR SELECT
USING (is_active = true);

-- Only admins can insert songs
CREATE POLICY "Only admins can insert songs"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update songs  
CREATE POLICY "Only admins can update songs"
ON public.items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete songs
CREATE POLICY "Only admins can delete songs"
ON public.items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for item_versions (lyrics in multiple languages)
ALTER TABLE public.item_versions ENABLE ROW LEVEL SECURITY;

-- Allow public read access for all versions
CREATE POLICY "Anyone can view item versions"
ON public.item_versions
FOR SELECT
USING (true);

-- Only admins can insert versions
CREATE POLICY "Only admins can insert versions"
ON public.item_versions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update versions
CREATE POLICY "Only admins can update versions"
ON public.item_versions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete versions
CREATE POLICY "Only admins can delete versions"
ON public.item_versions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Only admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for languages
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view languages"
ON public.languages
FOR SELECT
USING (true);

-- Only admins can manage languages
CREATE POLICY "Only admins can insert languages"
ON public.languages
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default languages (English and Yoruba)
INSERT INTO public.languages (name, code) VALUES 
('English', 'en'),
('Yoruba', 'yo')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES 
('Traditional Hymns', 'Classic hymns and traditional worship songs'),
('Contemporary', 'Modern worship and praise songs'),
('Seasonal', 'Holiday and seasonal worship music'),
('Psalms', 'Biblical psalms and scripture songs')
ON CONFLICT DO NOTHING;