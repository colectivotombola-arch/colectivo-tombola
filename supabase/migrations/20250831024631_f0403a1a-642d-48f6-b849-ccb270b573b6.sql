-- Fix WhatsApp number in site_settings
UPDATE site_settings 
SET payment_settings = jsonb_set(
  payment_settings, 
  '{whatsapp,number}', 
  '"+593999053073"'
) 
WHERE id IS NOT NULL;