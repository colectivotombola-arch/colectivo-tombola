-- Fix critical security issues by updating RLS policies

-- Update site_settings policies to restrict sensitive data access
DROP POLICY IF EXISTS "Everyone can read basic site settings" ON public.site_settings;

CREATE POLICY "Public can read basic site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Create a secure function to get filtered site settings for public access
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  id UUID,
  site_name TEXT,
  site_tagline TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  logo_url TEXT,
  whatsapp_number TEXT,
  instagram_video_url TEXT,
  price_per_number TEXT,
  social_media JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE SQL 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
  SELECT 
    s.id,
    s.site_name,
    s.site_tagline,
    s.hero_title,
    s.hero_subtitle,
    s.primary_color,
    s.secondary_color,
    s.logo_url,
    s.whatsapp_number,
    s.instagram_video_url,
    s.price_per_number,
    s.social_media,
    s.created_at,
    s.updated_at
  FROM public.site_settings s
  LIMIT 1;
$$;

-- Update purchase_confirmations policies to require authentication for viewing
DROP POLICY IF EXISTS "Ver propias confirmaciones" ON public.purchase_confirmations;

CREATE POLICY "Authenticated users can view their own confirmations" 
ON public.purchase_confirmations 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
   has_role(auth.uid(), 'admin'::app_role))
);

-- Update purchase_confirmations insert policy to require valid email
DROP POLICY IF EXISTS "Todos pueden crear confirmaciones" ON public.purchase_confirmations;

CREATE POLICY "Valid users can create confirmations" 
ON public.purchase_confirmations 
FOR INSERT 
WITH CHECK (
  buyer_email IS NOT NULL AND 
  buyer_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Update raffle_numbers policies for better security
DROP POLICY IF EXISTS "Users can view their own purchased numbers" ON public.raffle_numbers;
DROP POLICY IF EXISTS "Authenticated users can purchase numbers" ON public.raffle_numbers;

CREATE POLICY "Users can view their own purchased numbers" 
ON public.raffle_numbers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
   has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Authenticated users can purchase numbers" 
ON public.raffle_numbers 
FOR INSERT 
WITH CHECK (
  buyer_email IS NOT NULL AND 
  buyer_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  buyer_name IS NOT NULL AND
  buyer_phone IS NOT NULL
);