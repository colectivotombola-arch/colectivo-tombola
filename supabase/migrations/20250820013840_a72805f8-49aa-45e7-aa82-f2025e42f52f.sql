-- Add is_sold_out column to raffles table
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;

-- Update trigger to handle sold out status in raffle progress calculation
CREATE OR REPLACE FUNCTION public.calculate_raffle_progress()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calculate sold numbers and percentage
  NEW.numbers_sold := (
    SELECT COUNT(*) 
    FROM raffle_numbers 
    WHERE raffle_id = NEW.id
  );
  
  NEW.sold_percentage := (NEW.numbers_sold::numeric / NEW.total_numbers::numeric) * 100;
  
  -- Auto-set sold out status if 100% sold
  IF NEW.sold_percentage >= 100 THEN
    NEW.is_sold_out := true;
  END IF;
  
  RETURN NEW;
END;
$function$;