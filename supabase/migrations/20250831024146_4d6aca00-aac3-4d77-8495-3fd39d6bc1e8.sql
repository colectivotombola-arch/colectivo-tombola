-- Fix WhatsApp number in payment settings
UPDATE site_settings 
SET payment_settings = jsonb_set(
  COALESCE(payment_settings, '{}'::jsonb), 
  '{whatsapp,number}', 
  '"+593999053073"'::jsonb
);

-- Also fix bank transfer and paypal settings
UPDATE site_settings 
SET payment_settings = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(payment_settings, '{}'::jsonb),
      '{paypal,enabled}', 'true'::jsonb
    ),
    '{bank_transfer,enabled}', 'true'::jsonb
  ),
  '{datafast,enabled}', 'false'::jsonb
);