-- Add activity_title field to site_settings to make "Actividad #33" editable
ALTER TABLE public.site_settings 
ADD COLUMN activity_title text DEFAULT 'ACTIVIDAD #1';

-- Add raffle management fields for better functionality
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS allow_multiple_purchases boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS purchase_limit integer DEFAULT 1000;

-- Update admin password hash for 815358$
-- This is a placeholder - in real implementation, password should be hashed
UPDATE auth.users 
SET encrypted_password = crypt('815358$', gen_salt('bf'))
WHERE email = 'admin@example.com';

-- Add more editable fields for terms and rules
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS purchase_rules text DEFAULT 'Reglas de compra por defecto',
ADD COLUMN IF NOT EXISTS raffle_rules text DEFAULT 'Reglas de rifa por defecto';

-- Update payment methods with better structure
ALTER TABLE public.site_settings 
DROP COLUMN IF EXISTS payment_settings,
ADD COLUMN payment_settings jsonb DEFAULT '{
  "paypal": {
    "enabled": true,
    "client_id": "AcThy7S3bmb6CLJVF9IhV0xsbEkrXmYm-rilgJHnf3t4XVE_3zQrtHSW_tudJvXPlZEE912X9tlsR624",
    "currency": "USD",
    "min_amount": 1.00
  },
  "whatsapp": {
    "enabled": true,
    "number": "+1234567890"
  },
  "bank_transfer": {
    "enabled": true,
    "account_info": "Información bancaria"
  }
}'::jsonb;