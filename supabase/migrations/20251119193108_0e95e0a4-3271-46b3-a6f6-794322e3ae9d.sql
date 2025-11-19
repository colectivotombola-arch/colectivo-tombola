-- Fix RLS for purchase_confirmations INSERT to allow public purchases
DROP POLICY IF EXISTS "Authenticated users can create purchase confirmations" ON public.purchase_confirmations;