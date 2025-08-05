import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, Raffle } from '@/lib/supabase';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Trophy, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AdminRaffles = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    description: '',
    prize_image: '',
    total_numbers: 1000,
    price_per_number: 25.00,
  });

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
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
      const raffleData = {
        ...newRaffle,
        status: 'active' as const
      };

      const result = await rafflesAPI.create(raffleData);
      
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
          price_per_number: 25.00,
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Activa', variant: 'default' as const },
      paused: { label: 'Pausada', variant: 'secondary' as const },
      completed: { label: 'Completada', variant: 'outline' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Rifas</h1>
                <p className="text-muted-foreground">Administra tus rifas y sorteos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">{user?.email}</span>
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
                          onChange={(e) => setNewRaffle(prev => ({ ...prev, price_per_number: parseFloat(e.target.value) || 25.00 }))}
                          min="0.01"
                        />
                      </div>
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

      <div className="container mx-auto px-4 py-8">
        {raffles.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay rifas creadas</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera rifa para comenzar a vender números</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-aqua hover:shadow-aqua"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Rifa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <CardTitle className="text-lg">{raffle.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {raffle.description}
                      </p>
                    </div>
                    {getStatusBadge(raffle.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        Números
                      </span>
                      <span className="font-medium">{raffle.total_numbers.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
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
                        className="flex-1"
                        onClick={() => navigate(`/comprar?raffle=${raffle.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast({
                            title: "Próximamente",
                            description: "La función de editar estará disponible pronto"
                          });
                        }}
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
    </div>
  );
};

export default AdminRaffles;