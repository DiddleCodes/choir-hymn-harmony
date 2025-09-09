-- Choir member requests
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

ALTER TABLE public.choir_member_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit choir member requests" 
ON public.choir_member_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super Admins can view requests" 
ON public.choir_member_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins or Super Admins can update requests" 
ON public.choir_member_requests 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Trigger to assign choir_member role after approval
CREATE OR REPLACE FUNCTION public.handle_approved_choir_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Ensure user exists in auth.users
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), NEW.email, now(), now(), now())
    ON CONFLICT (email) DO NOTHING;

    -- Assign choir_member role
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'choir_member'
    FROM auth.users 
    WHERE email = NEW.email
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_choir_request_approved ON public.choir_member_requests;
CREATE TRIGGER on_choir_request_approved
  AFTER UPDATE ON public.choir_member_requests
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_approved_choir_request();
