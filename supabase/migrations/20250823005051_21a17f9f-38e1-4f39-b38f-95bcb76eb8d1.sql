-- Create winners table for past raffle winners
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prize TEXT NOT NULL,
  image_url TEXT,
  date_won DATE NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Create policies for winners
CREATE POLICY "Admins can manage winners" 
ON public.winners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active winners" 
ON public.winners 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_winners_updated_at
BEFORE UPDATE ON public.winners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_winners_position ON public.winners(position);
CREATE INDEX IF NOT EXISTS idx_winners_active ON public.winners(is_active);