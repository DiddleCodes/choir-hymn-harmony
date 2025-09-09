-- Step 1: Drop all dependent policies and functions that use app_role
DROP POLICY IF EXISTS "Only admins can insert songs" ON public.items;
DROP POLICY IF EXISTS "Only admins can update songs" ON public.items;
DROP POLICY IF EXISTS "Only admins can delete songs" ON public.items;
DROP POLICY IF EXISTS "Only admins can insert versions" ON public.item_versions;
DROP POLICY IF EXISTS "Only admins can update versions" ON public.item_versions;
DROP POLICY IF EXISTS "Only admins can delete versions" ON public.item_versions;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert languages" ON public.languages;
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.choir_member_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.choir_member_requests;

-- Drop the function that uses the old enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Now rename and create new enum
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'choir_member');

-- Update user_roles table
ALTER TABLE user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role USING 
  CASE 
    WHEN role::text = 'admin' THEN 'super_admin'::app_role
    WHEN role::text = 'user' THEN 'choir_member'::app_role
    ELSE 'choir_member'::app_role
  END;
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'choir_member'::app_role;

-- Drop old enum
DROP TYPE app_role_old CASCADE;