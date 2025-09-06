-- Add admin role for the specific user
-- First, we need to create a trigger to automatically assign admin role to the specific email
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if the user's email is the admin email
  IF NEW.email = 'docayanflex@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Add regular user role for all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign roles when users sign up
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- If the admin user already exists, make sure they have admin role
-- This handles the case where the user might already be registered
DO $$
BEGIN
  -- Check if user exists and add admin role if they don't have it
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role
  FROM auth.users 
  WHERE email = 'docayanflex@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;