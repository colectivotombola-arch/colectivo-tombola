-- Agregar campos editables para límites de boletos y precios
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS max_tickets_per_purchase integer DEFAULT 10;
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS min_tickets_per_purchase integer DEFAULT 1;

-- Agregar opciones de paquetes personalizables
CREATE TABLE IF NOT EXISTS raffle_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_count integer NOT NULL,
  price_per_ticket numeric NOT NULL DEFAULT 1.00,
  is_popular boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS para raffle_packages
ALTER TABLE raffle_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden gestionar paquetes" ON raffle_packages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Todos pueden ver paquetes" ON raffle_packages
  FOR SELECT USING (true);

-- Insertar paquetes por defecto para todas las rifas existentes (corrección del error)
DO $$
DECLARE
    raffle_record RECORD;
    package_sizes INTEGER[] := ARRAY[10, 20, 30, 40, 50, 100];
    package_size INTEGER;
    counter INTEGER := 0;
BEGIN
    FOR raffle_record IN SELECT id, price_per_number FROM raffles LOOP
        counter := 0;
        FOREACH package_size IN ARRAY package_sizes LOOP
            counter := counter + 1;
            INSERT INTO raffle_packages (raffle_id, ticket_count, price_per_ticket, is_popular, display_order)
            VALUES (
                raffle_record.id,
                package_size,
                raffle_record.price_per_number,
                CASE WHEN package_size = 10 THEN true ELSE false END,
                counter
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Tabla para gestionar configuraciones de compra
CREATE TABLE IF NOT EXISTS purchase_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE UNIQUE,
  allow_custom_quantity boolean DEFAULT true,
  email_notifications_enabled boolean DEFAULT true,
  payment_methods jsonb DEFAULT '{"whatsapp": true, "bank_transfer": true, "paypal": false}'::jsonb,
  terms_and_conditions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para purchase_settings
ALTER TABLE purchase_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden gestionar configuración de compras" ON purchase_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Todos pueden ver configuración de compras" ON purchase_settings
  FOR SELECT USING (true);