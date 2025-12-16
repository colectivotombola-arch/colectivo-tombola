import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { ImageUpload } from '@/components/ImageUpload';
import { Save, Trash2, Plus, ImageIcon, GripVertical, Eye, EyeOff } from 'lucide-react';

interface Prize {
  id?: string;
  name: string;
  description: string;
  value: number;
  image_url?: string;
  position: number;
  is_active: boolean;
  raffle_id?: string;
}

const AdminGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});

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
      setPrizes((data || []).map(p => ({ ...p, is_active: p.is_active ?? true })));
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
      image_url: '',
      is_active: true
    };
    setPrizes([...prizes, newPrize]);
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setPrizes(updatedPrizes);
    
    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const removePrize = (index: number) => {
    if (!confirm('¿Estás seguro de eliminar este premio?')) return;
    const updatedPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(updatedPrizes);
  };

  const movePrize = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === prizes.length - 1) return;
    
    const newPrizes = [...prizes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newPrizes[index], newPrizes[newIndex]] = [newPrizes[newIndex], newPrizes[index]];
    setPrizes(newPrizes);
  };

  const validatePrizes = (): boolean => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    prizes.forEach((prize, index) => {
      if (!prize.name.trim()) {
        newErrors[index] = 'El título es obligatorio';
        isValid = false;
      } else if (!prize.image_url?.trim()) {
        newErrors[index] = 'La imagen es obligatoria';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validatePrizes()) {
      toast({
        title: "Error de validación",
        description: "Todos los premios deben tener título e imagen",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Delete all existing prizes
      await supabase.from('prizes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new prizes
      if (prizes.length > 0) {
        const { error } = await supabase
          .from('prizes')
          .insert(prizes.map((prize, index) => ({
            name: prize.name,
            description: prize.description,
            value: prize.value,
            image_url: prize.image_url,
            position: index + 1,
            is_active: prize.is_active
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
      subtitle="Imágenes de premios que se muestran en la web"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Herramientas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Premios Configurados ({prizes.length})
              </span>
              <Button onClick={addPrize} className="bg-primary hover:bg-primary/90 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Premio
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prizes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay premios configurados. Haz clic en "Agregar Premio" para comenzar.
              </div>
            ) : (
              prizes.map((prize, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 space-y-4 ${errors[index] ? 'border-destructive' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <h4 className="font-semibold text-lg">Premio #{index + 1}</h4>
                      <Badge variant={prize.is_active ? "default" : "secondary"}>
                        {prize.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {prize.is_active ? 'Visible' : 'Oculto'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => movePrize(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => movePrize(index, 'down')}
                        disabled={index === prizes.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        onClick={() => removePrize(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {errors[index] && (
                    <p className="text-sm text-destructive">{errors[index]}</p>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Título del Premio *</Label>
                        <Input
                          id={`name-${index}`}
                          value={prize.name}
                          onChange={(e) => updatePrize(index, 'name', e.target.value)}
                          placeholder="Ej: iPhone 15 Pro Max"
                          className={!prize.name.trim() && errors[index] ? 'border-destructive' : ''}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`description-${index}`}>Descripción (opcional)</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={prize.description}
                          onChange={(e) => updatePrize(index, 'description', e.target.value)}
                          placeholder="Descripción breve del premio"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`value-${index}`}>Valor ($)</Label>
                          <Input
                            id={`value-${index}`}
                            type="number"
                            value={prize.value}
                            onChange={(e) => updatePrize(index, 'value', parseFloat(e.target.value) || 0)}
                            placeholder="1000"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`active-${index}`}
                              checked={prize.is_active}
                              onCheckedChange={(checked) => updatePrize(index, 'is_active', checked)}
                            />
                            <Label htmlFor={`active-${index}`}>Activo</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <ImageUpload
                        value={prize.image_url || ''}
                        onChange={(url) => updatePrize(index, 'image_url', url)}
                        label="Imagen del Premio *"
                        bucket="prize-images"
                      />
                    </div>
                  </div>
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