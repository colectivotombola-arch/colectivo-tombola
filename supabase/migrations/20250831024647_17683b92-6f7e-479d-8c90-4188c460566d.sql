-- Update WhatsApp number directly in site_settings
UPDATE site_settings 
SET whatsapp_number = '+593999053073'
WHERE whatsapp_number IS NULL OR whatsapp_number = '+1234567890' OR whatsapp_number = '';

-- Also update to ensure we have proper default settings
UPDATE site_settings 
SET whatsapp_number = '+593999053073'
WHERE id IS NOT NULL;