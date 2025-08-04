import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import toyotaFortuner from "@/assets/toyota-fortuner.jpg";
import chevroletOnix from "@/assets/chevrolet-onix.jpg";

const ComprarNumeros = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  
  // Datos de la actividad actual
  const activityData = {
    number: 33,
    prize1: "TOYOTA FORTUNER 4X4",
    prize2: "CHEVROLET ONIX TURBO RS 0km",
    pricePerNumber: 1.50,
    soldPercentage: 81.28,
    isActive: false, // Los números se agotaron
    instantPrizes: [
      { number: "00939", claimed: false },
      { number: "19302", claimed: true },
      { number: "28346", claimed: false },
      { number: "39373", claimed: true },
      { number: "41907", claimed: false },
      { number: "51418", claimed: true },
      { number: "69821", claimed: false },
      { number: "70283", claimed: false },
      { number: "86512", claimed: true },
      { number: "10127", claimed: true },
    ]
  };

  const packages = [
    { numbers: 6, price: 9, popular: false },
    { numbers: 8, price: 12, popular: false },
    { numbers: 10, price: 15, popular: true },
    { numbers: 20, price: 30, popular: false },
    { numbers: 50, price: 75, popular: false },
    { numbers: 100, price: 150, popular: false },
  ];

  const handlePurchase = (packageNumbers: number, price: number) => {
    if (!activityData.isActive) return;
    
    // Aquí iría la integración con el sistema de pagos
    // Por ahora simularemos el proceso
    alert(`Comprando ${packageNumbers} números por $${price}. Serás redirigido al checkout.`);
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
              <h1 className="text-2xl font-bold text-foreground">ACTIVIDAD #{activityData.number}</h1>
              <p className="text-muted-foreground">{activityData.prize1} + {activityData.prize2}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Status Banner */}
        {!activityData.isActive && (
          <Card className="mb-8 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-destructive mb-2">
                  ¡LO SENTIMOS, LOS NÚMEROS PARA ESTA ACTIVIDAD SE AGOTARON!
                </h2>
                <p className="text-muted-foreground">
                  Los vehículos se jugarán en un live en nuestra cuenta oficial de Instagram, síguenos para mantenerte al tanto.
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
                    <h3 className="text-xl font-bold">TOYOTA FORTUNER 4X4</h3>
                    <p className="text-sm">PRIMERA SUERTE</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={chevroletOnix} 
                  alt="Chevrolet Onix Turbo RS" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold">CHEVROLET ONIX TURBO RS</h3>
                    <p className="text-sm">SEGUNDA SUERTE</p>
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
                  <span className="font-bold">{activityData.soldPercentage}%</span>
                </div>
                <Progress value={activityData.soldPercentage} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                Los vehículos se jugarán una vez vendida la totalidad de los números, es decir, cuando la barra de progreso llegue al 100%. 
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
              {activityData.instantPrizes.map((prize) => (
                <div 
                  key={prize.number}
                  className={`text-center p-3 rounded-lg border-2 ${
                    prize.claimed 
                      ? 'bg-muted border-muted-foreground line-through text-muted-foreground' 
                      : 'bg-primary/10 border-primary text-primary font-bold'
                  }`}
                >
                  <div className="text-lg font-mono">{prize.number}</div>
                  {prize.claimed && <div className="text-xs">¡Premio Entregado!</div>}
                </div>
              ))}
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
            <p className="text-center text-muted-foreground">Valor de la Unidad: ${activityData.pricePerNumber}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.numbers}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedPackage === pkg.numbers 
                      ? 'ring-2 ring-primary shadow-aqua' 
                      : 'hover:shadow-md'
                  } ${!activityData.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => activityData.isActive && setSelectedPackage(pkg.numbers)}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                      ★ Más Vendido ★
                    </Badge>
                  )}
                  <CardContent className="text-center p-6">
                    <div className="text-lg font-bold mb-2">x{pkg.numbers} Números</div>
                    <div className="text-3xl font-black text-primary mb-4">${pkg.price}</div>
                    <Button 
                      className="w-full bg-gradient-aqua hover:shadow-aqua"
                      disabled={!activityData.isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pkg.numbers, pkg.price);
                      }}
                    >
                      {activityData.isActive ? 'COMPRAR' : 'AGOTADO'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
                disabled={!activityData.isActive}
              >
                {activityData.isActive ? 'COMPRAR CANTIDAD PERSONALIZADA' : 'AGOTADO'}
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