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

// Icon sizes - compact
const ICON_SM = "w-3 h-3";
const ICON_MD = "w-4 h-4";

const ComprarNumeros = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [raffleData, settingsData] = await Promise.all([
        rafflesAPI.getActive(),
        siteSettingsAPI.getPublic()
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
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ArrowLeft className={ICON_SM} />
              </Button>
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold text-foreground">ACTIVIDAD ACTUAL</h1>
              <p className="text-xs text-muted-foreground">{raffle.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-3 max-w-4xl space-y-3">
        
        {/* Status Banner */}
        {raffle.status !== 'active' && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="py-3">
              <div className="text-center">
                <h2 className="text-base font-bold text-destructive mb-1">
                  ¡LO SENTIMOS, LOS NÚMEROS PARA ESTA ACTIVIDAD SE AGOTARON!
                </h2>
                <p className="text-xs text-muted-foreground">
                  Los premios se jugarán en un live en nuestra cuenta oficial de Instagram.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prize Images */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-2">
              <div className="relative">
                <img 
                  src={toyotaFortuner} 
                  alt="Toyota Fortuner 4x4" 
                  className="w-full h-32 sm:h-44 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <div className="text-white">
                    <h3 className="text-sm font-bold">{raffle.title}</h3>
                    <p className="text-[10px]">PRIMER PREMIO</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={chevroletOnix} 
                  alt="Segundo premio" 
                  className="w-full h-32 sm:h-44 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <div className="text-white">
                    <h3 className="text-sm font-bold">{raffle.description}</h3>
                    <p className="text-[10px]">SEGUNDO PREMIO</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-1 text-sm">
              <Star className={ICON_SM + " text-primary"} />
              ¡CANTIDADES LIMITADAS!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Números Vendidos:</span>
                  <span className="font-bold">{raffle.sold_percentage?.toFixed(2) || 0}%</span>
                </div>
                <Progress value={raffle.sold_percentage || 0} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>{raffle.numbers_sold || 0} vendidos</span>
                  <span>{raffle.total_numbers} total</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Los premios se jugarán una vez vendida la totalidad de los números.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instant Prizes */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-1 text-sm">
              <Gift className={ICON_SM + " text-primary"} />
              ¡PREMIOS INSTANTÁNEOS!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <p className="text-[10px] text-muted-foreground mb-2">
              ¡Hay números bendecidos con premios en efectivo!
            </p>
            <div className="grid grid-cols-5 gap-1">
              {raffle.instant_prizes?.map((prize, index) => (
                <div 
                  key={index}
                  className={`text-center p-1.5 rounded border ${
                    prize.claimed 
                      ? 'bg-muted border-muted-foreground line-through text-muted-foreground' 
                      : 'bg-primary/10 border-primary text-primary font-bold'
                  }`}
                >
                  <div className="text-xs font-mono">{prize.number}</div>
                </div>
              )) || (
                <div className="col-span-full text-center text-muted-foreground text-xs">
                  No hay premios instantáneos
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How to Participate */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">¿Cómo participar?</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="space-y-2">
              <div className="flex gap-2 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-[10px]">Selecciona el paquete de números.</p>
              </div>
              <div className="flex gap-2 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-[10px]">Selecciona forma de pago y llena tus datos.</p>
              </div>
              <div className="flex gap-2 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-[10px]">Tus números se asignarán automáticamente.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Packages */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-center text-sm">¡ADQUIERE TUS NÚMEROS!</CardTitle>
            <p className="text-center text-[10px] text-muted-foreground">Unidad: ${raffle.price_per_number}</p>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {packages.length > 0 ? packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedPackage === pkg.id 
                      ? 'ring-1 ring-primary shadow-aqua' 
                      : 'hover:shadow-md'
                  } ${raffle.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => raffle.status === 'active' && setSelectedPackage(pkg.id)}
                >
                  {pkg.is_popular && (
                    <Badge className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-primary text-[8px] px-1 py-0 rounded-b-sm rounded-t-none">
                      ★ Popular ★
                    </Badge>
                  )}
                  <CardContent className={`text-center p-2 ${pkg.is_popular ? 'pt-3' : ''}`}>
                    <div className="text-xs font-bold mb-0.5">x{pkg.ticket_count}</div>
                    <div className="text-base font-black text-primary mb-1">
                      ${(pkg.ticket_count * pkg.price_per_ticket).toFixed(0)}
                    </div>
                    <Button 
                      size="sm"
                      className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold text-[9px] h-5 px-1"
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
                <div className="col-span-full text-center py-4">
                  <p className="text-muted-foreground text-xs">No hay paquetes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultation Section */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">¿MÁS NÚMEROS?</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <Button 
                size="sm"
                className="w-full bg-gradient-aqua hover:shadow-aqua text-[10px] h-6"
                disabled={raffle.status !== 'active'}
                onClick={() => handlePurchase('custom')}
              >
                PERSONALIZAR
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">CONSULTAR</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <Link to="/consultar">
                <Button size="sm" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[10px] h-6">
                  VER MIS NÚMEROS
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