-- Actualizar la tabla de configuraciones del sitio para incluir todos los campos necesarios
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_tagline TEXT;

-- Crear tabla para configuraciones dinámicas adicionales
CREATE TABLE IF NOT EXISTS purchase_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'whatsapp',
  confirmation_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  assigned_numbers INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE purchase_confirmations ENABLE ROW LEVEL SECURITY;

-- Política para que los admins puedan gestionar todas las confirmaciones
CREATE POLICY "Admins pueden gestionar confirmaciones" 
ON purchase_confirmations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Política para que todos puedan insertar confirmaciones (proceso de compra)
CREATE POLICY "Todos pueden crear confirmaciones" 
ON purchase_confirmations 
FOR INSERT 
WITH CHECK (true);

-- Política para que solo puedan ver sus propias confirmaciones por email
CREATE POLICY "Ver propias confirmaciones" 
ON purchase_confirmations 
FOR SELECT 
USING (buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger para actualizar timestamp
CREATE TRIGGER update_purchase_confirmations_updated_at
  BEFORE UPDATE ON purchase_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear función para generar números de confirmación únicos
CREATE OR REPLACE FUNCTION generate_confirmation_number()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  result := 'RF';
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;