-- Arreglar política RLS para site_settings
DROP POLICY IF EXISTS "Admins can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;

-- Crear políticas RLS correctas para site_settings
CREATE POLICY "Admins can read and update site settings" 
ON site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que todos puedan leer configuraciones básicas del sitio (para mostrar en la página)
CREATE POLICY "Everyone can read basic site settings" 
ON site_settings 
FOR SELECT 
USING (true);

-- Asegurar que exista un registro inicial en site_settings
INSERT INTO site_settings (
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
) ON CONFLICT (id) DO NOTHING;

-- Crear tabla para configuraciones de diseño personalizadas
CREATE TABLE IF NOT EXISTS design_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  font_family TEXT DEFAULT 'Inter',
  font_size_base INTEGER DEFAULT 16,
  font_size_heading INTEGER DEFAULT 24,
  border_radius INTEGER DEFAULT 8,
  theme_mode TEXT DEFAULT 'light',
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para design_settings
ALTER TABLE design_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage design settings" 
ON design_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can read design settings" 
ON design_settings 
FOR SELECT 
USING (true);

-- Insertar configuración inicial de diseño
INSERT INTO design_settings DEFAULT VALUES ON CONFLICT DO NOTHING;