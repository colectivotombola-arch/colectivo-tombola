import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { rafflesAPI, siteSettingsAPI, supabase, type Raffle, type SiteSettings } from '@/lib/supabase';
import toyotaFortuner from "@/assets/toyota-fortuner.jpg";
import chevroletOnix from "@/assets/chevrolet-onix.jpg";

const ComprarNumeros = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [raffleData, settingsData] = await Promise.all([
        rafflesAPI.getActive(),
        siteSettingsAPI.get()
      ]);
      
      setRaffle(raffleData);
      setSettings(settingsData);
      
      if (raffleData) {
        // Cargar paquetes personalizados para esta rifa
        const { data: packagesData } = await supabase
          .from('raffle_packages')
          .select('*')
          .eq('raffle_id', raffleData.id)
          .order('display_order');
        
        setPackages(packagesData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando actividad...</div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No hay actividades activas</h2>
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = (packageId: string) => {
    if (raffle?.status !== 'active') return;
    navigate(`/purchase/${raffle.id}/${packageId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-foreground">ACTIVIDAD ACTUAL</h1>
              <p className="text-muted-foreground">{raffle.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto mobile-container mobile-section max-w-4xl">
        
        {/* Status Banner */}
        {raffle.status !== 'active' && (
          <Card className="mb-8 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-destructive mb-2">
                  ¡LO SENTIMOS, LOS NÚMEROS PARA ESTA ACTIVIDAD SE AGOTARON!
                </h2>
                <p className="text-muted-foreground">
                  Los premios se jugarán en un live en nuestra cuenta oficial de Instagram, síguenos para mantenerte al tanto.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prize Images */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative">
                <img 
                  src={toyotaFortuner} 
                  alt="Toyota Fortuner 4x4" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{raffle.title}</h3>
                    <p className="text-sm">PRIMER PREMIO</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={chevroletOnix} 
                  alt="Segundo premio" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{raffle.description}</h3>
                    <p className="text-sm">SEGUNDO PREMIO</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              ¡CANTIDADES LIMITADAS!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Números Vendidos:</span>
                  <span className="font-bold">{raffle.sold_percentage?.toFixed(2) || 0}%</span>
                </div>
                <Progress value={raffle.sold_percentage || 0} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{raffle.numbers_sold || 0} vendidos</span>
                  <span>{raffle.total_numbers} total</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Los premios se jugarán una vez vendida la totalidad de los números, es decir, cuando la barra de progreso llegue al 100%. 
                Se hará tomando los 5 números de la primera y segunda suerte de la suertuda (programa de la lotería nacional).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instant Prizes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              ¡PREMIOS INSTANTÁNEOS!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ¡Hay 10 números bendecidos con premios en efectivo! Realiza tu compra y revisa si tienes uno de los siguientes números:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {raffle.instant_prizes?.map((prize, index) => (
                <div 
                  key={index}
                  className={`text-center p-3 rounded-lg border-2 ${
                    prize.claimed 
                      ? 'bg-muted border-muted-foreground line-through text-muted-foreground' 
                      : 'bg-primary/10 border-primary text-primary font-bold'
                  }`}
                >
                  <div className="text-lg font-mono">{prize.number}</div>
                  {prize.claimed && <div className="text-xs">¡Premio Entregado!</div>}
                </div>
              )) || (
                <div className="col-span-full text-center text-muted-foreground">
                  No hay premios instantáneos configurados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How to Participate */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>¿Cómo participar?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <p>Selecciona el paquete de números que desees, recuerda que mientras más números tengas, más oportunidades tendrás de ganar.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <p>Serás redirigido a una página donde seleccionarás tu forma de pago y llenarás tus datos.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <p>Una vez realizado el pago, automáticamente y de manera aleatoria se asignarán tus números, los mismos que serán enviados al correo electrónico registrado con la compra.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Packages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">¡ADQUIERE TUS NÚMEROS!</CardTitle>
            <p className="text-center text-muted-foreground">Valor de la Unidad: ${raffle.price_per_number}</p>
          </CardHeader>
          <CardContent>
            <div className="mobile-grid">
              {packages.length > 0 ? packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedPackage === pkg.id 
                      ? 'ring-2 ring-primary shadow-aqua' 
                      : 'hover:shadow-md'
                  } ${raffle.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => raffle.status === 'active' && setSelectedPackage(pkg.id)}
                >
                  {pkg.is_popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                      ★ Más Vendido ★
                    </Badge>
                  )}
                  <CardContent className="text-center mobile-card">
                    <div className="text-lg font-bold mb-2">x{pkg.ticket_count} Números</div>
                    <div className="text-3xl font-black text-primary mb-4">
                      ${(pkg.ticket_count * pkg.price_per_ticket).toFixed(2)}
                    </div>
                    <Button 
                      className="w-full bg-gradient-aqua hover:shadow-aqua touch-target"
                      disabled={raffle.status !== 'active'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pkg.id);
                      }}
                    >
                      {raffle.status === 'active' ? 'COMPRAR' : 'AGOTADO'}
                    </Button>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No hay paquetes disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>¿MÁS NÚMEROS?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega la cantidad de números que desees.
              </p>
              <Button 
                className="w-full bg-gradient-aqua hover:shadow-aqua"
                disabled={raffle.status !== 'active'}
                onClick={() => handlePurchase('custom')}
              >
                {raffle.status === 'active' ? 'COMPRAR CANTIDAD PERSONALIZADA' : 'AGOTADO'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CONSULTA TUS NÚMEROS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                ¿Ya hiciste tu compra? Consulta tus números ingresando aquí tu correo electrónico.
              </p>
              <Link to="/consultar">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  CONSULTAR
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComprarNumeros;