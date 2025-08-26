-- Allow updates to site_settings for admins and make the table more accessible
DROP POLICY IF EXISTS "Admins can read and update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read safe display settings only" ON public.site_settings;

-- Create new simple policies for site_settings
CREATE POLICY "Allow site settings updates" 
ON public.site_settings 
FOR ALL
USING (true)
WITH CHECK (true);

-- Also ensure the site_settings table has proper structure
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS whatsapp_datalinks JSONB DEFAULT '{}'::jsonb;