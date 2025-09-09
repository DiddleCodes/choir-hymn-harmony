-- Assign roles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Bootstrap Super Admin
  IF NEW.email = 'docayanflex@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default all others to choir_member
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'choir_member')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_roles();
