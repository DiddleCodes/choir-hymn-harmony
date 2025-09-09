-- Fix choir member requests security vulnerability
-- Update INSERT policy to add basic validation
DROP POLICY IF EXISTS "Anyone can submit choir member requests" ON public.choir_member_requests;

CREATE POLICY "Validated choir member requests only" 
ON public.choir_member_requests 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are present and not empty
  full_name IS NOT NULL AND 
  trim(full_name) != '' AND 
  length(trim(full_name)) >= 2 AND
  length(trim(full_name)) <= 100 AND
  
  email IS NOT NULL AND 
  trim(email) != '' AND
  length(trim(email)) >= 5 AND
  length(trim(email)) <= 255 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  
  -- Prevent obvious spam/invalid entries
  full_name !~* '(test|spam|fake|admin|null|undefined)' AND
  
  -- Set reasonable defaults for optional fields
  (message IS NULL OR length(trim(message)) <= 500)
);