-- Step 2: Recreate has_role function and all policies with new roles
-- Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

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

-- Update admin user function
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

-- Update handle_approved_choir_request function
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