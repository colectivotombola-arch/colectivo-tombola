
-- 1. Add telefono column to transferencias if missing
ALTER TABLE public.transferencias ADD COLUMN IF NOT EXISTS telefono text;

-- 2. Drop ALL existing restrictive policies on transferencias
DROP POLICY IF EXISTS "Admins can delete transfers" ON public.transferencias;
DROP POLICY IF EXISTS "Admins can manage transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Admins can update transfers" ON public.transferencias;
DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transferencias;
DROP POLICY IF EXISTS "Admins can view transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Anyone can submit transfer" ON public.transferencias;
DROP POLICY IF EXISTS "Public can create transferencias" ON public.transferencias;

-- 3. Create PERMISSIVE policies (default is PERMISSIVE)
CREATE POLICY "Anyone can insert transfers"
  ON public.transferencias FOR INSERT
  TO public
  WITH CHECK (
    nombre IS NOT NULL 
    AND email IS NOT NULL 
    AND monto_pagado > 0
  );

CREATE POLICY "Admins can view transfers"
  ON public.transferencias FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update transfers"
  ON public.transferencias FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete transfers"
  ON public.transferencias FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS policies for uploads bucket
CREATE POLICY "Anyone can upload to uploads"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Anyone can read uploads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'uploads');
