-- Fix RLS that references auth.users and add proper triggers for raffle progress

-- 1) Replace raffle_numbers SELECT policy to avoid direct auth.users access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'raffle_numbers' 
      AND policyname = 'Users can view their own purchased numbers'
  ) THEN
    DROP POLICY "Users can view their own purchased numbers" ON public.raffle_numbers;
  END IF;
END$$;

CREATE POLICY "Users can view their own purchased numbers"
ON public.raffle_numbers
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR buyer_email = get_current_user_email()
);

-- 2) Ensure helper functions run with sufficient privileges and proper search_path
CREATE OR REPLACE FUNCTION public.calculate_raffle_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.numbers_sold := (
    SELECT COUNT(*) FROM public.raffle_numbers rn WHERE rn.raffle_id = NEW.id
  );
  NEW.sold_percentage := CASE WHEN NEW.total_numbers > 0 
    THEN (NEW.numbers_sold::numeric / NEW.total_numbers::numeric) * 100 
    ELSE 0 END;
  IF NEW.sold_percentage >= 100 THEN
    NEW.is_sold_out := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_raffle_progress_on_number_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raffle_id uuid := COALESCE(NEW.raffle_id, OLD.raffle_id);
BEGIN
  UPDATE public.raffles r
  SET 
    numbers_sold = (
      SELECT COUNT(*) FROM public.raffle_numbers rn WHERE rn.raffle_id = v_raffle_id
    ),
    sold_percentage = (
      SELECT CASE WHEN r.total_numbers > 0 
        THEN (COUNT(*)::numeric / r.total_numbers::numeric) * 100
        ELSE 0 END
      FROM public.raffle_numbers rn 
      WHERE rn.raffle_id = v_raffle_id
    ),
    is_sold_out = (
      SELECT CASE WHEN r.total_numbers > 0 
        THEN (COUNT(*)::numeric >= r.total_numbers::numeric)
        ELSE false END
    )
  WHERE r.id = v_raffle_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3) Create triggers (if not existing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_raffles_calc_progress'
  ) THEN
    CREATE TRIGGER trg_raffles_calc_progress
    BEFORE UPDATE ON public.raffles
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_raffle_progress();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rn_update_progress_ins'
  ) THEN
    CREATE TRIGGER trg_rn_update_progress_ins
    AFTER INSERT ON public.raffle_numbers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_raffle_progress_on_number_purchase();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rn_update_progress_del'
  ) THEN
    CREATE TRIGGER trg_rn_update_progress_del
    AFTER DELETE ON public.raffle_numbers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_raffle_progress_on_number_purchase();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rn_update_progress_upd'
  ) THEN
    CREATE TRIGGER trg_rn_update_progress_upd
    AFTER UPDATE OF payment_status, raffle_id, number_value ON public.raffle_numbers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_raffle_progress_on_number_purchase();
  END IF;
END $$;
