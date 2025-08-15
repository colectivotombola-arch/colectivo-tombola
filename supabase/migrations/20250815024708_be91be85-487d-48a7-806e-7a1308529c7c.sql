-- Agregar campo para términos y condiciones editables
ALTER TABLE site_settings 
ADD COLUMN terms_and_conditions TEXT DEFAULT 'Términos y condiciones predeterminados. Aquí puedes escribir tus propios términos.';

-- Actualizar la función pública para incluir terms
DROP FUNCTION IF EXISTS public.get_public_site_settings();

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
  terms_and_conditions text,
  price_per_number text,
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
    s.terms_and_conditions,
    s.price_per_number,
    s.created_at,
    s.updated_at
  FROM public.site_settings s
  LIMIT 1;
$$;

-- Conceder permisos
GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO authenticated;