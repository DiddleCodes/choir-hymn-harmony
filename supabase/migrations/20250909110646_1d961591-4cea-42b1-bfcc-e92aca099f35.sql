-- Step 3: Recreate all RLS policies with new role system
-- User roles policies - only super_admins can manage roles
CREATE POLICY "Only super_admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Choir member requests policies
CREATE POLICY "Super_admins can view all requests" 
ON public.choir_member_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super_admins can update requests" 
ON public.choir_member_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Items (songs/hymns) policies - super_admins and admins can edit
CREATE POLICY "Super_admins and admins can insert songs" 
ON public.items 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can update songs" 
ON public.items 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can delete songs" 
ON public.items 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Item versions policies
CREATE POLICY "Super_admins and admins can insert versions" 
ON public.item_versions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can update versions" 
ON public.item_versions 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can delete versions" 
ON public.item_versions 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Categories policies
CREATE POLICY "Super_admins and admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Languages policies
CREATE POLICY "Super_admins and admins can insert languages" 
ON public.languages 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);