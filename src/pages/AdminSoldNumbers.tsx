import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Search, Users, Eye, Download } from 'lucide-react';

interface SoldNumber {
  id: string;
  number_value: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  payment_method: string;
  payment_status: string;
  purchase_date: string;
  raffles?: {
    title: string;
    id: string;
  };
}

const AdminSoldNumbers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [numbers, setNumbers] = useState<SoldNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNumbers, setFilteredNumbers] = useState<SoldNumber[]>([]);

  useEffect(() => {
    loadSoldNumbers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = numbers.filter(number => 
        number.number_value.toString().includes(searchTerm) ||
        number.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        number.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        number.buyer_phone.includes(searchTerm)
      );
      setFilteredNumbers(filtered);
    } else {
      setFilteredNumbers(numbers);
    }
  }, [searchTerm, numbers]);

  const loadSoldNumbers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('raffle_numbers')
        .select(`
          *,
          raffles:raffle_id (
            id,
            title
          )
        `)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setNumbers(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "Información",
          description: "No hay números vendidos registrados aún",
        });
      }
    } catch (error) {
      console.error('Error loading sold numbers:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los números vendidos. Verifique la conexión a la base de datos.",
        variant: "destructive"
      });
      
      // Retry mechanism
      setTimeout(() => {
        console.log("Reintenando carga de números...");
        loadSoldNumbers();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Comprador', 'Email', 'Teléfono', 'Método de Pago', 'Estado', 'Fecha', 'Rifa'];
    const csvData = filteredNumbers.map(number => [
      number.number_value,
      number.buyer_name,
      number.buyer_email,
      number.buyer_phone,
      number.payment_method,
      number.payment_status,
      new Date(number.purchase_date).toLocaleDateString(),
      number.raffles?.title || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `numeros-vendidos-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando números vendidos...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Números Vendidos" 
      subtitle="Visualiza y gestiona todos los números vendidos"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Vendidos</p>
                  <p className="text-2xl font-bold text-primary">{numbers.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {numbers.filter(n => n.payment_status === 'confirmed').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {numbers.filter(n => n.payment_status === 'pending').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Export */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar y Exportar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={exportToCSV} className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
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
                <p className="text-muted-foreground">No se encontraron números vendidos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNumbers.map((number) => (
                  <div key={number.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div>
                        <p className="font-bold text-lg text-primary">#{number.number_value}</p>
                        <p className="text-xs text-muted-foreground">Rifa: {number.raffles?.title || number.raffles?.id || '—'}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">{number.buyer_name}</p>
                        <p className="text-sm text-muted-foreground">{number.buyer_email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm">{number.buyer_phone}</p>
                      </div>
                      
                      <div>
                        <Badge variant="outline">{number.payment_method}</Badge>
                      </div>
                      
                      <div>
                        <Badge 
                          variant={number.payment_status === 'confirmed' ? 'default' : 'secondary'}
                        >
                          {number.payment_status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(number.purchase_date).toLocaleDateString()}
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