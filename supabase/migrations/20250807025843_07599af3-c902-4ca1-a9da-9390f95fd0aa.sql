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

-- Insertar paquetes por defecto para todas las rifas existentes
INSERT INTO raffle_packages (raffle_id, ticket_count, price_per_ticket, is_popular, display_order)
SELECT 
  id as raffle_id,
  unnest(ARRAY[10, 20, 30, 40, 50, 100]) as ticket_count,
  price_per_number as price_per_ticket,
  CASE WHEN unnest(ARRAY[10, 20, 30, 40, 50, 100]) = 10 THEN true ELSE false END as is_popular,
  row_number() OVER () as display_order
FROM raffles
WHERE NOT EXISTS (SELECT 1 FROM raffle_packages WHERE raffle_packages.raffle_id = raffles.id);

-- Tabla para gestionar los tipos de actividad/sorteo
CREATE TABLE IF NOT EXISTS raffle_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  default_total_numbers integer DEFAULT 1000,
  default_price_per_number numeric DEFAULT 1.00,
  default_max_tickets integer DEFAULT 10,
  default_min_tickets integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Insertar template por defecto
INSERT INTO raffle_templates (name, description, default_total_numbers, default_price_per_number, default_max_tickets, default_min_tickets)
VALUES ('Sorteo Estándar', 'Configuración por defecto para sorteos', 1000, 1.00, 10, 1)
ON CONFLICT DO NOTHING;