-- Drop restrictive ALL policy so public inserts can succeed
DROP POLICY IF EXISTS "Admins pueden gestionar confirmaciones" ON public.purchase_confirmations;