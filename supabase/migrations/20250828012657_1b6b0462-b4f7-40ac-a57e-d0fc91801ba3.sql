-- Fix critical security vulnerability: Restrict site_settings table access to admins only
-- Remove the overly permissive policy that allows public access to sensitive data
DROP POLICY IF EXISTS "Allow site settings updates" ON public.site_settings;

-- Create secure RLS policies for site_settings table
-- Only admins can read sensitive site settings
CREATE POLICY "Admins can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can modify site settings
CREATE POLICY "Admins can modify site settings" 
ON public.site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ensure the public function works correctly and securely
-- This function already exists and only exposes safe, non-sensitive fields
-- No changes needed to get_public_site_settings() function as it's already secure