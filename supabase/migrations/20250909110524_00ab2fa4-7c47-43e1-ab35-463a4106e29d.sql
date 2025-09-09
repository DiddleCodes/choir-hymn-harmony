-- Update role system and create Super_Admin approval flow
-- First, update the enum to only have the three roles needed
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'choir_member');

-- Update existing user_roles table to use new enum
ALTER TABLE user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role USING 
  CASE 
    WHEN role::text = 'admin' THEN 'super_admin'::app_role
    WHEN role::text = 'user' THEN 'choir_member'::app_role
    ELSE 'choir_member'::app_role
  END;
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'choir_member'::app_role;

-- Drop old enum
DROP TYPE app_role_old;

-- Make docayanflex@gmail.com a Super_Admin
UPDATE user_roles 
SET role = 'super_admin'::app_role 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'docayanflex@gmail.com'
);

-- Insert Super_Admin role if it doesn't exist
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'docayanflex@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.users.id AND role = 'super_admin'::app_role
);

-- Update the handle_new_admin_user function to assign super_admin role
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the user's email is the super admin email
  IF NEW.email = 'docayanflex@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update handle_approved_choir_request to NOT create auth users automatically
-- Instead, we'll handle this differently - choir members sign up but can't login until approved
CREATE OR REPLACE FUNCTION public.handle_approved_choir_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Add choir_member role to existing user if they exist
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'choir_member'::app_role
    FROM auth.users 
    WHERE email = NEW.email
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update the request with reviewer info
    NEW.reviewed_by = auth.uid();
    NEW.reviewed_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create function to check if choir member is approved
CREATE OR REPLACE FUNCTION public.is_choir_member_approved(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.choir_member_requests 
    WHERE email = user_email AND status = 'approved'
  )
$function$;

-- Update RLS policies for better role management
-- Update user_roles policies to only allow super_admins to manage roles
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;

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

-- Update choir_member_requests policies
DROP POLICY IF EXISTS "Admins can update requests" ON public.choir_member_requests;
CREATE POLICY "Super_admins can update requests" 
ON public.choir_member_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Update items (songs/hymns) policies to allow super_admins and admins to edit
DROP POLICY IF EXISTS "Only admins can insert songs" ON public.items;
DROP POLICY IF EXISTS "Only admins can update songs" ON public.items;
DROP POLICY IF EXISTS "Only admins can delete songs" ON public.items;

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