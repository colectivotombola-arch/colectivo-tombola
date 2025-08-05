-- Get the current authenticated user's ID and assign admin role
-- First, let's make sure we have the admin role in the enum (it should already exist)
-- Insert admin role for the current user (this will be the first user who signs up)

-- Insert the admin role for any existing users who should be admins
-- This is a one-time setup - in production you'd be more selective about who gets admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = (
  SELECT email 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Alternative: If you want to make the first registered user an admin automatically
-- This trigger will assign admin role to the very first user that signs up
CREATE OR REPLACE FUNCTION assign_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user (no existing users)
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign admin to first user
CREATE OR REPLACE TRIGGER assign_first_user_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_first_user_admin();