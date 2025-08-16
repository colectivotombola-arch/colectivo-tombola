-- Update admin password to 815358$
UPDATE auth.users 
SET encrypted_password = crypt('815358$', gen_salt('bf'))
WHERE email = 'admin@admin.com';

-- Also update in case there's a different admin email
UPDATE auth.users 
SET encrypted_password = crypt('815358$', gen_salt('bf'))
WHERE id IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Add Instagram settings to site_settings if not exists
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS instagram_display_name TEXT;