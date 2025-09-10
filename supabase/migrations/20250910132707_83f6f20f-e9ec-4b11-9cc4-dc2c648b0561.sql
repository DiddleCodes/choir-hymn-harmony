-- Fix RLS policy for items table to allow proper updates
DROP POLICY IF EXISTS "Super_admins and admins can update songs" ON public.items;

CREATE POLICY "Super_admins and admins can update songs"
ON public.items
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);