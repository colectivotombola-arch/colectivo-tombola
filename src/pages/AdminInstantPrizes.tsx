import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, type Raffle, type InstantPrize } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2,
  Gift,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminInstantPrizes = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [instantPrizes, setInstantPrizes] = useState<InstantPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      const data = await rafflesAPI.getAll();
      setRaffles(data);
      if (data.length > 0) {
        const activeRaffle = data.find(r => r.status === 'active') || data[0];
        setSelectedRaffle(activeRaffle);
        setInstantPrizes(activeRaffle.instant_prizes || []);
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

  const handleRaffleChange = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setInstantPrizes(raffle.instant_prizes || []);
  };

  const addInstantPrize = () => {
    const newPrize: InstantPrize = {
      number: '',
      claimed: false,
      prize_amount: 0
    };
    setInstantPrizes([...instantPrizes, newPrize]);
  };

  const updateInstantPrize = (index: number, field: keyof InstantPrize, value: any) => {
    const updated = [...instantPrizes];
    updated[index] = { ...updated[index], [field]: value };
    setInstantPrizes(updated);
  };

  const removeInstantPrize = (index: number) => {
    const updated = instantPrizes.filter((_, i) => i !== index);
    setInstantPrizes(updated);
  };

  const generateRandomNumbers = (count: number) => {
    if (!selectedRaffle) return;
    
    const randomPrizes: InstantPrize[] = [];
    const usedNumbers = new Set(instantPrizes.map(p => p.number));
    
    for (let i = 0; i < count; i++) {
      let number: string;
      do {
        number = Math.floor(Math.random() * selectedRaffle.total_numbers).toString().padStart(5, '0');
      } while (usedNumbers.has(number));
      
      usedNumbers.add(number);
      randomPrizes.push({
        number,
        claimed: false,
        prize_amount: 100
      });
    }
    
    setInstantPrizes([...instantPrizes, ...randomPrizes]);
  };

  const handleSave = async () => {
    if (!selectedRaffle) return;
    
    setSaving(true);
    try {
      const result = await rafflesAPI.update(selectedRaffle.id!, {
        instant_prizes: instantPrizes
      });
      
      if (result) {
        toast({
          title: "¡Éxito!",
          description: "Los premios instantáneos se guardaron correctamente",
        });
        
        // Actualizar la rifa en el estado
        setRaffles(raffles.map(r => 
          r.id === selectedRaffle.id ? { ...r, instant_prizes: instantPrizes } : r
        ));
      } else {
        throw new Error('Failed to save instant prizes');
      }
    } catch (error) {
      console.error('Error saving instant prizes:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los premios instantáneos",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando premios instantáneos...</div>
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
                <span>Volver</span>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Premios Instantáneos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">{user?.email}</span>
              <Button variant="outline" onClick={signOut}>
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
                <Gift className="w-5 h-5" />
                <span>Seleccionar Rifa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {raffles.map((raffle) => (
                  <Card 
                    key={raffle.id}
                    className={`cursor-pointer transition-all ${
                      selectedRaffle?.id === raffle.id 
                        ? 'ring-2 ring-primary bg-primary/10' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleRaffleChange(raffle)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-2">{raffle.title}</h3>
                      <p className="text-muted-foreground text-xs mb-2">{raffle.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          raffle.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {raffle.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {raffle.instant_prizes?.length || 0} premios
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedRaffle && (
            <>
              {/* Herramientas de Generación */}
              <Card>
                <CardHeader>
                  <CardTitle>Herramientas de Generación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      onClick={() => generateRandomNumbers(5)}
                      variant="outline"
                    >
                      Generar 5 números aleatorios
                    </Button>
                    <Button 
                      onClick={() => generateRandomNumbers(10)}
                      variant="outline"
                    >
                      Generar 10 números aleatorios
                    </Button>
                    <Button 
                      onClick={addInstantPrize}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Premio Manual</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Los números bendecidos aparecerán en la página de compra y se mostrarán como premios adicionales.
                  </p>
                </CardContent>
              </Card>

              {/* Lista de Premios Instantáneos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Premios Instantáneos - {selectedRaffle.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {instantPrizes.length} premios configurados
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {instantPrizes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay premios instantáneos configurados</p>
                      <Button 
                        onClick={addInstantPrize}
                        className="mt-4"
                      >
                        Agregar Primer Premio
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {instantPrizes.map((prize, index) => (
                        <div 
                          key={index}
                          className="flex items-center space-x-4 p-4 border rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`number-${index}`}>Número</Label>
                              <Input
                                id={`number-${index}`}
                                value={prize.number}
                                onChange={(e) => updateInstantPrize(index, 'number', e.target.value)}
                                placeholder="00000"
                                maxLength={5}
                                className="font-mono"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`amount-${index}`}>Premio ($)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id={`amount-${index}`}
                                  type="number"
                                  value={prize.prize_amount || 0}
                                  onChange={(e) => updateInstantPrize(index, 'prize_amount', parseFloat(e.target.value) || 0)}
                                  placeholder="100"
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={prize.claimed}
                                  onChange={(e) => updateInstantPrize(index, 'claimed', e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm">¿Premio entregado?</span>
                              </label>
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeInstantPrize(index)}
                                className="flex items-center space-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Eliminar</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botón de Guardar */}
              <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 border rounded-lg">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg px-8 py-4"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Premios Instantáneos'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInstantPrizes;