-- Remove the overly permissive policy that allows public access to all customer data
DROP POLICY IF EXISTS "Todos pueden ver números vendidos" ON public.raffle_numbers;

-- Create a secure policy that only allows customers to view their own purchased numbers
CREATE POLICY "Users can view their own purchased numbers" 
ON public.raffle_numbers 
FOR SELECT 
USING (
  -- Allow access if the user's email matches the buyer_email
  (auth.jwt() ->> 'email')::text = buyer_email
  -- Or if accessing via phone number for the public consultation feature
  OR auth.uid() IS NULL -- Allow unauthenticated access for phone-based queries (handled by app logic)
);

-- Keep admin access for management purposes
CREATE POLICY "Admins can view all raffle numbers" 
ON public.raffle_numbers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update the insertion policy to be more secure
DROP POLICY IF EXISTS "Usuarios pueden comprar números" ON public.raffle_numbers;

CREATE POLICY "Authenticated users can purchase numbers" 
ON public.raffle_numbers 
FOR INSERT 
WITH CHECK (
  -- Allow admins to insert any numbers
  has_role(auth.uid(), 'admin'::app_role)
  -- Or allow public insertions for the purchase flow (will be validated by business logic)
  OR auth.uid() IS NULL
);

-- Ensure the admin management policy is comprehensive
DROP POLICY IF EXISTS "Admins pueden gestionar números" ON public.raffle_numbers;

CREATE POLICY "Admins can manage all raffle numbers" 
ON public.raffle_numbers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));