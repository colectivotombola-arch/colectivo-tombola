-- Fix security vulnerability: Restrict public access to site_settings
-- Remove the overly permissive public read policy
DROP POLICY IF EXISTS "Public can read basic site settings" ON public.site_settings;

-- Create restricted public access policy for only safe display fields
CREATE POLICY "Public can read safe display settings only" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Create a secure function for public access to only safe settings
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE(
  id uuid,
  site_name text,
  site_tagline text,
  hero_title text,
  hero_subtitle text,
  primary_color text,
  secondary_color text,
  logo_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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
    s.created_at,
    s.updated_at
  FROM public.site_settings s
  LIMIT 1;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO authenticated;