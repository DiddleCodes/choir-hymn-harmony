-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  sign_in_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Profiles are inserted automatically" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, last_sign_in_at, sign_in_count)
  VALUES (NEW.id, NEW.email, NEW.last_sign_in_at, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    last_sign_in_at = NEW.last_sign_in_at,
    sign_in_count = profiles.sign_in_count + 1;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Update the existing trigger for approved choir requests to also add user role
CREATE OR REPLACE FUNCTION public.handle_approved_choir_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Add choir_member role to existing user if they exist
    INSERT INTO public.user_roles (user_id, role)
    SELECT auth_user.id, 'choir_member'::app_role
    FROM auth.users auth_user 
    WHERE auth_user.email = NEW.email
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update the request with reviewer info
    NEW.reviewed_by = auth.uid();
    NEW.reviewed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add the trigger to choir_member_requests
DROP TRIGGER IF EXISTS on_choir_request_approved ON public.choir_member_requests;
CREATE TRIGGER on_choir_request_approved
  BEFORE UPDATE ON public.choir_member_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_approved_choir_request();