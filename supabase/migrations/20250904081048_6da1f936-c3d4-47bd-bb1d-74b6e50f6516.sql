-- Drop old enum if it exists
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'choir_member');

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has role
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

-- Items (songs & hymns) RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Anyone can view songs
CREATE POLICY "Anyone can view songs"
ON public.items
FOR SELECT
USING (is_active = true);

-- Admins or Super Admins can insert songs
CREATE POLICY "Admins or Super Admins can insert songs"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Admins or Super Admins can update songs
CREATE POLICY "Admins or Super Admins can update songs"
ON public.items
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Admins or Super Admins can delete songs
CREATE POLICY "Admins or Super Admins can delete songs"
ON public.items
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Item versions
ALTER TABLE public.item_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view item versions"
ON public.item_versions
FOR SELECT
USING (true);

CREATE POLICY "Admins or Super Admins can insert versions"
ON public.item_versions
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins or Super Admins can update versions"
ON public.item_versions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins or Super Admins can delete versions"
ON public.item_versions
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admins or Super Admins can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins or Super Admins can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins or Super Admins can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Languages
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view languages"
ON public.languages
FOR SELECT
USING (true);

CREATE POLICY "Admins or Super Admins can insert languages"
ON public.languages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Insert defaults
INSERT INTO public.languages (name, code) VALUES 
('English', 'en'),
('Yoruba', 'yo')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, description) VALUES 
('Traditional Hymns', 'Classic hymns and traditional worship songs'),
('Contemporary', 'Modern worship and praise songs'),
('Seasonal', 'Holiday and seasonal worship music'),
('Psalms', 'Biblical psalms and scripture songs')
ON CONFLICT DO NOTHING;
