-- Add missing columns to transferencias table for complete transfer management
ALTER TABLE public.transferencias 
ADD COLUMN IF NOT EXISTS raffle_id uuid REFERENCES public.raffles(id),
ADD COLUMN IF NOT EXISTS package_id uuid,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS comprobante_url text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transferencias_status ON public.transferencias(status);
CREATE INDEX IF NOT EXISTS idx_transferencias_raffle_id ON public.transferencias(raffle_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_transferencias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transferencias_updated_at ON public.transferencias;
CREATE TRIGGER update_transferencias_updated_at
  BEFORE UPDATE ON public.transferencias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transferencias_updated_at();

-- Enable RLS
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;

-- Policy for public inserts (anyone can submit a transfer)
DROP POLICY IF EXISTS "Anyone can submit transfer" ON public.transferencias;
CREATE POLICY "Anyone can submit transfer"
ON public.transferencias
FOR INSERT
WITH CHECK (true);

-- Policy for admins to view and manage all transfers
DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transferencias;
CREATE POLICY "Admins can view all transfers"
ON public.transferencias
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update transfers" ON public.transferencias;
CREATE POLICY "Admins can update transfers"
ON public.transferencias
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete transfers" ON public.transferencias;
CREATE POLICY "Admins can delete transfers"
ON public.transferencias
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);