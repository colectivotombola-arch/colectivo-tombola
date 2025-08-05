import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Edit, Trash2, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Prize {
  id: string;
  name: string;
  description: string;
  image_url: string;
  value: number;
  position: number;
}

const AdminPrizes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<Prize[]>([
    {
      id: '1',
      name: 'TOYOTA FORTUNER 4X4',
      description: 'Camioneta Toyota Fortuner 4x4 modelo 2024, 0 kilómetros',
      image_url: '/src/assets/toyota-fortuner.jpg',
      value: 45000,
      position: 1
    },
    {
      id: '2', 
      name: 'CHEVROLET ONIX TURBO RS',
      description: 'Automóvil Chevrolet Onix Turbo RS 0km modelo 2024',
      image_url: '/src/assets/chevrolet-onix.jpg',
      value: 25000,
      position: 2
    }
  ]);
  
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    name: '',
    description: '',
    image_url: '',
    value: 0,
    position: prizes.length + 1
  });

  const handleSavePrize = () => {
    if (editingPrize) {
      setPrizes(prev => prev.map(p => p.id === editingPrize.id ? editingPrize : p));
      setEditingPrize(null);
      toast({
        title: "Premio actualizado",
        description: "El premio se ha actualizado correctamente",
      });
    }
  };

  const handleAddPrize = () => {
    if (newPrize.name && newPrize.description) {
      const prize: Prize = {
        id: Date.now().toString(),
        name: newPrize.name,
        description: newPrize.description,
        image_url: newPrize.image_url || '',
        value: newPrize.value || 0,
        position: newPrize.position || prizes.length + 1
      };
      setPrizes(prev => [...prev, prize]);
      setNewPrize({
        name: '',
        description: '',
        image_url: '',
        value: 0,
        position: prizes.length + 2
      });
      toast({
        title: "Premio agregado",
        description: "El nuevo premio se ha agregado correctamente",
      });
    }
  };

  const handleDeletePrize = (id: string) => {
    setPrizes(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Premio eliminado",
      description: "El premio se ha eliminado correctamente",
    });
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
              <h1 className="text-2xl font-bold text-foreground">Gestionar Premios</h1>
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
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Agregar Nuevo Premio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Agregar Nuevo Premio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new_name">Nombre del Premio</Label>
                  <Input
                    id="new_name"
                    value={newPrize.name}
                    onChange={(e) => setNewPrize(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Toyota Camry 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="new_value">Valor Estimado ($)</Label>
                  <Input
                    id="new_value"
                    type="number"
                    value={newPrize.value}
                    onChange={(e) => setNewPrize(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                    placeholder="25000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="new_description">Descripción del Premio</Label>
                <Textarea
                  id="new_description"
                  value={newPrize.description}
                  onChange={(e) => setNewPrize(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada del premio..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="new_image">URL de la Imagen</Label>
                <Input
                  id="new_image"
                  value={newPrize.image_url}
                  onChange={(e) => setNewPrize(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <Button onClick={handleAddPrize} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Premio
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Premios Existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Premios Actuales</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prizes.map((prize) => (
                  <Card key={prize.id} className="border-primary/20">
                    <CardContent className="p-6">
                      {editingPrize?.id === prize.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`edit_name_${prize.id}`}>Nombre</Label>
                              <Input
                                id={`edit_name_${prize.id}`}
                                value={editingPrize.name}
                                onChange={(e) => setEditingPrize(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit_value_${prize.id}`}>Valor ($)</Label>
                              <Input
                                id={`edit_value_${prize.id}`}
                                type="number"
                                value={editingPrize.value}
                                onChange={(e) => setEditingPrize(prev => prev ? { ...prev, value: parseInt(e.target.value) } : null)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`edit_description_${prize.id}`}>Descripción</Label>
                            <Textarea
                              id={`edit_description_${prize.id}`}
                              value={editingPrize.description}
                              onChange={(e) => setEditingPrize(prev => prev ? { ...prev, description: e.target.value } : null)}
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`edit_image_${prize.id}`}>URL de Imagen</Label>
                            <Input
                              id={`edit_image_${prize.id}`}
                              value={editingPrize.image_url}
                              onChange={(e) => setEditingPrize(prev => prev ? { ...prev, image_url: e.target.value } : null)}
                            />
                          </div>

                          <div className="flex space-x-2">
                            <Button onClick={handleSavePrize}>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar
                            </Button>
                            <Button variant="outline" onClick={() => setEditingPrize(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground">{prize.name}</h3>
                            <p className="text-muted-foreground mb-2">{prize.description}</p>
                            <p className="text-primary font-semibold">Valor: ${prize.value.toLocaleString()}</p>
                            {prize.image_url && (
                              <p className="text-sm text-muted-foreground mt-1">Imagen: {prize.image_url}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingPrize(prize)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeletePrize(prize.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPrizes;