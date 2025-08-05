import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { prizesAPI, rafflesAPI } from '@/lib/supabase';
import type { Prize, Raffle } from '@/lib/supabase';
import { ArrowLeft, Save, Plus, Edit, Trash2, Gift, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminPrizes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [newPrize, setNewPrize] = useState<Partial<Prize>>({
    name: '',
    description: '',
    image_url: '',
    value: 0,
    position: 1
  });

  useEffect(() => {
    loadRaffles();
  }, []);

  useEffect(() => {
    if (selectedRaffleId) {
      loadPrizes();
    }
  }, [selectedRaffleId]);

  const loadRaffles = async () => {
    try {
      const data = await rafflesAPI.getAll();
      setRaffles(data);
      if (data.length > 0 && !selectedRaffleId) {
        setSelectedRaffleId(data[0].id!);
      }
    } catch (error) {
      console.error('Error loading raffles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rifas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPrizes = async () => {
    if (!selectedRaffleId) return;
    
    try {
      const data = await prizesAPI.getByRaffleId(selectedRaffleId);
      setPrizes(data);
    } catch (error) {
      console.error('Error loading prizes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los premios",
        variant: "destructive",
      });
    }
  };

  const handleSavePrize = async () => {
    if (editingPrize && editingPrize.id) {
      try {
        const updated = await prizesAPI.update(editingPrize.id, editingPrize);
        if (updated) {
          setPrizes(prev => prev.map(p => p.id === editingPrize.id ? updated : p));
          setEditingPrize(null);
          toast({
            title: "Premio actualizado",
            description: "El premio se ha actualizado correctamente",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el premio",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddPrize = async () => {
    if (!selectedRaffleId) {
      toast({
        title: "Error",
        description: "Selecciona una rifa primero",
        variant: "destructive",
      });
      return;
    }

    if (newPrize.name && newPrize.description) {
      try {
        const prizeData = {
          ...newPrize,
          raffle_id: selectedRaffleId,
          position: prizes.length + 1
        } as Omit<Prize, 'id' | 'created_at' | 'updated_at'>;

        const created = await prizesAPI.create(prizeData);
        if (created) {
          setPrizes(prev => [...prev, created]);
          setNewPrize({
            name: '',
            description: '',
            image_url: '',
            value: 0,
            position: 1
          });
          toast({
            title: "Premio agregado",
            description: "El nuevo premio se ha agregado correctamente",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo agregar el premio",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeletePrize = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este premio?')) {
      return;
    }

    try {
      const success = await prizesAPI.delete(id);
      if (success) {
        setPrizes(prev => prev.filter(p => p.id !== id));
        toast({
          title: "Premio eliminado",
          description: "El premio se ha eliminado correctamente",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el premio",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando premios...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Selector de Rifa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <span>Seleccionar Rifa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Label htmlFor="raffle_select">Rifa Activa:</Label>
                <Select value={selectedRaffleId} onValueChange={setSelectedRaffleId}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Selecciona una rifa" />
                  </SelectTrigger>
                  <SelectContent>
                    {raffles.map((raffle) => (
                      <SelectItem key={raffle.id} value={raffle.id!}>
                        {raffle.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {raffles.length === 0 && (
                  <p className="text-muted-foreground">
                    No hay rifas creadas. <Button variant="link" onClick={() => navigate('/admin/raffles')}>Crear una nueva</Button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedRaffleId && (
            <>
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
                    {prizes.length === 0 ? (
                      <div className="text-center py-8">
                        <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No hay premios configurados</h3>
                        <p className="text-muted-foreground">Agrega el primer premio para esta rifa</p>
                      </div>
                    ) : (
                      prizes.map((prize) => (
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
                                  <p className="text-primary font-semibold">Valor: ${prize.value?.toLocaleString()}</p>
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
                                    onClick={() => handleDeletePrize(prize.id!)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPrizes;