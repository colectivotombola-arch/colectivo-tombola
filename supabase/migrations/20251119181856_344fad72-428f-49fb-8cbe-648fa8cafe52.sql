-- Fix RLS policies for purchase_confirmations to allow public purchases
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own purchase confirmations" ON purchase_confirmations;
DROP POLICY IF EXISTS "Users can view their own purchase confirmations" ON purchase_confirmations;
DROP POLICY IF EXISTS "Admins can view all purchase confirmations" ON purchase_confirmations;
DROP POLICY IF EXISTS "Admins can update purchase confirmations" ON purchase_confirmations;

-- Allow anyone to insert purchase confirmations (needed for public purchases)
CREATE POLICY "Anyone can create purchase confirmations"
ON purchase_confirmations
FOR INSERT
TO public
WITH CHECK (
  -- Basic validation
  buyer_email IS NOT NULL
  AND buyer_name IS NOT NULL
  AND buyer_phone IS NOT NULL
  AND quantity > 0
  AND total_amount > 0
);

-- Users can view their own confirmations by email
CREATE POLICY "Users can view their own confirmations by email"
ON purchase_confirmations
FOR SELECT
TO public
USING (
  buyer_email = get_current_user_email()
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'))
);

-- Admins can update confirmations
CREATE POLICY "Admins can update confirmations"
ON purchase_confirmations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can delete confirmations
CREATE POLICY "Admins can delete confirmations"
ON purchase_confirmations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));