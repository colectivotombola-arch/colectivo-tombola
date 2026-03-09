-- Drop and recreate get_public_site_settings to include social_media
DROP FUNCTION IF EXISTS public.get_public_site_settings();

CREATE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  activity_title text,
  contact_email text,
  contact_phone text,
  created_at timestamptz,
  hero_subtitle text,
  hero_title text,
  id uuid,
  instagram_display_name text,
  instagram_handle text,
  instagram_video_url text,
  logo_url text,
  payment_settings jsonb,
  price_per_number text,
  primary_color text,
  purchase_rules text,
  raffle_rules text,
  secondary_color text,
  site_name text,
  site_tagline text,
  social_media jsonb,
  terms_and_conditions text,
  updated_at timestamptz,
  whatsapp_datalinks jsonb,
  whatsapp_number text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    activity_title,
    contact_email,
    contact_phone,
    created_at,
    hero_subtitle,
    hero_title,
    id,
    instagram_display_name,
    instagram_handle,
    instagram_video_url,
    logo_url,
    payment_settings,
    price_per_number,
    primary_color,
    purchase_rules,
    raffle_rules,
    secondary_color,
    site_name,
    site_tagline,
    social_media,
    terms_and_conditions,
    updated_at,
    whatsapp_datalinks,
    whatsapp_number
  FROM public.site_settings
  LIMIT 1;
$$;