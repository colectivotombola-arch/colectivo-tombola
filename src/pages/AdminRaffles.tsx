import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Trophy, Users, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Raffle {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  total_numbers: number;
  price_per_number: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  image_url?: string;
  video_url?: string;
  instagram_video_url?: string;
  created_at: string;
}

const AdminRaffles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    description: '',
    prize_description: '',
    total_numbers: 1000,
    price_per_number: 10.00,
    image_url: '',
    video_url: '',
    instagram_video_url: ''
  });

  // Initialize Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRaffles(data || []);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      const { data, error } = await supabase
        .from('raffles')
        .insert([newRaffle])
        .select()
        .single();

      if (error) throw error;

      // Create raffle numbers
      const numbers = Array.from({ length: newRaffle.total_numbers }, (_, i) => ({
        raffle_id: data.id,
        number_value: i + 1,
        is_sold: false
      }));

      const { error: numbersError } = await supabase
        .from('raffle_numbers')
        .insert(numbers);

      if (numbersError) throw numbersError;

      toast({
        title: "¡Rifa creada!",
        description: "La rifa se creó correctamente con todos sus números",
      });

      setIsCreateDialogOpen(false);
      setNewRaffle({
        title: '',
        description: '',
        prize_description: '',
        total_numbers: 1000,
        price_per_number: 10.00,
        image_url: '',
        video_url: '',
        instagram_video_url: ''
      });
      
      loadRaffles();
    } catch (error) {
      console.error('Error creating raffle:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la rifa",
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
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Rifas</h1>
                <p className="text-muted-foreground">Administra tus rifas y sorteos</p>
              </div>
            </div>
            
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título de la Rifa</Label>
                      <Input
                        id="title"
                        value={newRaffle.title}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Gran Rifa Toyota Fortuner 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prize_description">Premio Principal</Label>
                      <Input
                        id="prize_description"
                        value={newRaffle.prize_description}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, prize_description: e.target.value }))}
                        placeholder="Toyota Fortuner 2024"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newRaffle.description}
                      onChange={(e) => setNewRaffle(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción detallada de la rifa..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total_numbers">Total de Números</Label>
                      <Input
                        id="total_numbers"
                        type="number"
                        value={newRaffle.total_numbers}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, total_numbers: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_per_number">Precio por Número ($)</Label>
                      <Input
                        id="price_per_number"
                        type="number"
                        step="0.01"
                        value={newRaffle.price_per_number}
                        onChange={(e) => setNewRaffle(prev => ({ ...prev, price_per_number: parseFloat(e.target.value) }))}
                        min="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL de la Imagen</Label>
                    <Input
                      id="image_url"
                      value={newRaffle.image_url}
                      onChange={(e) => setNewRaffle(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={createRaffle}
                      className="bg-gradient-aqua hover:shadow-aqua"
                      disabled={!newRaffle.title || !newRaffle.prize_description}
                    >
                      Crear Rifa
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {raffles.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay rifas creadas</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera rifa para comenzar</p>
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
                {raffle.image_url && (
                  <div className="aspect-video bg-muted">
                    <img 
                      src={raffle.image_url} 
                      alt={raffle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{raffle.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {raffle.prize_description}
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
                      <span className="font-medium">{raffle.total_numbers}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Precio
                      </span>
                      <span className="font-medium">${raffle.price_per_number}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
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