-- Update user roles enum to include choir_member and guest
ALTER TYPE app_role ADD VALUE 'choir_member';
ALTER TYPE app_role ADD VALUE 'guest';

-- Add a table for pending choir member requests
CREATE TABLE public.choir_member_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar NOT NULL,
    full_name varchar NOT NULL,
    message text,
    status varchar DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on choir member requests
ALTER TABLE public.choir_member_requests ENABLE ROW LEVEL SECURITY;

-- Policies for choir member requests
CREATE POLICY "Anyone can submit choir member requests" 
ON public.choir_member_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all requests" 
ON public.choir_member_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests" 
ON public.choir_member_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Function to handle approved choir member requests
CREATE OR REPLACE FUNCTION public.handle_approved_choir_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only process if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create auth user account
    INSERT INTO auth.users (email, email_confirmed_at, created_at, updated_at)
    VALUES (NEW.email, now(), now(), now());
    
    -- Add choir_member role
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'choir_member'::app_role
    FROM auth.users 
    WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for approved choir member requests
CREATE TRIGGER on_choir_request_approved
  AFTER UPDATE ON public.choir_member_requests
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_approved_choir_request();