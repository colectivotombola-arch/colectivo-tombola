import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, rafflePackagesAPI, type Raffle, type RafflePackage } from '@/lib/supabase';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Trophy, Users, DollarSign, Package, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InstantPrizesManager from '@/components/InstantPrizesManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AdminRafflesEnhanced = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [packages, setPackages] = useState<RafflePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editRaffle, setEditRaffle] = useState<Raffle | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    description: '',
    prize_image: '',
    total_numbers: 1000,
    price_per_number: 1.00,
    min_tickets_per_purchase: 10,
    max_tickets_per_purchase: 100,
    status: 'active' as const,
    is_sold_out: false
  });

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
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    if (!selectedRaffle?.id) return;
    
    try {
      const data = await rafflePackagesAPI.getByRaffle(selectedRaffle.id);
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive",
      });
    }
  };

  const createRaffle = async () => {
    if (!newRaffle.title || !newRaffle.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const result = await rafflesAPI.create(newRaffle);
      
      if (result) {
        toast({
          title: "¡Rifa creada!",
          description: `Se creó la rifa "${result.title}" con ${result.total_numbers} números`,
        });

        setIsCreateDialogOpen(false);
        setNewRaffle({
          title: '',
          description: '',
          prize_image: '',
          total_numbers: 1000,
          price_per_number: 1.00,
          min_tickets_per_purchase: 10,
          max_tickets_per_purchase: 100,
          status: 'active',
          is_sold_out: false
        });
        
        loadRaffles();
      }
    } catch (error) {
      console.error('Error creating raffle:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la rifa",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const updateRaffle = async () => {
    if (!editRaffle?.id || !editRaffle.title || !editRaffle.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    try {
      const result = await rafflesAPI.update(editRaffle.id, editRaffle);
      
      if (result) {
        toast({
          title: "¡Rifa actualizada!",
          description: `Se actualizó la rifa "${result.title}"`,
        });

        setIsEditDialogOpen(false);
        setEditRaffle(null);
        loadRaffles();
      }
    } catch (error) {
      console.error('Error updating raffle:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la rifa",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const openEditDialog = (raffle: Raffle) => {
    setEditRaffle({ ...raffle });
    setSelectedRaffle(raffle);
    setIsEditDialogOpen(true);
  };

  const deleteRaffle = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta rifa?')) {
      return;
    }

    try {
      const success = await rafflesAPI.delete(id);
      if (success) {
        toast({
          title: "Rifa eliminada",
          description: "La rifa se eliminó correctamente",
        });
        loadRaffles();
      }
    } catch (error) {
      console.error('Error deleting raffle:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la rifa",
        variant: "destructive"
      });
    }
  };

  const handleCreatePackage = async () => {
    if (!selectedRaffle?.id || !newPackage.ticket_count || !newPackage.price_per_ticket) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const packageData = {
        raffle_id: selectedRaffle.id,
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

  const getStatusBadge = (raffle: Raffle) => {
    if (raffle.is_sold_out) {
      return <Badge variant="destructive">AGOTADO</Badge>;
    }
    
    const statusMap = {
      active: { label: 'Activa', variant: 'default' as const },
      paused: { label: 'Pausada', variant: 'secondary' as const },
      completed: { label: 'Completada', variant: 'outline' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[raffle.status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const toggleSoldOut = async (raffle: Raffle) => {
    try {
      const updatedRaffle = { ...raffle, is_sold_out: !raffle.is_sold_out };
      await rafflesAPI.update(raffle.id!, updatedRaffle);
      
      toast({
        title: "Estado actualizado",
        description: `La rifa ahora está ${updatedRaffle.is_sold_out ? 'AGOTADA' : 'DISPONIBLE'}`,
      });
      
      loadRaffles();
    } catch (error) {
      console.error('Error updating sold out status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando rifas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="mobile-container py-4">
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
              <div>
                <h1 className="responsive-title text-foreground">Gestión Completa de Rifas</h1>
                <p className="text-muted-foreground mobile-text">Rifas, paquetes y premios instantáneos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground mobile-text">{user?.email}</span>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-aqua hover:shadow-aqua">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Rifa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Rifa</DialogTitle>
                    <DialogDescription>
                      Completa la información para crear una nueva rifa
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título de la Rifa *</Label>
                      <Input
                        id="title"
                        value={newRaffle.title}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Gran Rifa Toyota Fortuner 2024"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descripción *</Label>
                      <Textarea
                        id="description"
                        value={newRaffle.description}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe los premios y detalles de la rifa..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="prize_image">URL de la Imagen del Premio</Label>
                      <Input
                        id="prize_image"
                        value={newRaffle.prize_image}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, prize_image: e.target.value }))}
                        placeholder="Ej: https://ejemplo.com/toyota-fortuner.jpg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total_numbers">Total de Números</Label>
                        <Input
                          id="total_numbers"
                          type="number"
                          value={newRaffle.total_numbers}
                          onChange={(e) => setNewRaffle(prev => ({ ...prev, total_numbers: parseInt(e.target.value) || 1000 }))}
                          min="1"
                          max="10000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price_per_number">Precio por Número ($)</Label>
                        <Input
                          id="price_per_number"
                          type="number"
                          step="0.01"
                          value={newRaffle.price_per_number}
                          onChange={(e) => setNewRaffle(prev => ({ ...prev, price_per_number: parseFloat(e.target.value) || 1.00 }))}
                          min="0.01"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_sold_out"
                        checked={newRaffle.is_sold_out}
                        onCheckedChange={(checked) => setNewRaffle(prev => ({ ...prev, is_sold_out: checked }))}
                      />
                      <Label htmlFor="is_sold_out">Marcar como AGOTADO</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={createRaffle}
                        className="bg-gradient-aqua hover:shadow-aqua"
                        disabled={creating || !newRaffle.title || !newRaffle.description}
                      >
                        {creating ? 'Creando...' : 'Crear Rifa'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-container py-8">
        {/* Management Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => navigate('/admin/packages')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg h-16"
          >
            <Package className="w-6 h-6 mr-2" />
            Gestionar Paquetes
          </Button>
          <Button 
            onClick={() => navigate('/admin/instant-prizes')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg h-16"
          >
            <Trophy className="w-6 h-6 mr-2" />
            Premios Instantáneos
          </Button>
          <Button 
            onClick={() => navigate('/admin/sold-numbers')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg h-16"
          >
            <Users className="w-6 h-6 mr-2" />
            Ver Números Vendidos
          </Button>
        </div>

        {raffles.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mobile-heading text-foreground mb-2">No hay rifas creadas</h3>
            <p className="text-muted-foreground mb-4 mobile-text">Crea tu primera rifa para comenzar a vender números</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-aqua hover:shadow-aqua"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Rifa
            </Button>
          </div>
        ) : (
          <div className="mobile-grid">
            {raffles.map((raffle) => (
              <Card key={raffle.id} className="overflow-hidden">
                {raffle.prize_image && (
                  <div className="aspect-video bg-muted">
                    <img 
                      src={raffle.prize_image} 
                      alt={raffle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mobile-heading">{raffle.title}</CardTitle>
                      <p className="mobile-body text-muted-foreground mt-1 line-clamp-2">
                        {raffle.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(raffle)}
                      <Button
                        size="sm"
                        variant={raffle.is_sold_out ? "destructive" : "outline"}
                        onClick={() => toggleSoldOut(raffle)}
                        className="mobile-body"
                      >
                        {raffle.is_sold_out ? 'Activar' : 'Agotar'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mobile-body">
                      <span className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        Números
                      </span>
                      <span className="font-medium">{raffle.total_numbers.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mobile-body">
                      <span className="flex items-center text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Precio
                      </span>
                      <span className="font-medium">${raffle.price_per_number}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 mobile-body"
                        onClick={() => navigate(`/comprar?raffle=${raffle.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 mobile-body"
                        onClick={() => openEditDialog(raffle)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteRaffle(raffle.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Edit Dialog with Tabs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión Completa de Rifa</DialogTitle>
            <DialogDescription>
              Edita rifa, gestiona paquetes y premios instantáneos
            </DialogDescription>
          </DialogHeader>
          
          {editRaffle && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="packages">Paquetes</TabsTrigger>
                <TabsTrigger value="instant-prizes">Premios Instantáneos</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="edit_title">Título de la Rifa *</Label>
                  <Input
                    id="edit_title"
                    value={editRaffle.title}
                    onChange={(e) => setEditRaffle(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                    placeholder="Ej: Gran Rifa Toyota Fortuner 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_description">Descripción *</Label>
                  <Textarea
                    id="edit_description"
                    value={editRaffle.description}
                    onChange={(e) => setEditRaffle(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    placeholder="Describe los premios y detalles de la rifa..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_prize_image">URL de la Imagen del Premio</Label>
                  <Input
                    id="edit_prize_image"
                    value={editRaffle.prize_image || ''}
                    onChange={(e) => setEditRaffle(prev => prev ? ({ ...prev, prize_image: e.target.value }) : null)}
                    placeholder="Ej: https://ejemplo.com/toyota-fortuner.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_total_numbers">Total de Números</Label>
                    <Input
                      id="edit_total_numbers"
                      type="number"
                      value={editRaffle.total_numbers}
                      onChange={(e) => setEditRaffle(prev => prev ? ({ ...prev, total_numbers: parseInt(e.target.value) || 1000 }) : null)}
                      min="1"
                      max="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_price_per_number">Precio por Número ($)</Label>
                    <Input
                      id="edit_price_per_number"
                      type="number"
                      step="0.01"
                      value={editRaffle.price_per_number}
                      onChange={(e) => setEditRaffle(prev => prev ? ({ ...prev, price_per_number: parseFloat(e.target.value) || 1.00 }) : null)}
                      min="0.01"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_sold_out"
                    checked={editRaffle.is_sold_out || false}
                    onCheckedChange={(checked) => setEditRaffle(prev => prev ? ({ ...prev, is_sold_out: checked }) : null)}
                  />
                  <Label htmlFor="edit_is_sold_out">Marcar como AGOTADO</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={updateRaffle}
                    className="bg-gradient-aqua hover:shadow-aqua"
                    disabled={updating || !editRaffle.title || !editRaffle.description}
                  >
                    {updating ? 'Actualizando...' : 'Actualizar Rifa'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="packages" className="space-y-4">
                {/* Create Package Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Crear Nuevo Paquete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="package_ticket_count">Cantidad de Boletos</Label>
                        <Input
                          id="package_ticket_count"
                          type="number"
                          value={newPackage.ticket_count}
                          onChange={(e) => setNewPackage(prev => ({ ...prev, ticket_count: e.target.value }))}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="package_price_per_ticket">Precio por Boleto</Label>
                        <Input
                          id="package_price_per_ticket"
                          type="number"
                          step="0.01"
                          value={newPackage.price_per_ticket}
                          onChange={(e) => setNewPackage(prev => ({ ...prev, price_per_ticket: e.target.value }))}
                          placeholder="1.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="package_display_order">Orden de Mostrar</Label>
                        <Input
                          id="package_display_order"
                          type="number"
                          value={newPackage.display_order}
                          onChange={(e) => setNewPackage(prev => ({ ...prev, display_order: e.target.value }))}
                          placeholder="1"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="package_is_popular"
                          checked={newPackage.is_popular}
                          onCheckedChange={(checked) => setNewPackage(prev => ({ ...prev, is_popular: checked }))}
                        />
                        <Label htmlFor="package_is_popular">Más Popular</Label>
                      </div>
                    </div>
                    <Button onClick={handleCreatePackage} className="bg-gradient-aqua hover:shadow-aqua">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Paquete
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Packages */}
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
                        {packages.map((pkg) => (
                          <div key={pkg.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="text-lg font-bold">{pkg.ticket_count} boletos</div>
                                  <div className="text-sm text-muted-foreground">
                                    ${pkg.price_per_ticket} c/u = ${(pkg.ticket_count * pkg.price_per_ticket).toFixed(2)}
                                  </div>
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
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instant-prizes">
                <InstantPrizesManager 
                  raffle={editRaffle} 
                  onUpdate={() => {
                    toast({
                      title: "¡Éxito!",
                      description: "Premios instantáneos actualizados",
                    });
                  }} 
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRafflesEnhanced;
