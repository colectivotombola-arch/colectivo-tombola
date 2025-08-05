-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'TOMBOLA PREMIUM',
  site_tagline TEXT,
  primary_color TEXT NOT NULL DEFAULT '#00e5cc',
  secondary_color TEXT NOT NULL DEFAULT '#1a1a1a',
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  whatsapp_number TEXT,
  instagram_video_url TEXT,
  hero_title TEXT NOT NULL DEFAULT 'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km',
  hero_subtitle TEXT NOT NULL DEFAULT 'Rifas seguras y transparentes con los mejores premios del mercado',
  payment_settings JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  email_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.site_settings (
  site_name,
  primary_color,
  secondary_color,
  hero_title,
  hero_subtitle
) VALUES (
  'TOMBOLA PREMIUM',
  '#00e5cc',
  '#1a1a1a',
  'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km',
  'Rifas seguras y transparentes con los mejores premios del mercado'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();