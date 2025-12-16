import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, rafflePackagesAPI, type Raffle, type RafflePackage } from '@/lib/supabase';
import { Plus, Trash2, Star, Package, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { toInt, toFloat } from '@/lib/numberUtils';

const AdminPackages = () => {
  const { toast } = useToast();
  
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [packages, setPackages] = useState<RafflePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<RafflePackage | null>(null);
  
  const [newPackage, setNewPackage] = useState({
    ticket_count: '',
    price_per_ticket: '',
    is_popular: false,
    display_order: ''
  });

  useEffect(() => {
    loadRaffles();
  }, []);

  useEffect(() => {
    if (selectedRaffle) {
      loadPackages();
    }
  }, [selectedRaffle]);

  const loadRaffles = async () => {
    try {
      const data = await rafflesAPI.getAll();
      setRaffles(data);
      if (data.length > 0 && !selectedRaffle) {
        setSelectedRaffle(data[0]);
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

  const loadPackages = async () => {
    if (!selectedRaffle) return;
    
    try {
      const data = await rafflePackagesAPI.getByRaffle(selectedRaffle.id!);
      setPackages(data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive",
      });
    }
  };

  const handleCreatePackage = async () => {
    if (!selectedRaffle || !newPackage.ticket_count || !newPackage.price_per_ticket) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      // If marking as popular, unmark others first
      if (newPackage.is_popular) {
        await unmarkOtherPopular();
      }

      const packageData = {
        raffle_id: selectedRaffle.id!,
        ticket_count: parseInt(newPackage.ticket_count),
        price_per_ticket: parseFloat(newPackage.price_per_ticket),
        is_popular: newPackage.is_popular,
        display_order: parseInt(newPackage.display_order) || packages.length + 1
      };

      await rafflePackagesAPI.create(packageData);
      
      toast({
        title: "¡Éxito!",
        description: "Paquete creado correctamente",
      });
      
      setNewPackage({
        ticket_count: '',
        price_per_ticket: '',
        is_popular: false,
        display_order: ''
      });
      
      loadPackages();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el paquete",
        variant: "destructive",
      });
    }
  };

  const unmarkOtherPopular = async () => {
    const popularPackages = packages.filter(p => p.is_popular);
    for (const pkg of popularPackages) {
      await rafflePackagesAPI.update(pkg.id!, { ...pkg, is_popular: false });
    }
  };

  const handleUpdatePackage = async (pkg: RafflePackage) => {
    try {
      // If marking as popular, unmark others first
      if (pkg.is_popular) {
        const otherPopular = packages.filter(p => p.is_popular && p.id !== pkg.id);
        for (const other of otherPopular) {
          await rafflePackagesAPI.update(other.id!, { ...other, is_popular: false });
        }
      }

      await rafflePackagesAPI.update(pkg.id!, pkg);
      
      toast({
        title: "¡Éxito!",
        description: "Paquete actualizado correctamente",
      });
      
      setEditingPackage(null);
      loadPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paquete",
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paquete?')) return;
    
    try {
      await rafflePackagesAPI.delete(packageId);
      
      toast({
        title: "¡Éxito!",
        description: "Paquete eliminado correctamente",
      });
      
      loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el paquete",
        variant: "destructive",
      });
    }
  };

  const movePackage = async (pkg: RafflePackage, direction: 'up' | 'down') => {
    const currentIndex = packages.findIndex(p => p.id === pkg.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === packages.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherPkg = packages[newIndex];

    try {
      await Promise.all([
        rafflePackagesAPI.update(pkg.id!, { ...pkg, display_order: otherPkg.display_order }),
        rafflePackagesAPI.update(otherPkg.id!, { ...otherPkg, display_order: pkg.display_order })
      ]);
      
      loadPackages();
    } catch (error) {
      console.error('Error moving package:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el orden",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = (ticketCount: number, pricePerTicket: number) => {
    return (ticketCount * pricePerTicket).toFixed(2);
  };

  if (loading) {
    return (
      <AdminLayout 
        title="Gestión de Paquetes" 
        subtitle="Combos de boletos por rifa"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestión de Paquetes" 
      subtitle="Configura los combos de boletos para cada sorteo"
    >
      <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Selector de Rifa */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Rifa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {raffles.map((raffle) => (
                  <Card 
                    key={raffle.id}
                    className={`cursor-pointer transition-all ${
                      selectedRaffle?.id === raffle.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRaffle(raffle)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm truncate">{raffle.title}</h3>
                      <p className="text-xs text-muted-foreground">{raffle.status}</p>
                      <div className="text-xs mt-2">
                        Precio: ${raffle.price_per_number} | 
                        Límite: {raffle.min_tickets_per_purchase}-{raffle.max_tickets_per_purchase}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedRaffle && (
            <>
              {/* Crear Nuevo Paquete */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Crear Nuevo Paquete para "{selectedRaffle.title}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="ticket_count">Cantidad de Boletos</Label>
                      <Input
                        id="ticket_count"
                        type="number"
                        value={newPackage.ticket_count}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, ticket_count: e.target.value }))}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_per_ticket">Precio por Boleto ($)</Label>
                      <Input
                        id="price_per_ticket"
                        type="number"
                        step="0.01"
                        value={newPackage.price_per_ticket}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, price_per_ticket: e.target.value }))}
                        placeholder="1.00"
                      />
                    </div>
                    <div>
                      <Label>Total Paquete</Label>
                      <div className="h-10 px-3 py-2 border border-border rounded-md bg-muted flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        <span className="font-bold text-green-600">
                          {newPackage.ticket_count && newPackage.price_per_ticket 
                            ? calculateTotal(parseInt(newPackage.ticket_count), parseFloat(newPackage.price_per_ticket))
                            : '0.00'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="display_order">Orden</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={newPackage.display_order}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, display_order: e.target.value }))}
                        placeholder={String(packages.length + 1)}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="is_popular"
                        checked={newPackage.is_popular}
                        onCheckedChange={(checked) => setNewPackage(prev => ({ ...prev, is_popular: checked }))}
                      />
                      <Label htmlFor="is_popular">Más Popular</Label>
                    </div>
                  </div>
                  <Button onClick={handleCreatePackage} className="bg-gradient-aqua hover:shadow-aqua">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Paquete
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Paquetes Existentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Paquetes Existentes ({packages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {packages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay paquetes configurados para esta rifa
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {packages.map((pkg, index) => (
                        <div key={pkg.id} className="border rounded-lg p-4">
                          {editingPackage?.id === pkg.id ? (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <div>
                                <Label>Cantidad de Boletos</Label>
                                <Input
                                  type="number"
                                  value={editingPackage.ticket_count}
                                  onChange={(e) => setEditingPackage(prev => 
                                    prev ? { ...prev, ticket_count: parseInt(e.target.value) } : null
                                  )}
                                />
                              </div>
                              <div>
                                <Label>Precio por Boleto</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingPackage.price_per_ticket}
                                  onChange={(e) => setEditingPackage(prev => 
                                    prev ? { ...prev, price_per_ticket: parseFloat(e.target.value) } : null
                                  )}
                                />
                              </div>
                              <div>
                                <Label>Total</Label>
                                <div className="h-10 px-3 py-2 border border-border rounded-md bg-muted flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                  <span className="font-bold text-green-600">
                                    {calculateTotal(editingPackage.ticket_count, editingPackage.price_per_ticket)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Label>Orden</Label>
                                <Input
                                  type="number"
                                  value={editingPackage.display_order}
                                  onChange={(e) => setEditingPackage(prev => 
                                    prev ? { ...prev, display_order: parseInt(e.target.value) } : null
                                  )}
                                />
                              </div>
                              <div className="flex items-center space-x-2 pt-6">
                                <Switch
                                  checked={editingPackage.is_popular}
                                  onCheckedChange={(checked) => setEditingPackage(prev => 
                                    prev ? { ...prev, is_popular: checked } : null
                                  )}
                                />
                                <Label>Más Popular</Label>
                              </div>
                              <div className="md:col-span-5 flex gap-2">
                                <Button 
                                  onClick={() => handleUpdatePackage(editingPackage)}
                                  className="bg-gradient-aqua hover:shadow-aqua"
                                >
                                  Guardar
                                </Button>
                                <Button variant="outline" onClick={() => setEditingPackage(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => movePackage(pkg, 'up')}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => movePackage(pkg, 'down')}
                                    disabled={index === packages.length - 1}
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div>
                                  <div className="text-lg font-bold">{pkg.ticket_count} boletos</div>
                                  <div className="text-sm text-muted-foreground">
                                    ${pkg.price_per_ticket} c/u
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-green-600 flex items-center">
                                  <DollarSign className="w-4 h-4" />
                                  {calculateTotal(pkg.ticket_count, pkg.price_per_ticket)}
                                </div>
                                {pkg.is_popular && (
                                  <Badge className="bg-primary">
                                    <Star className="w-3 h-3 mr-1" />
                                    Más Popular
                                  </Badge>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  Orden: {pkg.display_order}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingPackage(pkg)}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeletePackage(pkg.id!)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
    </AdminLayout>
  );
};

export default AdminPackages;