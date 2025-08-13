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
import { Save, Trash2, Plus, Video, Image } from 'lucide-react';

interface MediaItem {
  id?: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'video' | 'image';
  position: number;
  is_active: boolean;
}

const AdminMediaGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_gallery')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setMedia((data || []) as MediaItem[]);
    } catch (error) {
      console.error('Error loading media:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la galería de medios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedia = (type: 'video' | 'image') => {
    const newMedia: MediaItem = {
      title: '',
      description: '',
      media_url: '',
      media_type: type,
      position: media.length + 1,
      is_active: true
    };
    setMedia([...media, newMedia]);
  };

  const updateMedia = (index: number, field: keyof MediaItem, value: any) => {
    const updatedMedia = [...media];
    updatedMedia[index] = { ...updatedMedia[index], [field]: value };
    setMedia(updatedMedia);
  };

  const removeMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    setMedia(updatedMedia);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing media
      await supabase.from('media_gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new media
      if (media.length > 0) {
        const { error } = await supabase
          .from('media_gallery')
          .insert(media.map((item, index) => ({
            ...item,
            position: index + 1
          })));
        
        if (error) throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Galería de medios guardada correctamente",
      });
      
      await loadMedia();
    } catch (error) {
      console.error('Error saving media:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la galería de medios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando galería de medios...</div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Galería de Videos" 
      subtitle="Gestiona videos de TikTok, Instagram y otros medios"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Herramientas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Agregar Contenido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => addMedia('video')} className="bg-primary hover:bg-primary/90 text-black">
              <Video className="w-4 h-4 mr-2" />
              Agregar Video
            </Button>
            <Button onClick={() => addMedia('image')} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
              <Image className="w-4 h-4 mr-2" />
              Agregar Imagen
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Medios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span>Contenido Configurado ({media.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {media.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay contenido configurado. Agrega videos o imágenes para comenzar.
              </div>
            ) : (
              media.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      {item.media_type === 'video' ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                      {item.media_type === 'video' ? 'Video' : 'Imagen'} #{index + 1}
                    </h4>
                    <Button
                      onClick={() => removeMedia(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Título</Label>
                      <Input
                        id={`title-${index}`}
                        value={item.title}
                        onChange={(e) => updateMedia(index, 'title', e.target.value)}
                        placeholder="Título del contenido"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`media_url-${index}`}>URL del {item.media_type === 'video' ? 'Video' : 'Imagen'}</Label>
                      <Input
                        id={`media_url-${index}`}
                        value={item.media_url}
                        onChange={(e) => updateMedia(index, 'media_url', e.target.value)}
                        placeholder={item.media_type === 'video' ? 
                          "https://www.tiktok.com/@user/video/123 o https://www.instagram.com/p/ABC/" :
                          "https://ejemplo.com/imagen.jpg"
                        }
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${index}`}>Descripción (Opcional)</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={item.description || ''}
                      onChange={(e) => updateMedia(index, 'description', e.target.value)}
                      placeholder="Descripción del contenido"
                      rows={2}
                    />
                  </div>
                  
                  {item.media_url && (
                    <div className="mt-2">
                      {item.media_type === 'video' ? (
                        <div className="aspect-video w-32 bg-black rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      ) : (
                        <img 
                          src={item.media_url} 
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
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

export default AdminMediaGallery;