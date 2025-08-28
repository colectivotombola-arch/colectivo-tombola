-- Fix the function by dropping and recreating properly
DROP FUNCTION IF EXISTS public.get_public_site_settings();

-- Create the enhanced public function with all safe fields including WhatsApp
CREATE FUNCTION public.get_public_site_settings()
RETURNS TABLE(
  id uuid,
  site_name text,
  site_tagline text,
  hero_title text,
  hero_subtitle text,
  primary_color text,
  secondary_color text,
  logo_url text,
  terms_and_conditions text,
  price_per_number text,
  whatsapp_number text,
  instagram_handle text,
  instagram_display_name text,
  instagram_video_url text,
  activity_title text,
  purchase_rules text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    s.id,
    s.site_name,
    s.site_tagline,
    s.hero_title,
    s.hero_subtitle,
    s.primary_color,
    s.secondary_color,
    s.logo_url,
    s.terms_and_conditions,
    s.price_per_number,
    s.whatsapp_number,
    s.instagram_handle,
    s.instagram_display_name,
    s.instagram_video_url,
    s.activity_title,
    s.purchase_rules,
    s.created_at,
    s.updated_at
  FROM public.site_settings s
  LIMIT 1;
$function$;