-- Update site_settings table to include Payphone configuration in payment_settings
-- This migration adds Payphone configuration to the existing payment_settings jsonb column

COMMENT ON COLUMN site_settings.payment_settings IS 'Payment settings including PayPal, DataFast, Payphone, WhatsApp, and Bank Transfer configurations';

-- The payment_settings jsonb will now support this structure:
-- {
--   "paypal": { "enabled": boolean, "client_id": string, "currency": string, "min_amount": number },
--   "datafast": { "enabled": boolean },
--   "payphone": { "enabled": boolean, "store_id": string, "test_mode": boolean },
--   "whatsapp": { "enabled": boolean, "number": string },
--   "bank_transfer": { "enabled": boolean, "account_info": string }
-- }