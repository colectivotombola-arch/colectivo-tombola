-- Crear función security definer para obtener el email del usuario autenticado de forma segura
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT email
    FROM auth.users
    WHERE id = auth.uid()
    LIMIT 1;
$$;

-- Eliminar la política problemática que hace referencia directa a auth.users
DROP POLICY IF EXISTS "Authenticated users can view their own confirmations" ON public.purchase_confirmations;

-- Crear nueva política segura para que usuarios autenticados solo vean sus propias confirmaciones
CREATE POLICY "Users can view their own purchase confirmations"
ON public.purchase_confirmations
FOR SELECT
TO authenticated
USING (
    -- Solo el usuario que hizo la compra o un admin puede ver la confirmación
    buyer_email = public.get_current_user_email() 
    OR has_role(auth.uid(), 'admin'::app_role)
);

-- Asegurar que los usuarios no pueden modificar confirmaciones existentes
-- Solo crear política restrictiva de UPDATE para admins
CREATE POLICY "Only admins can update confirmations"
ON public.purchase_confirmations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Solo admins pueden eliminar confirmaciones
CREATE POLICY "Only admins can delete confirmations"
ON public.purchase_confirmations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mejorar la política de INSERT para ser más restrictiva
DROP POLICY IF EXISTS "Valid users can create confirmations" ON public.purchase_confirmations;

CREATE POLICY "Authenticated users can create purchase confirmations"
ON public.purchase_confirmations
FOR INSERT
TO authenticated
WITH CHECK (
    -- Validar que el email es válido
    buyer_email IS NOT NULL 
    AND buyer_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
    -- Validar que otros campos obligatorios están presentes
    AND buyer_name IS NOT NULL 
    AND buyer_phone IS NOT NULL
    AND raffle_id IS NOT NULL
    AND quantity > 0
    AND total_amount > 0
    -- Evitar inyección: el usuario solo puede crear confirmaciones con su propio email
    AND (buyer_email = public.get_current_user_email() OR has_role(auth.uid(), 'admin'::app_role))
);