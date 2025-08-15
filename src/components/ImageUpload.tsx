import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  bucket?: string;
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Imagen",
  className = "",
  bucket = "prize-images"
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos JPG, PNG, WebP y GIF",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo no puede ser mayor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onChange(publicUrl);

      toast({
        title: "¡Éxito!",
        description: "Imagen subida correctamente",
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      
      <div className="space-y-4">
        {/* Vista previa de imagen */}
        {preview && (
          <div className="relative inline-block">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Subiendo...' : preview ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="ghost"
              onClick={removeImage}
              className="flex items-center gap-2 text-destructive"
            >
              <X className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>

        {/* Input oculto para archivos */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />

        {/* URL manual (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="manual-url" className="text-sm text-muted-foreground">
            O ingresa una URL de imagen:
          </Label>
          <div className="flex gap-2">
            <Input
              id="manual-url"
              type="url"
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value);
                setPreview(e.target.value);
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreview(value || '')}
              disabled={!value}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos soportados: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB
      </p>
    </div>
  );
};