import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, rafflePackagesAPI, type Raffle, type RafflePackage } from '@/lib/supabase';
import { toFloat, toInt } from '@/lib/numberUtils';
import { 
  ArrowLeft, Plus, Edit, Trash2, Eye, Trophy, Users, DollarSign, 
  Package, Star, Search, CheckCircle, XCircle 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import InstantPrizesManager from '@/components/InstantPrizesManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Form state interface - using strings for numeric inputs
interface RaffleFormState {
  title: string;
  description: string;
  prize_image: string;
  total_numbers: string;
  price_per_number: string;
  min_tickets_per_purchase: string;
  max_tickets_per_purchase: string;
  status: string;
  is_sold_out: boolean;
}

interface PackageFormState {
  ticket_count: string;
  price_per_ticket: string;
  is_popular: boolean;
  display_order: string;
}

const initialRaffleForm: RaffleFormState = {
  title: '',
  description: '',
  prize_image: '',
  total_numbers: '1000',
  price_per_number: '1.00',
  min_tickets_per_purchase: '10',
  max_tickets_per_purchase: '100',
  status: 'active',
  is_sold_out: false
};

const initialPackageForm: PackageFormState = {
  ticket_count: '',
  price_per_ticket: '',
  is_popular: false,
  display_order: ''
};

// Skeleton component for loading states
const RaffleCardSkeleton = () => (
  <div className="p-3 border rounded-lg space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-12" />
    </div>
  </div>
);

const AdminRafflesEnhanced = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Core state
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [packages, setPackages] = useState<RafflePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state - using strings for all numeric inputs
  const [newRaffle, setNewRaffle] = useState<RaffleFormState>(initialRaffleForm);
  const [editForm, setEditForm] = useState<RaffleFormState | null>(null);
  const [newPackage, setNewPackage] = useState<PackageFormState>(initialPackageForm);

  // Derived state
  const selectedRaffle = useMemo(() => 
    raffles.find(r => r.id === selectedRaffleId) || null,
    [raffles, selectedRaffleId]
  );

  const filteredRaffles = useMemo(() => 
    raffles.filter(r => 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [raffles, searchTerm]
  );

  // Load raffles on mount
  useEffect(() => {
    loadRaffles();
  }, []);

  // Auto-select first raffle when raffles load and nothing is selected
  useEffect(() => {
    if (raffles.length > 0 && !selectedRaffleId) {
      setSelectedRaffleId(raffles[0].id!);
    }
  }, [raffles, selectedRaffleId]);

  // Load packages when selected raffle changes
  useEffect(() => {
    if (selectedRaffleId) {
      setPackages([]); // Clear old packages first
      loadPackages(selectedRaffleId);
    }
  }, [selectedRaffleId]);

  // Sync edit form when selected raffle changes
  useEffect(() => {
    if (selectedRaffle) {
      setEditForm(raffleToForm(selectedRaffle));
    } else {
      setEditForm(null);
    }
  }, [selectedRaffle]);

  // Convert Raffle to form state (numbers to strings)
  const raffleToForm = (raffle: Raffle): RaffleFormState => ({
    title: raffle.title || '',
    description: raffle.description || '',
    prize_image: raffle.prize_image || '',
    total_numbers: String(raffle.total_numbers ?? 1000),
    price_per_number: String(raffle.price_per_number ?? 1),
    min_tickets_per_purchase: String(raffle.min_tickets_per_purchase ?? 1),
    max_tickets_per_purchase: String(raffle.max_tickets_per_purchase ?? 100),
    status: raffle.status || 'active',
    is_sold_out: raffle.is_sold_out || false
  });

  // Convert form state to API payload (strings to numbers)
  const formToRafflePayload = (form: RaffleFormState) => ({
    title: form.title,
    description: form.description,
    prize_image: form.prize_image || null,
    total_numbers: toInt(form.total_numbers, 1000),
    price_per_number: toFloat(form.price_per_number, 1),
    min_tickets_per_purchase: toInt(form.min_tickets_per_purchase, 1),
    max_tickets_per_purchase: toInt(form.max_tickets_per_purchase, 100),
    status: form.status as 'active' | 'paused' | 'completed' | 'cancelled',
    is_sold_out: form.is_sold_out
  });

  const loadRaffles = async () => {
    try {
      setLoading(true);
      const data = await rafflesAPI.getAll();
      setRaffles(data);
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

  const loadPackages = async (raffleId: string) => {
    setLoadingPackages(true);
    try {
      const data = await rafflePackagesAPI.getByRaffle(raffleId);
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive",
      });
    } finally {
      setLoadingPackages(false);
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
      const payload = formToRafflePayload(newRaffle);
      const result = await rafflesAPI.create(payload);
      
      if (result) {
        toast({
          title: "¡Rifa creada!",
          description: `Se creó la rifa "${result.title}"`,
        });

        setIsCreateDialogOpen(false);
        setNewRaffle(initialRaffleForm);
        
        // Reload and select the new raffle
        await loadRaffles();
        setSelectedRaffleId(result.id!);
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
    if (!editForm || !selectedRaffleId) return;

    if (!editForm.title || !editForm.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    try {
      const payload = formToRafflePayload(editForm);
      const result = await rafflesAPI.update(selectedRaffleId, payload);
      
      if (result) {
        toast({
          title: "¡Rifa actualizada!",
          description: `Rifa "${result.title}" actualizada correctamente`,
        });

        // Update local state immediately
        setRaffles(prev => prev.map(r => r.id === result.id ? result : r));
      }
    } catch (error) {
      console.error('Error updating raffle:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo guardar la rifa",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteRaffle = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta rifa?')) return;

    try {
      const success = await rafflesAPI.delete(id);
      if (success) {
        toast({
          title: "Rifa eliminada",
          description: "La rifa se eliminó correctamente",
        });
        
        // Update local state
        const newRaffles = raffles.filter(r => r.id !== id);
        setRaffles(newRaffles);
        
        // Select next raffle or clear selection
        if (selectedRaffleId === id) {
          setSelectedRaffleId(newRaffles.length > 0 ? newRaffles[0].id! : null);
        }
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

  const toggleSoldOut = async (raffle: Raffle) => {
    const newStatus = !raffle.is_sold_out;
    
    // Optimistic update
    setRaffles(prev => prev.map(r => 
      r.id === raffle.id ? { ...r, is_sold_out: newStatus } : r
    ));

    try {
      await rafflesAPI.update(raffle.id!, { is_sold_out: newStatus });
      
      toast({
        title: "Estado actualizado",
        description: `La rifa ahora está ${newStatus ? 'AGOTADA' : 'DISPONIBLE'}`,
      });
    } catch (error) {
      // Revert on error
      setRaffles(prev => prev.map(r => 
        r.id === raffle.id ? { ...r, is_sold_out: !newStatus } : r
      ));
      
      console.error('Error updating sold out status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const handleCreatePackage = async () => {
    if (!selectedRaffleId || !newPackage.ticket_count || !newPackage.price_per_ticket) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const packageData = {
        raffle_id: selectedRaffleId,
        ticket_count: toInt(newPackage.ticket_count, 1),
        price_per_ticket: toFloat(newPackage.price_per_ticket, 1),
        is_popular: newPackage.is_popular,
        display_order: toInt(newPackage.display_order, packages.length + 1)
      };

      await rafflePackagesAPI.create(packageData);
      
      toast({
        title: "¡Éxito!",
        description: "Paquete creado correctamente",
      });
      
      setNewPackage(initialPackageForm);
      loadPackages(selectedRaffleId);
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
      return <Badge variant="destructive" className="text-xs">AGOTADO</Badge>;
    }
    
    const statusMap = {
      active: { label: 'Activa', variant: 'default' as const },
      paused: { label: 'Pausada', variant: 'secondary' as const },
      completed: { label: 'Completada', variant: 'outline' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[raffle.status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="mobile-container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-20" />
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </header>
        <div className="mobile-container py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 space-y-3">
              {[1, 2, 3].map(i => <RaffleCardSkeleton key={i} />)}
            </div>
            <div className="lg:col-span-8">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="mobile-container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">Gestión de Rifas</h1>
                <p className="text-xs text-muted-foreground">Rifas, paquetes y premios</p>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-aqua hover:shadow-aqua">
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Rifa</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newRaffle.title}
                      onChange={(e) => setNewRaffle(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Gran Rifa Toyota 2024"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={newRaffle.description}
                      onChange={(e) => setNewRaffle(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe los premios..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prize_image">URL Imagen</Label>
                    <Input
                      id="prize_image"
                      value={newRaffle.prize_image}
                      onChange={(e) => setNewRaffle(prev => ({ ...prev, prize_image: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="total_numbers">Total Números</Label>
                      <Input
                        id="total_numbers"
                        type="number"
                        value={newRaffle.total_numbers}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, total_numbers: e.target.value }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_per_number">Precio ($)</Label>
                      <Input
                        id="price_per_number"
                        type="number"
                        step="0.01"
                        value={newRaffle.price_per_number}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, price_per_number: e.target.value }))}
                        min="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={createRaffle}
                      className="bg-gradient-aqua"
                      disabled={creating || !newRaffle.title || !newRaffle.description}
                    >
                      {creating ? 'Creando...' : 'Crear'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="mobile-container py-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link to="/admin/packages">
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4 mr-1" />
              Paquetes
            </Button>
          </Link>
          <Link to="/admin/instant-prizes">
            <Button variant="outline" size="sm">
              <Trophy className="w-4 h-4 mr-1" />
              Premios
            </Button>
          </Link>
          <Link to="/admin/sold-numbers">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-1" />
              Vendidos
            </Button>
          </Link>
        </div>
      </div>

      <div className="mobile-container pb-6">
        {raffles.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No hay rifas</h3>
            <p className="text-sm text-muted-foreground mb-3">Crea tu primera rifa</p>
            <Button 
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-aqua"
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear Rifa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Raffle List */}
            <div className="lg:col-span-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rifa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>

              {/* Raffle Cards */}
              <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)]">
                <div className="space-y-2 pr-2">
                  {filteredRaffles.map((raffle) => (
                    <div
                      key={raffle.id}
                      onClick={() => setSelectedRaffleId(raffle.id!)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedRaffleId === raffle.id 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{raffle.title}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {raffle.total_numbers.toLocaleString()} nums · ${raffle.price_per_number}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(raffle)}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSoldOut(raffle);
                            }}
                          >
                            {raffle.is_sold_out ? (
                              <><CheckCircle className="w-3 h-3 mr-1" />Activar</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" />Agotar</>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/comprar?raffle=${raffle.id}`);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRaffle(raffle.id!);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Column: Editor Panel */}
            <div className="lg:col-span-8">
              {selectedRaffle && editForm ? (
                <Card>
                  <CardContent className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="details" className="text-xs">Detalles</TabsTrigger>
                        <TabsTrigger value="packages" className="text-xs">Paquetes</TabsTrigger>
                        <TabsTrigger value="instant-prizes" className="text-xs">Premios</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="space-y-3 mt-0">
                        <div>
                          <Label htmlFor="edit_title" className="text-xs">Título *</Label>
                          <Input
                            id="edit_title"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                            className="h-9"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit_description" className="text-xs">Descripción *</Label>
                          <Textarea
                            id="edit_description"
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit_prize_image" className="text-xs">URL Imagen</Label>
                          <Input
                            id="edit_prize_image"
                            value={editForm.prize_image}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, prize_image: e.target.value }) : null)}
                            className="h-9"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="edit_total_numbers" className="text-xs">Total Números</Label>
                            <Input
                              id="edit_total_numbers"
                              type="number"
                              value={editForm.total_numbers}
                              onChange={(e) => setEditForm(prev => prev ? ({ ...prev, total_numbers: e.target.value }) : null)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_price_per_number" className="text-xs">Precio ($)</Label>
                            <Input
                              id="edit_price_per_number"
                              type="number"
                              step="0.01"
                              value={editForm.price_per_number}
                              onChange={(e) => setEditForm(prev => prev ? ({ ...prev, price_per_number: e.target.value }) : null)}
                              className="h-9"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="edit_min_tickets" className="text-xs">Mín. Boletos</Label>
                            <Input
                              id="edit_min_tickets"
                              type="number"
                              value={editForm.min_tickets_per_purchase}
                              onChange={(e) => setEditForm(prev => prev ? ({ ...prev, min_tickets_per_purchase: e.target.value }) : null)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_max_tickets" className="text-xs">Máx. Boletos</Label>
                            <Input
                              id="edit_max_tickets"
                              type="number"
                              value={editForm.max_tickets_per_purchase}
                              onChange={(e) => setEditForm(prev => prev ? ({ ...prev, max_tickets_per_purchase: e.target.value }) : null)}
                              className="h-9"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="edit_is_sold_out"
                            checked={editForm.is_sold_out}
                            onCheckedChange={(checked) => setEditForm(prev => prev ? ({ ...prev, is_sold_out: checked }) : null)}
                          />
                          <Label htmlFor="edit_is_sold_out" className="text-xs">Marcar como AGOTADO</Label>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <Button 
                            size="sm"
                            onClick={updateRaffle}
                            className="bg-gradient-aqua"
                            disabled={updating || !editForm.title || !editForm.description}
                          >
                            {updating ? 'Guardando...' : 'Guardar Cambios'}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="packages" className="space-y-4 mt-0">
                        {/* Create Package */}
                        <Card>
                          <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Nuevo Paquete
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 pt-0 space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs">Cantidad</Label>
                                <Input
                                  type="number"
                                  value={newPackage.ticket_count}
                                  onChange={(e) => setNewPackage(prev => ({ ...prev, ticket_count: e.target.value }))}
                                  placeholder="10"
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Precio/Boleto</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={newPackage.price_per_ticket}
                                  onChange={(e) => setNewPackage(prev => ({ ...prev, price_per_ticket: e.target.value }))}
                                  placeholder="1.00"
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Orden</Label>
                                <Input
                                  type="number"
                                  value={newPackage.display_order}
                                  onChange={(e) => setNewPackage(prev => ({ ...prev, display_order: e.target.value }))}
                                  placeholder="1"
                                  className="h-8"
                                />
                              </div>
                              <div className="flex items-end">
                                <div className="flex items-center gap-1">
                                  <Switch
                                    id="pkg_popular"
                                    checked={newPackage.is_popular}
                                    onCheckedChange={(checked) => setNewPackage(prev => ({ ...prev, is_popular: checked }))}
                                  />
                                  <Label htmlFor="pkg_popular" className="text-xs">Popular</Label>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" onClick={handleCreatePackage} className="bg-gradient-aqua">
                              <Plus className="w-3 h-3 mr-1" />
                              Crear
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Existing Packages */}
                        <Card>
                          <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Paquetes ({packages.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 pt-0">
                            {loadingPackages ? (
                              <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                              </div>
                            ) : packages.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No hay paquetes
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {packages.map((pkg) => (
                                  <div key={pkg.id} className="border rounded p-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <span className="font-medium text-sm">{pkg.ticket_count} boletos</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ${pkg.price_per_ticket}/u = {(pkg.ticket_count * pkg.price_per_ticket).toFixed(2)}
                                        </span>
                                      </div>
                                      {pkg.is_popular && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Star className="w-3 h-3 mr-1" />
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">#{pkg.display_order}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="instant-prizes" className="mt-0">
                        <InstantPrizesManager 
                          raffle={selectedRaffle} 
                          onUpdate={() => {
                            toast({
                              title: "¡Éxito!",
                              description: "Premios actualizados",
                            });
                          }} 
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Selecciona una rifa para editar</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRafflesEnhanced;
