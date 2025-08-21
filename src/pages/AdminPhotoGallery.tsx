import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { Save, Trash2, Plus, ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

interface PhotoItem {
  id?: string;
  title: string;
  description?: string;
  image_url: string;
  position: number;
  is_active: boolean;
}

const AdminPhotoGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photo_gallery')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la galería de fotos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = () => {
    const newPhoto: PhotoItem = {
      title: '',
      description: '',
      image_url: '',
      position: photos.length + 1,
      is_active: true
    };
    setPhotos([...photos, newPhoto]);
  };

  const updatePhoto = (index: number, field: keyof PhotoItem, value: any) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = { ...updatedPhotos[index], [field]: value };
    setPhotos(updatedPhotos);
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing photos
      await supabase.from('photo_gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new photos
      if (photos.length > 0) {
        const { error } = await supabase
          .from('photo_gallery')
          .insert(photos.map((photo, index) => ({
            ...photo,
            position: index + 1
          })));
        
        if (error) throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Galería de fotos guardada correctamente",
      });
      
      await loadPhotos();
    } catch (error) {
      console.error('Error saving photos:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la galería de fotos",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando galería de fotos...</div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Galería de Fotos" 
      subtitle="Gestiona las fotos que se mostrarán en tu sitio"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Herramientas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Herramientas de Gestión</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={addPhoto} className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Foto
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Fotos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Fotos Configuradas ({photos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay fotos configuradas. Haz clic en "Agregar Foto" para comenzar.
              </div>
            ) : (
              photos.map((photo, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Foto #{index + 1}</h4>
                    <Button
                      onClick={() => removePhoto(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Título de la Foto</Label>
                      <Input
                        id={`title-${index}`}
                        value={photo.title}
                        onChange={(e) => updatePhoto(index, 'title', e.target.value)}
                        placeholder="Ej: Entrega del premio"
                      />
                    </div>
                    
                    <div>
                      <Label>Imagen</Label>
                      <ImageUpload
                        value={photo.image_url}
                        onChange={(url) => updatePhoto(index, 'image_url', url)}
                        bucket="prize-images"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Sube la imagen desde tu dispositivo. Formatos: JPG, PNG, WebP.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${index}`}>Descripción (Opcional)</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={photo.description || ''}
                      onChange={(e) => updatePhoto(index, 'description', e.target.value)}
                      placeholder="Descripción de la foto"
                      rows={2}
                    />
                  </div>
                  
                  {photo.image_url && (
                    <div className="mt-2">
                      <img 
                        src={photo.image_url} 
                        alt={photo.title}
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Botón Guardar */}
        <div className="flex justify-end sticky bottom-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-black font-bold px-8 py-4 text-lg shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Galería'}</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPhotoGallery;