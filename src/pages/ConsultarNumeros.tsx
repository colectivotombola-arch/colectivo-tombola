import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Raffle } from '@/lib/supabase';
import Header from '@/components/Header';
import { Search, Phone, User, Calendar, CreditCard, Trophy } from 'lucide-react';

const ICON_SM = "w-3 h-3";
const ICON_MD = "w-4 h-4";

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
      
      <div className="container mx-auto px-3 py-3">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold text-foreground">
              Consultar Mis Números
            </h1>
            <p className="text-xs text-muted-foreground">
              Ingresa tu teléfono para ver tus números
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="flex items-center space-x-1 text-sm">
                <Search className={ICON_SM} />
                <span>Buscar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div>
                <Label htmlFor="phone" className="text-xs">Teléfono</Label>
                <div className="flex space-x-1.5 mt-1">
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ej: 3001234567"
                    className="flex-1 h-8 text-sm"
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={loading}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-black h-8 text-xs"
                  >
                    {loading ? '...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center space-x-1 text-sm">
                  <Trophy className={ICON_SM} />
                  <span>Mis Números ({numbers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                {numbers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No se encontraron números</p>
                    <p className="text-[10px]">Verifica el número ingresado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {numbers.map((number, index) => (
                      <div key={index} className="border rounded p-2 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-primary">
                              #{number.number_value}
                            </h3>
                            <p className="text-xs font-medium text-foreground">
                              {getRaffleName(number.raffle_id)}
                            </p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(number.payment_status || 'pending')}`}>
                            {number.payment_status === 'paid' ? 'Pagado' : 
                             number.payment_status === 'pending' ? 'Pendiente' : 
                             number.payment_status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <div className="flex items-center space-x-1">
                            <User className={ICON_SM + " text-muted-foreground"} />
                            <span>{number.buyer_name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className={ICON_SM + " text-muted-foreground"} />
                            <span>{formatDate(number.purchase_date || number.created_at || '')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <CreditCard className={ICON_SM + " text-muted-foreground"} />
                            <span className="capitalize">
                              {number.payment_method === 'cash' ? 'Efectivo' :
                               number.payment_method === 'transfer' ? 'Transferencia' :
                               number.payment_method === 'whatsapp' ? 'WhatsApp' :
                               number.payment_method || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="py-3 px-3">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-xs">¿No encuentras tus números?</h3>
                <p className="text-[10px] text-muted-foreground">
                  Verifica el teléfono o contáctanos por WhatsApp.
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