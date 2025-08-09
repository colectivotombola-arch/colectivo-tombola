import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { Upload, Save, Trash2, Plus, ImageIcon } from 'lucide-react';

interface Prize {
  id?: string;
  name: string;
  description: string;
  value: number;
  image_url?: string;
  position: number;
  raffle_id?: string;
}

const AdminGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error loading prizes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los premios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPrize = () => {
    const newPrize: Prize = {
      name: '',
      description: '',
      value: 0,
      position: prizes.length + 1,
      image_url: ''
    };
    setPrizes([...prizes, newPrize]);
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setPrizes(updatedPrizes);
  };

  const removePrize = (index: number) => {
    const updatedPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(updatedPrizes);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete all existing prizes
      await supabase.from('prizes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new prizes
      if (prizes.length > 0) {
        const { error } = await supabase
          .from('prizes')
          .insert(prizes.map((prize, index) => ({
            ...prize,
            position: index + 1
          })));
        
        if (error) throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Galería de premios guardada correctamente",
      });
      
      await loadPrizes();
    } catch (error) {
      console.error('Error saving prizes:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la galería",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando galería...</div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Galería de Premios" 
      subtitle="Gestiona los premios que se mostrarán en tu sitio"
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
            <Button onClick={addPrize} className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Premio
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Premios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Premios Configurados ({prizes.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prizes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay premios configurados. Haz clic en "Agregar Premio" para comenzar.
              </div>
            ) : (
              prizes.map((prize, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Premio #{index + 1}</h4>
                    <Button
                      onClick={() => removePrize(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Nombre del Premio</Label>
                      <Input
                        id={`name-${index}`}
                        value={prize.name}
                        onChange={(e) => updatePrize(index, 'name', e.target.value)}
                        placeholder="Ej: iPhone 15 Pro Max"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`value-${index}`}>Valor del Premio ($)</Label>
                      <Input
                        id={`value-${index}`}
                        type="number"
                        value={prize.value}
                        onChange={(e) => updatePrize(index, 'value', parseFloat(e.target.value) || 0)}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${index}`}>Descripción</Label>
                    <Input
                      id={`description-${index}`}
                      value={prize.description}
                      onChange={(e) => updatePrize(index, 'description', e.target.value)}
                      placeholder="Descripción detallada del premio"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`image-${index}`}>URL de la Imagen</Label>
                    <Input
                      id={`image-${index}`}
                      value={prize.image_url || ''}
                      onChange={(e) => updatePrize(index, 'image_url', e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  
                  {prize.image_url && (
                    <div className="mt-2">
                      <img 
                        src={prize.image_url} 
                        alt={prize.name}
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

export default AdminGallery;