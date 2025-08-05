import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { rafflesAPI, raffleNumbersAPI, Raffle, RaffleNumber } from '@/lib/supabase';
import { ArrowLeft, Search, Users, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminNumbers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<string>('');
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [filteredNumbers, setFilteredNumbers] = useState<RaffleNumber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sold: 0,
    pending: 0,
    confirmed: 0,
    failed: 0,
    revenue: 0
  });

  useEffect(() => {
    loadRaffles();
  }, []);

  useEffect(() => {
    if (selectedRaffle) {
      loadNumbers();
    }
  }, [selectedRaffle]);

  useEffect(() => {
    filterNumbers();
  }, [numbers, searchTerm, paymentFilter]);

  const loadRaffles = async () => {
    try {
      const data = await rafflesAPI.getAll();
      setRaffles(data);
      if (data.length > 0) {
        setSelectedRaffle(data[0].id!);
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

  const loadNumbers = async () => {
    if (!selectedRaffle) return;
    
    try {
      setLoading(true);
      const data = await raffleNumbersAPI.getByRaffleId(selectedRaffle);
      setNumbers(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading numbers:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los números",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (numbersData: RaffleNumber[]) => {
    const selectedRaffleData = raffles.find(r => r.id === selectedRaffle);
    const totalNumbers = selectedRaffleData?.total_numbers || 1000;
    const pricePerNumber = selectedRaffleData?.price_per_number || 25;
    
    const sold = numbersData.length;
    const pending = numbersData.filter(n => n.payment_status === 'pending').length;
    const confirmed = numbersData.filter(n => n.payment_status === 'confirmed').length;
    const failed = numbersData.filter(n => n.payment_status === 'failed').length;
    const revenue = confirmed * pricePerNumber;

    setStats({
      total: totalNumbers,
      sold,
      pending,
      confirmed,
      failed,
      revenue
    });
  };

  const filterNumbers = () => {
    let filtered = numbers;
    
    if (searchTerm) {
      filtered = filtered.filter(number => 
        number.number_value.toString().includes(searchTerm) ||
        number.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        number.buyer_phone.includes(searchTerm)
      );
    }
    
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(number => number.payment_status === paymentFilter);
    }
    
    setFilteredNumbers(filtered);
  };

  const updatePaymentStatus = async (numberId: string, status: 'pending' | 'confirmed' | 'failed') => {
    try {
      const success = await raffleNumbersAPI.updatePaymentStatus(numberId, status);
      if (success) {
        toast({
          title: "Estado actualizado",
          description: `El estado del pago se actualizó a ${status}`,
        });
        loadNumbers(); // Recargar para actualizar estadísticas
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pago",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Confirmado</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Fallido</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  if (loading && raffles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Gestión de Números</h1>
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
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Selector de Rifa */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Rifa</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRaffle} onValueChange={setSelectedRaffle}>
                <SelectTrigger className="w-full">
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
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Números</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Números Vendidos</p>
                    <p className="text-3xl font-bold text-foreground">{stats.sold}</p>
                    <p className="text-xs text-muted-foreground">
                      {((stats.sold / stats.total) * 100).toFixed(1)}% del total
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pagos Confirmados</p>
                    <p className="text-3xl font-bold text-foreground">{stats.confirmed}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.pending} pendientes, {stats.failed} fallidos
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ingresos</p>
                    <p className="text-3xl font-bold text-foreground">${stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Solo pagos confirmados</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Número, nombre o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Estado del Pago</Label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="failed">Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Números Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle>Números Vendidos ({filteredNumbers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando números...</p>
                </div>
              ) : filteredNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No hay números que mostrar</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || paymentFilter !== 'all' 
                      ? 'No se encontraron números con los filtros aplicados'
                      : 'Aún no se han vendido números para esta rifa'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNumbers.map((number) => (
                    <Card key={number.id} className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Número</p>
                              <p className="font-bold text-lg text-primary">#{number.number_value}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Comprador</p>
                              <p className="font-medium">{number.buyer_name}</p>
                              <p className="text-sm text-muted-foreground">{number.buyer_phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Fecha</p>
                              <p className="text-sm">
                                {new Date(number.purchase_date || number.created_at || '').toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Estado</p>
                              {getStatusBadge(number.payment_status)}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePaymentStatus(number.id!, 'confirmed')}
                              disabled={number.payment_status === 'confirmed'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePaymentStatus(number.id!, 'pending')}
                              disabled={number.payment_status === 'pending'}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePaymentStatus(number.id!, 'failed')}
                              disabled={number.payment_status === 'failed'}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNumbers;