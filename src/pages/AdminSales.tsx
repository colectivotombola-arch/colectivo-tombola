import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { raffleNumbersAPI, rafflesAPI, RaffleNumber, Raffle } from '@/lib/supabase';
import { ArrowLeft, Search, DollarSign, Users, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminSales = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sales, setSales] = useState<RaffleNumber[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSales();
  }, [selectedRaffleId, filterStatus]);

  const loadData = async () => {
    try {
      const rafflesData = await rafflesAPI.getAll();
      setRaffles(rafflesData);
      
      if (rafflesData.length > 0) {
        await loadAllSales();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllSales = async () => {
    try {
      const allSales: RaffleNumber[] = [];
      
      for (const raffle of raffles) {
        if (raffle.id) {
          const raffleSales = await raffleNumbersAPI.getByRaffleId(raffle.id);
          allSales.push(...raffleSales);
        }
      }
      
      setSales(allSales);
    } catch (error) {
      console.error('Error loading all sales:', error);
    }
  };

  const loadSales = async () => {
    if (selectedRaffleId === 'all') {
      await loadAllSales();
      return;
    }

    try {
      const data = await raffleNumbersAPI.getByRaffleId(selectedRaffleId);
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (id: string, status: 'pending' | 'confirmed' | 'failed') => {
    try {
      const success = await raffleNumbersAPI.updatePaymentStatus(id, status);
      if (success) {
        setSales(prev => prev.map(sale => 
          sale.id === id ? { ...sale, payment_status: status } : sale
        ));
        toast({
          title: "Estado actualizado",
          description: `El estado de pago se cambió a ${status}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle },
      failed: { label: 'Fallido', variant: 'destructive' as const, icon: XCircle }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getRaffleName = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    return raffle?.title || 'Rifa desconocida';
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = searchTerm === '' || 
      sale.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyer_phone.includes(searchTerm) ||
      sale.number_value.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || sale.payment_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const totalSales = filteredSales.length;
    const confirmedSales = filteredSales.filter(s => s.payment_status === 'confirmed').length;
    const pendingSales = filteredSales.filter(s => s.payment_status === 'pending').length;
    
    let totalRevenue = 0;
    filteredSales.forEach(sale => {
      if (sale.payment_status === 'confirmed') {
        const raffle = raffles.find(r => r.id === sale.raffle_id);
        if (raffle) {
          totalRevenue += raffle.price_per_number;
        }
      }
    });

    return { totalSales, confirmedSales, pendingSales, totalRevenue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ventas...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Gestión de Ventas</h1>
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
          
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Números</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalSales}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Confirmados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmedSales}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingSales}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ingresos</p>
                    <p className="text-3xl font-bold text-primary">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtros y Búsqueda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nombre, teléfono o número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="raffle_filter">Filtrar por Rifa</Label>
                  <Select value={selectedRaffleId} onValueChange={setSelectedRaffleId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las rifas</SelectItem>
                      {raffles.map((raffle) => (
                        <SelectItem key={raffle.id} value={raffle.id!}>
                          {raffle.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status_filter">Estado de Pago</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="confirmed">Confirmados</SelectItem>
                      <SelectItem value="failed">Fallidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Ventas */}
          <Card>
            <CardHeader>
              <CardTitle>Números Vendidos ({filteredSales.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Rifa</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm || filterStatus !== 'all' || selectedRaffleId !== 'all' 
                              ? 'No se encontraron ventas con los filtros aplicados'
                              : 'No hay números vendidos aún'
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono font-bold text-lg">
                            #{sale.number_value.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell>{sale.buyer_name}</TableCell>
                          <TableCell>{sale.buyer_phone}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {getRaffleName(sale.raffle_id)}
                          </TableCell>
                          <TableCell>
                            {new Date(sale.purchase_date || '').toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(sale.payment_status || 'pending')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {sale.payment_status !== 'confirmed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePaymentStatus(sale.id!, 'confirmed')}
                                >
                                  Confirmar
                                </Button>
                              )}
                              {sale.payment_status !== 'failed' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updatePaymentStatus(sale.id!, 'failed')}
                                >
                                  Rechazar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;