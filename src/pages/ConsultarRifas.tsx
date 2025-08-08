import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { raffleNumbersAPI, rafflesAPI, Raffle, RaffleNumber } from '@/lib/supabase';
import { ArrowLeft, Search, Eye, Trophy, Phone, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';

const ConsultarRifas = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingNumbers, setLoadingNumbers] = useState(false);

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      const data = await rafflesAPI.getAll();
      setRaffles(data);
      if (data.length > 0) {
        setSelectedRaffle(data[0]);
        loadNumbers(data[0].id!);
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

  const loadNumbers = async (raffleId: string) => {
    setLoadingNumbers(true);
    try {
      const data = await raffleNumbersAPI.getByRaffle(raffleId);
      setNumbers(data);
    } catch (error) {
      console.error('Error loading numbers:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los números",
        variant: "destructive"
      });
    } finally {
      setLoadingNumbers(false);
    }
  };

  const handleRaffleChange = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    loadNumbers(raffle.id!);
    setSearchTerm('');
  };

  const filteredNumbers = numbers.filter(number => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      number.number_value?.toString().includes(search) ||
      number.buyer_name?.toLowerCase().includes(search) ||
      number.buyer_phone?.includes(search) ||
      (number.buyer_email && number.buyer_email.toLowerCase().includes(search))
    );
  });

  const getStatusBadge = (paymentStatus: string) => {
    const statusMap = {
      pending: { label: 'Pendiente', variant: 'destructive' as const },
      paid: { label: 'Pagado', variant: 'default' as const },
      confirmed: { label: 'Confirmado', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[paymentStatus as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout title="Consultar Números" subtitle="Ver números vendidos por rifa">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando rifas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Consultar Números" subtitle="Ver y gestionar números vendidos">
      <div className="space-y-4 sm:space-y-6">
        
        {/* Selector de Rifa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Seleccionar Rifa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {raffles.map((raffle) => (
                <Card 
                  key={raffle.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedRaffle?.id === raffle.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleRaffleChange(raffle)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{raffle.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                      {raffle.description}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span>Vendidos: {raffle.numbers_sold || 0}/{raffle.total_numbers}</span>
                      <Badge variant={raffle.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {raffle.status === 'active' ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedRaffle && (
          <>
            {/* Información de la Rifa Seleccionada */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{selectedRaffle.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-primary">{selectedRaffle.numbers_sold || 0}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Vendidos</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold">{selectedRaffle.total_numbers}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {Math.round(((selectedRaffle.numbers_sold || 0) / selectedRaffle.total_numbers) * 100)}%
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Progreso</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                      ${selectedRaffle.price_per_number}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Por número</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Búsqueda */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por número, nombre, teléfono o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Números */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span>Números Vendidos ({filteredNumbers.length})</span>
                  {loadingNumbers && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNumbers.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No se encontraron números con ese criterio' : 'No hay números vendidos aún'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {filteredNumbers.map((number) => (
                      <Card key={number.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="outline" className="text-lg sm:text-xl font-bold px-3 py-1">
                                  #{(number.number_value || 0).toString().padStart(4, '0')}
                                </Badge>
                                {getStatusBadge(number.payment_status || 'pending')}
                              </div>
                              
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{number.buyer_name}</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{number.buyer_phone}</span>
                                  </div>
                                  
                                  {number.buyer_email && (
                                    <div className="flex items-center space-x-1">
                                      <Mail className="w-3 h-3" />
                                      <span className="truncate">{number.buyer_email}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(number.purchase_date || new Date()).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ${selectedRaffle.price_per_number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {number.payment_method || 'Efectivo'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ConsultarRifas;