-- Fix RLS policies for items table to ensure proper admin access

-- Drop existing policies
DROP POLICY IF EXISTS "Super_admins and admins can insert songs" ON public.items;
DROP POLICY IF EXISTS "Super_admins and admins can update songs" ON public.items;
DROP POLICY IF EXISTS "Super_admins and admins can delete songs" ON public.items;

-- Recreate policies with better conditions
CREATE POLICY "Super_admins and admins can insert songs" 
ON public.items 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can update songs" 
ON public.items 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Super_admins and admins can delete songs" 
ON public.items 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);