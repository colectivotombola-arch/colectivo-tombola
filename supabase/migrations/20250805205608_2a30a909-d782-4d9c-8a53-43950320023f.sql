-- Crear tabla de rifas/actividades
CREATE TABLE public.raffles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    prize_image TEXT,
    total_numbers INTEGER NOT NULL DEFAULT 1000,
    price_per_number DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    draw_date TIMESTAMP WITH TIME ZONE,
    winner_number INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de premios
CREATE TABLE public.prizes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    value DECIMAL(10,2) DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de números vendidos
CREATE TABLE public.raffle_numbers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
    number_value INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    buyer_email TEXT,
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(raffle_id, number_value)
);

-- Crear tabla de configuraciones dinámicas
CREATE TABLE public.dynamic_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para raffles
CREATE POLICY "Todos pueden ver rifas activas" 
ON public.raffles FOR SELECT 
USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins pueden gestionar rifas" 
ON public.raffles FOR ALL 
USING (has_role(auth.uid(), 'admin')) 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para prizes
CREATE POLICY "Todos pueden ver premios" 
ON public.prizes FOR SELECT 
USING (true);

CREATE POLICY "Admins pueden gestionar premios" 
ON public.prizes FOR ALL 
USING (has_role(auth.uid(), 'admin')) 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para raffle_numbers
CREATE POLICY "Usuarios pueden comprar números" 
ON public.raffle_numbers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Todos pueden ver números vendidos" 
ON public.raffle_numbers FOR SELECT 
USING (true);

CREATE POLICY "Admins pueden gestionar números" 
ON public.raffle_numbers FOR ALL 
USING (has_role(auth.uid(), 'admin')) 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para dynamic_settings
CREATE POLICY "Todos pueden leer configuraciones públicas" 
ON public.dynamic_settings FOR SELECT 
USING (category IN ('public', 'general'));

CREATE POLICY "Admins pueden gestionar configuraciones" 
ON public.dynamic_settings FOR ALL 
USING (has_role(auth.uid(), 'admin')) 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Triggers para updated_at
CREATE TRIGGER update_raffles_updated_at
    BEFORE UPDATE ON public.raffles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at
    BEFORE UPDATE ON public.prizes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dynamic_settings_updated_at
    BEFORE UPDATE ON public.dynamic_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar configuraciones iniciales
INSERT INTO public.dynamic_settings (key, value, description, category) VALUES
('payment_methods', '{"bank_transfer": true, "paypal": false, "crypto": false, "cash": true}', 'Métodos de pago habilitados', 'payment'),
('contact_info', '{"whatsapp": "+573001234567", "email": "info@tombola.com", "phone": "+573001234567"}', 'Información de contacto', 'public'),
('social_media', '{"facebook": "", "instagram": "", "tiktok": "", "youtube": ""}', 'Enlaces de redes sociales', 'public'),
('prizes_config', '{"show_values": true, "show_images": true, "max_prizes": 10}', 'Configuración de premios', 'general');

-- Crear una rifa de ejemplo
INSERT INTO public.raffles (title, description, total_numbers, price_per_number, status) VALUES
('TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km', 'Gran rifa con dos increíbles vehículos 0km. Toyota Fortuner 4x4 y Chevrolet Onix Turbo RS. Rifas seguras y transparentes con los mejores premios del mercado.', 1000, 25.00, 'active');

-- Obtener el ID de la rifa creada e insertar premios
DO $$
DECLARE
    raffle_id_var UUID;
BEGIN
    SELECT id INTO raffle_id_var FROM public.raffles WHERE title = 'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km' LIMIT 1;
    
    INSERT INTO public.prizes (raffle_id, name, description, value, position) VALUES
    (raffle_id_var, 'TOYOTA FORTUNER 4X4', 'Camioneta Toyota Fortuner 4x4 modelo 2024, 0 kilómetros, color a elección', 45000.00, 1),
    (raffle_id_var, 'CHEVROLET ONIX TURBO RS', 'Automóvil Chevrolet Onix Turbo RS 0km modelo 2024, color a elección', 25000.00, 2);
END $$;