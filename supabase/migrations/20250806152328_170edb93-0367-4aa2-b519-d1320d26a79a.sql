-- Agregar campos para premios instantáneos en las rifas
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS instant_prizes jsonb DEFAULT '[]'::jsonb;

-- Agregar campos para el sistema de progreso
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS numbers_sold integer DEFAULT 0;
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS sold_percentage numeric DEFAULT 0;

-- Actualizar la tabla site_settings para incluir WhatsApp configurado
UPDATE site_settings SET whatsapp_number = '0999053073' WHERE id IS NOT NULL;

-- Función para calcular progreso automáticamente
CREATE OR REPLACE FUNCTION calculate_raffle_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular números vendidos y porcentaje
  NEW.numbers_sold := (
    SELECT COUNT(*) 
    FROM raffle_numbers 
    WHERE raffle_id = NEW.id
  );
  
  NEW.sold_percentage := (NEW.numbers_sold::numeric / NEW.total_numbers::numeric) * 100;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular progreso automáticamente cuando se actualiza una rifa
DROP TRIGGER IF EXISTS update_raffle_progress ON raffles;
CREATE TRIGGER update_raffle_progress
  BEFORE UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_raffle_progress();

-- Función para actualizar progreso cuando se compra un número
CREATE OR REPLACE FUNCTION update_raffle_progress_on_number_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar la rifa correspondiente
  UPDATE raffles 
  SET 
    numbers_sold = (
      SELECT COUNT(*) 
      FROM raffle_numbers 
      WHERE raffle_id = NEW.raffle_id
    ),
    sold_percentage = (
      SELECT (COUNT(*)::numeric / r.total_numbers::numeric) * 100
      FROM raffle_numbers rn
      JOIN raffles r ON r.id = NEW.raffle_id
      WHERE rn.raffle_id = NEW.raffle_id
    )
  WHERE id = NEW.raffle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar progreso cuando se compra un número
DROP TRIGGER IF EXISTS update_progress_on_purchase ON raffle_numbers;
CREATE TRIGGER update_progress_on_purchase
  AFTER INSERT ON raffle_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_raffle_progress_on_number_purchase();