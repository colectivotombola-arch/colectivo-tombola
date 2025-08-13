import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { Save, Trash2, Plus, Trophy } from 'lucide-react';

interface PrizeDisplay {
  id?: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  position: number;
  is_active: boolean;
}

const AdminPrizeDisplays = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prizeDisplays, setPrizeDisplays] = useState<PrizeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrizeDisplays();
  }, []);

  const loadPrizeDisplays = async () => {
    try {
      const { data, error } = await supabase
        .from('prize_displays')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setPrizeDisplays(data || []);
    } catch (error) {
      console.error('Error loading prize displays:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las pantallas de premios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPrizeDisplay = () => {
    const newDisplay: PrizeDisplay = {
      title: '',
      subtitle: '',
      image_url: '',
      position: prizeDisplays.length + 1,
      is_active: true
    };
    setPrizeDisplays([...prizeDisplays, newDisplay]);
  };

  const updatePrizeDisplay = (index: number, field: keyof PrizeDisplay, value: any) => {
    const updatedDisplays = [...prizeDisplays];
    updatedDisplays[index] = { ...updatedDisplays[index], [field]: value };
    setPrizeDisplays(updatedDisplays);
  };

  const removePrizeDisplay = (index: number) => {
    const updatedDisplays = prizeDisplays.filter((_, i) => i !== index);
    setPrizeDisplays(updatedDisplays);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing prize displays
      await supabase.from('prize_displays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new prize displays
      if (prizeDisplays.length > 0) {
        const { error } = await supabase
          .from('prize_displays')
          .insert(prizeDisplays.map((display, index) => ({
            ...display,
            position: index + 1
          })));
        
        if (error) throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Pantallas de premios guardadas correctamente",
      });
      
      await loadPrizeDisplays();
    } catch (error) {
      console.error('Error saving prize displays:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las pantallas de premios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando pantallas de premios...</div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Pantallas de Premios" 
      subtitle="Configura las pantallas dinámicas de premios (Primera Suerte, Segunda Suerte, etc.)"
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
            <Button onClick={addPrizeDisplay} className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Pantalla de Premio
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Agrega hasta 5 pantallas diferentes para mostrar distintos premios (Primera Suerte, Segunda Suerte, etc.)
            </p>
          </CardContent>
        </Card>

        {/* Lista de Pantallas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Pantallas Configuradas ({prizeDisplays.length}/5)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prizeDisplays.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay pantallas configuradas. Agrega la primera pantalla para comenzar.
              </div>
            ) : (
              prizeDisplays.map((display, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">
                      {index === 0 ? 'Primera Suerte' : 
                       index === 1 ? 'Segunda Suerte' : 
                       index === 2 ? 'Tercera Suerte' : 
                       index === 3 ? 'Cuarta Suerte' : 
                       'Quinta Suerte'} - Pantalla #{index + 1}
                    </h4>
                    <Button
                      onClick={() => removePrizeDisplay(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Título del Premio</Label>
                      <Input
                        id={`title-${index}`}
                        value={display.title}
                        onChange={(e) => updatePrizeDisplay(index, 'title', e.target.value)}
                        placeholder="Ej: TOYOTA FORTUNER 4X4"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`subtitle-${index}`}>Subtítulo (Opcional)</Label>
                      <Input
                        id={`subtitle-${index}`}
                        value={display.subtitle || ''}
                        onChange={(e) => updatePrizeDisplay(index, 'subtitle', e.target.value)}
                        placeholder="Ej: 0km"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`image_url-${index}`}>URL de la Imagen del Premio</Label>
                    <Input
                      id={`image_url-${index}`}
                      value={display.image_url || ''}
                      onChange={(e) => updatePrizeDisplay(index, 'image_url', e.target.value)}
                      placeholder="https://ejemplo.com/premio.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Puedes subir fotos desde tu celular. Formatos: JPG, PNG, WebP
                    </p>
                  </div>
                  
                  {display.image_url && (
                    <div className="mt-2">
                      <img 
                        src={display.image_url} 
                        alt={display.title}
                        className="w-48 h-32 object-cover rounded-lg border"
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
            disabled={saving || prizeDisplays.length > 5}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-black font-bold px-8 py-4 text-lg shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Pantallas'}</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPrizeDisplays;