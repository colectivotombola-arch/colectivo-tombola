-- Crear sistema de storage para subir imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prize-images', 'prize-images', true);

-- Políticas para el bucket de imágenes de premios
CREATE POLICY "Prize images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'prize-images');

CREATE POLICY "Admins can upload prize images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'prize-images' AND auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can update prize images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'prize-images' AND auth.jwt()->>'role' = 'authenticated');

CREATE POLICY "Admins can delete prize images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'prize-images' AND auth.jwt()->>'role' = 'authenticated');