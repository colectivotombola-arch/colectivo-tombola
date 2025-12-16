import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { rafflesAPI, type Raffle } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { Search, Users, Eye, Download, Filter, RefreshCw } from 'lucide-react';

interface SoldNumber {
  id: string;
  number_value: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  payment_method: string;
  payment_status: string;
  purchase_date: string;
  raffle_id: string;
}

const AdminSoldNumbers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<SoldNumber[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de números vendidos...');
      
      const [numbersResult, rafflesData] = await Promise.all([
        supabase
          .from('raffle_numbers')
          .select(`
            id,
            number_value,
            buyer_name,
            buyer_email,
            buyer_phone,
            payment_method,
            payment_status,
            purchase_date,
            raffle_id
          `)
          .order('purchase_date', { ascending: false }),
        rafflesAPI.getAll()
      ]);

      if (numbersResult.error) {
        console.error('Supabase error:', numbersResult.error);
        throw numbersResult.error;
      }

      console.log('Números cargados exitosamente:', numbersResult.data?.length || 0);
      setNumbers(numbersResult.data || []);
      setRaffles(rafflesData);
      
      toast({
        title: "Datos cargados",
        description: `Se cargaron ${numbersResult.data?.length || 0} números vendidos`,
      });
    } catch (error) {
      console.error('Error loading sold numbers:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los números vendidos. Verifique la conexión a la base de datos.",
        variant: "destructive"
      });
      
      setNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique payment methods for filter
  const paymentMethods = useMemo(() => {
    const methods = new Set(numbers.map(n => n.payment_method).filter(Boolean));
    return Array.from(methods);
  }, [numbers]);

  // Filtered numbers
  const filteredNumbers = useMemo(() => {
    return numbers.filter(number => {
      // Search filter
      const matchesSearch = !searchTerm || 
        number.number_value.toString().includes(searchTerm) ||
        number.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        number.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        number.buyer_phone.includes(searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || number.payment_status === statusFilter;

      // Payment method filter
      const matchesPayment = paymentMethodFilter === 'all' || number.payment_method === paymentMethodFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [numbers, searchTerm, statusFilter, paymentMethodFilter]);

  const getRaffleName = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    return raffle?.title || 'N/A';
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Comprador', 'Email', 'Teléfono', 'Rifa', 'Método de Pago', 'Estado', 'Fecha'];
    const csvData = filteredNumbers.map(number => [
      number.number_value,
      number.buyer_name,
      number.buyer_email,
      number.buyer_phone,
      getRaffleName(number.raffle_id),
      number.payment_method || 'N/A',
      number.payment_status === 'confirmed' ? 'Confirmado' : 'Pendiente',
      new Date(number.purchase_date).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `numeros-vendidos-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación completada",
      description: `Se exportaron ${filteredNumbers.length} registros`,
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Números Vendidos" subtitle="Cargando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Números Vendidos" 
      subtitle="Visualiza y gestiona todos los números vendidos"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Vendidos</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{numbers.length}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Confirmados</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {numbers.filter(n => n.payment_status === 'confirmed').length}
                  </p>
                </div>
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {numbers.filter(n => n.payment_status === 'pending').length}
                  </p>
                </div>
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Mostrando</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {filteredNumbers.length}
                  </p>
                </div>
                <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Buscar y Filtrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">Todos los estados</option>
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendiente</option>
              </select>

              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">Todos los métodos</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={loadData} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
              <Button onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV ({filteredNumbers.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Numbers List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Números Vendidos ({filteredNumbers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNumbers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron números con los filtros aplicados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNumbers.map((number) => (
                  <div key={number.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4 items-center">
                      <div>
                        <p className="font-bold text-lg text-primary">#{number.number_value}</p>
                        <p className="text-xs text-muted-foreground truncate" title={getRaffleName(number.raffle_id)}>
                          {getRaffleName(number.raffle_id)}
                        </p>
                      </div>
                      
                      <div className="col-span-1 md:col-span-2">
                        <p className="font-medium truncate">{number.buyer_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{number.buyer_email}</p>
                      </div>
                      
                      <div className="hidden md:block">
                        <p className="text-sm">{number.buyer_phone}</p>
                      </div>
                      
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {number.payment_method || 'N/A'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={number.payment_status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {number.payment_status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(number.purchase_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSoldNumbers;