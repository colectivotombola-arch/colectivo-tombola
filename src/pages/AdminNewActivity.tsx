import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewActivity {
  title: string;
  description: string;
  prize_1: string;
  prize_2: string;
  prize_3: string;
  total_numbers: number;
  price_per_number: number;
  start_date: string;
  end_date: string;
  draw_date: string;
  status: 'draft' | 'active' | 'completed';
  image_url: string;
  rules: string;
}

const AdminNewActivity = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<NewActivity>({
    title: '',
    description: '',
    prize_1: '',
    prize_2: '',
    prize_3: '',
    total_numbers: 1000,
    price_per_number: 10,
    start_date: '',
    end_date: '',
    draw_date: '',
    status: 'draft',
    image_url: '',
    rules: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aquí se guardaría en la base de datos
      console.log('Saving activity:', activity);
      
      toast({
        title: "¡Actividad creada!",
        description: "La nueva actividad se ha creado correctamente",
      });
      
      // Redirigir al panel admin
      navigate('/admin');
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la actividad",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateActivity = (field: keyof NewActivity, value: any) => {
    setActivity(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Panel</span>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Nueva Actividad/Rifa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Admin</span>
              <Button variant="outline" onClick={() => navigate('/')}>
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la Actividad</Label>
                <Input
                  id="title"
                  value={activity.title}
                  onChange={(e) => updateActivity('title', e.target.value)}
                  placeholder="Ej: GRAN RIFA TOYOTA FORTUNER + CHEVROLET ONIX"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={activity.description}
                  onChange={(e) => updateActivity('description', e.target.value)}
                  placeholder="Describe los detalles de la rifa..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL de Imagen Principal</Label>
                <Input
                  id="image_url"
                  value={activity.image_url}
                  onChange={(e) => updateActivity('image_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen-actividad.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Premios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Premios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prize_1">Primer Premio</Label>
                <Input
                  id="prize_1"
                  value={activity.prize_1}
                  onChange={(e) => updateActivity('prize_1', e.target.value)}
                  placeholder="Ej: Toyota Fortuner 4x4 0km"
                />
              </div>
              
              <div>
                <Label htmlFor="prize_2">Segundo Premio</Label>
                <Input
                  id="prize_2"
                  value={activity.prize_2}
                  onChange={(e) => updateActivity('prize_2', e.target.value)}
                  placeholder="Ej: Chevrolet Onix Turbo RS 0km"
                />
              </div>

              <div>
                <Label htmlFor="prize_3">Tercer Premio (Opcional)</Label>
                <Input
                  id="prize_3"
                  value={activity.prize_3}
                  onChange={(e) => updateActivity('prize_3', e.target.value)}
                  placeholder="Ej: $5,000 en efectivo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Números */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Números</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_numbers">Total de Números</Label>
                  <Input
                    id="total_numbers"
                    type="number"
                    value={activity.total_numbers}
                    onChange={(e) => updateActivity('total_numbers', parseInt(e.target.value))}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_number">Precio por Número ($)</Label>
                  <Input
                    id="price_per_number"
                    type="number"
                    value={activity.price_per_number}
                    onChange={(e) => updateActivity('price_per_number', parseFloat(e.target.value))}
                    placeholder="10.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Fechas Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha de Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={activity.start_date}
                    onChange={(e) => updateActivity('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={activity.end_date}
                    onChange={(e) => updateActivity('end_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="draw_date">Fecha del Sorteo</Label>
                  <Input
                    id="draw_date"
                    type="date"
                    value={activity.draw_date}
                    onChange={(e) => updateActivity('draw_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado y Reglas */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Reglas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={activity.status} onValueChange={(value: 'draft' | 'active' | 'completed') => updateActivity('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rules">Reglas y Términos</Label>
                <Textarea
                  id="rules"
                  value={activity.rules}
                  onChange={(e) => updateActivity('rules', e.target.value)}
                  placeholder="Especifica las reglas, términos y condiciones de la rifa..."
                  rows={6}
                />
              </div>
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
              <span>{saving ? 'Guardando...' : 'Crear Actividad'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewActivity;