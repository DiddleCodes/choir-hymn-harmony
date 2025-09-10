-- Make email unique in choir_member_requests to prevent duplicate requests
ALTER TABLE public.choir_member_requests 
ADD CONSTRAINT unique_email_requests UNIQUE (email);

-- Fix RLS policies for items table - ensure proper UPDATE permissions
DROP POLICY IF EXISTS "Super_admins and admins can update songs" ON public.items;

CREATE POLICY "Super_admins and admins can update songs" 
ON public.items 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);