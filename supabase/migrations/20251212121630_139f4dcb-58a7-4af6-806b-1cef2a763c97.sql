-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  email text NOT NULL,
  cantidad_boletos integer NOT NULL,
  total numeric NOT NULL,
  metodo_pago text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public can create orders (guest checkout)
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  nombre IS NOT NULL AND 
  telefono IS NOT NULL AND 
  email IS NOT NULL AND 
  cantidad_boletos > 0 AND 
  total > 0
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage orders
CREATE POLICY "Admins can manage orders"
ON public.orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create transferencias table
CREATE TABLE public.transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  monto_pagado numeric NOT NULL,
  numero_referencia text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;

-- Public can create transferencias
CREATE POLICY "Public can create transferencias"
ON public.transferencias
FOR INSERT
WITH CHECK (
  nombre IS NOT NULL AND 
  email IS NOT NULL AND 
  monto_pagado > 0
);

-- Admins can view all transferencias
CREATE POLICY "Admins can view transferencias"
ON public.transferencias
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage transferencias
CREATE POLICY "Admins can manage transferencias"
ON public.transferencias
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));