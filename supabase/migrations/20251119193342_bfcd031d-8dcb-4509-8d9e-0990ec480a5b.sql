-- Remove all conflicting policies and create a simple public insert policy
DROP POLICY IF EXISTS "Anyone can create purchase confirmations" ON public.purchase_confirmations;
DROP POLICY IF EXISTS "Users can view their own confirmations by email" ON public.purchase_confirmations;
DROP POLICY IF EXISTS "Admins can update confirmations" ON public.purchase_confirmations;
DROP POLICY IF EXISTS "Admins can delete confirmations" ON public.purchase_confirmations;

-- Allow ANYONE (including anonymous users) to insert purchase confirmations
CREATE POLICY "Public can create purchase confirmations"
ON public.purchase_confirmations
FOR INSERT
WITH CHECK (
  buyer_email IS NOT NULL
  AND buyer_name IS NOT NULL
  AND buyer_phone IS NOT NULL
  AND quantity > 0
  AND total_amount > 0
);

-- Allow users to view their own confirmations OR admins to view all
CREATE POLICY "View own confirmations or admin view all"
ON public.purchase_confirmations
FOR SELECT
USING (
  -- If authenticated and is admin
  (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'))
  -- OR if authenticated and email matches
  OR (auth.uid() IS NOT NULL AND buyer_email = get_current_user_email())
);

-- Only admins can update
CREATE POLICY "Only admins update confirmations"
ON public.purchase_confirmations
FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Only admins delete confirmations"
ON public.purchase_confirmations
FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));