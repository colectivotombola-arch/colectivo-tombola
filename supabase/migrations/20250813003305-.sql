-- 1. Create table for videos/media gallery
CREATE TABLE IF NOT EXISTS public.media_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video', -- 'video', 'image'
  position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create table for photo gallery (separate from prizes)
CREATE TABLE IF NOT EXISTS public.photo_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create table for dynamic prize display configuration
CREATE TABLE IF NOT EXISTS public.prize_displays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_displays ENABLE ROW LEVEL SECURITY;

-- Create policies for media_gallery
CREATE POLICY "Everyone can view media gallery" 
ON public.media_gallery 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage media gallery" 
ON public.media_gallery 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for photo_gallery
CREATE POLICY "Everyone can view photo gallery" 
ON public.photo_gallery 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage photo gallery" 
ON public.photo_gallery 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for prize_displays
CREATE POLICY "Everyone can view prize displays" 
ON public.prize_displays 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage prize displays" 
ON public.prize_displays 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_media_gallery_updated_at
BEFORE UPDATE ON public.media_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_gallery_updated_at
BEFORE UPDATE ON public.photo_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prize_displays_updated_at
BEFORE UPDATE ON public.prize_displays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();