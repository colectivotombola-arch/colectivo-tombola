import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Raffle } from '@/lib/supabase';
import Header from '@/components/Header';
import { Search, Phone, User, Calendar, CreditCard, Trophy } from 'lucide-react';

interface RaffleNumber {
  id: string;
  raffle_id: string;
  number_value: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  payment_status?: string;
  payment_method?: string;
  purchase_date?: string;
  created_at?: string;
}

const ConsultarNumeros = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
    }
  };

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('raffle_numbers')
        .select('*')
        .eq('buyer_phone', phoneNumber.trim())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNumbers(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron números para este teléfono",
        });
      }
    } catch (error) {
      console.error('Error searching numbers:', error);
      toast({
        title: "Error",
        description: "Error al buscar los números",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRaffleName = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId);
    return raffle?.title || 'Rifa desconocida';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Consultar Mis Números
            </h1>
            <p className="text-lg text-muted-foreground">
              Ingresa tu número de teléfono para ver todos tus números comprados
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Buscar Números</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Número de Teléfono</Label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ej: 3001234567"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Mis Números ({numbers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {numbers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Phone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No se encontraron números para este teléfono</p>
                    <p className="text-sm">Verifica que el número esté correcto</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {numbers.map((number, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-2xl text-primary">
                              Número: {number.number_value}
                            </h3>
                            <p className="text-lg font-medium text-foreground">
                              {getRaffleName(number.raffle_id)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(number.payment_status || 'pending')}`}>
                            {number.payment_status === 'paid' ? 'Pagado' : 
                             number.payment_status === 'pending' ? 'Pendiente' : 
                             number.payment_status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{number.buyer_name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(number.purchase_date || number.created_at || '')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">
                              {number.payment_method === 'cash' ? 'Efectivo' :
                               number.payment_method === 'transfer' ? 'Transferencia' :
                               number.payment_method === 'whatsapp' ? 'WhatsApp' :
                               number.payment_method || 'No especificado'}
                            </span>
                          </div>
                        </div>
                        
                        {number.buyer_email && (
                          <div className="text-sm text-muted-foreground">
                            Email: {number.buyer_email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">¿No encuentras tus números?</h3>
                <p className="text-muted-foreground">
                  Asegúrate de ingresar el mismo número de teléfono que usaste al comprar.
                  Si tienes problemas, contáctanos por WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsultarNumeros;