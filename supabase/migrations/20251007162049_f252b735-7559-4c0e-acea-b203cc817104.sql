-- ============================================
-- CRITICAL SECURITY FIX - Phase 1 (Fixed)
-- Protect customer PII and payment credentials
-- ============================================

-- Step 1: Update lottery_tickets RLS policies to restrict PII access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.lottery_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.lottery_tickets;
DROP POLICY IF EXISTS "Authenticated users can purchase tickets" ON public.lottery_tickets;

-- Create new secure policies for lottery_tickets
CREATE POLICY "Users can view only their own tickets by email"
ON public.lottery_tickets
FOR SELECT
TO authenticated
USING (buyer_email = get_current_user_email() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all tickets"
ON public.lottery_tickets
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create tickets"
ON public.lottery_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Step 2: Update raffle_numbers RLS policies to restrict PII access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own purchased numbers" ON public.raffle_numbers;
DROP POLICY IF EXISTS "Admins can view all raffle numbers" ON public.raffle_numbers;
DROP POLICY IF EXISTS "Admins can manage all raffle numbers" ON public.raffle_numbers;
DROP POLICY IF EXISTS "Authenticated users can purchase numbers" ON public.raffle_numbers;

-- Create new secure policies for raffle_numbers
CREATE POLICY "Users can view only their own numbers by email"
ON public.raffle_numbers
FOR SELECT
TO authenticated
USING (buyer_email = get_current_user_email() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all raffle numbers"
ON public.raffle_numbers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create raffle numbers"
ON public.raffle_numbers
FOR INSERT
TO authenticated
WITH CHECK (
  buyer_email IS NOT NULL 
  AND buyer_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND buyer_name IS NOT NULL 
  AND buyer_phone IS NOT NULL
);

-- Step 3: Drop and recreate secure function for public site settings
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
  whatsapp_number text,
  instagram_handle text,
  instagram_display_name text,
  instagram_video_url text,
  activity_title text,
  purchase_rules text,
  raffle_rules text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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
    s.whatsapp_number,
    s.instagram_handle,
    s.instagram_display_name,
    s.instagram_video_url,
    s.activity_title,
    s.purchase_rules,
    s.raffle_rules,
    s.created_at,
    s.updated_at
  FROM public.site_settings s
  LIMIT 1;
$$;

-- Step 4: Restrict direct access to site_settings table
-- Drop all existing public access policies
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admin operations on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can modify site settings" ON public.site_settings;

-- Create new restrictive policies
CREATE POLICY "Only admins can view site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can modify site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Step 5: Restrict media_uploads to authenticated users only
DROP POLICY IF EXISTS "Users can view media uploads" ON public.media_uploads;

CREATE POLICY "Authenticated users can view media uploads"
ON public.media_uploads
FOR SELECT
TO authenticated
USING (true);

-- Add comment for documentation
COMMENT ON FUNCTION public.get_public_site_settings() IS 'Returns only public-safe site settings without exposing payment credentials or sensitive data. Use this function instead of direct queries to site_settings table from frontend.';