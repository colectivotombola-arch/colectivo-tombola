import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Trophy, Users, Instagram, ExternalLink } from 'lucide-react';

const ICON_SM = "w-3 h-3";
const ICON_MD = "w-4 h-4";
import { Link } from 'react-router-dom';
import toyotaFortuner from "@/assets/toyota-fortuner.jpg";
import chevroletOnix from "@/assets/chevrolet-onix.jpg";

const DetallesActividad = () => {
  const activityData = {
    number: 33,
    title: "TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km",
    status: "sold_out", // active, sold_out, finished
    pricePerNumber: 1.50,
    soldPercentage: 100,
    totalNumbers: 100000,
    soldNumbers: 100000,
    startDate: "2024-12-01",
    expectedDrawDate: "2024-12-20",
    description: "¡La actividad más esperada del año! Participa por increíbles vehículos 0 kilómetros que cambiarán tu vida.",
    prizes: [
      {
        position: "Primera Suerte",
        prize: "TOYOTA FORTUNER 4X4",
        description: "Camioneta 4x4, modelo 2024, 0 kilómetros",
        image: toyotaFortuner,
        value: "$45,000"
      },
      {
        position: "Segunda Suerte",
        prize: "CHEVROLET ONIX TURBO RS",
        description: "Auto deportivo, modelo 2024, 0 kilómetros", 
        image: chevroletOnix,
        value: "$25,000"
      }
    ],
    rules: [
      "Los vehículos se jugarán una vez vendida la totalidad de los números (100%).",
      "Se utilizarán los 5 números de la primera y segunda suerte de la Suertuda (Lotería Nacional).",
      "La primera suerte gana la Toyota Fortuner 4X4.",
      "La segunda suerte gana el Chevrolet Onix Turbo RS.",
      "Los números se asignan de forma aleatoria automática tras confirmar el pago.",
      "Hay 10 números con premios instantáneos en efectivo.",
      "El sorteo se transmitirá en vivo por Instagram @proyectosflores.",
      "Los ganadores serán contactados por nuestros medios oficiales."
    ],
    previousWinners: [
      {
        activity: 24,
        winner: "@bjoan_99",
        prize: "Suzuki Swift",
        location: "Ambato"
      },
      {
        activity: 22,
        winner: "@gallegos_bryan",
        prize: "Chevrolet ONIX Turbo RS",
        location: "Ecuador"
      },
      {
        activity: 19,
        winner: "@usuario_afortunado",
        prize: "Yamaha MT-03",
        location: "Cuenca"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ArrowLeft className={ICON_SM} />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">Detalles</h1>
              <p className="text-[10px] text-muted-foreground">Actividad #{activityData.number}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-3 py-3 max-w-6xl mx-auto space-y-3">
        
        {/* Main Info */}
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <Badge 
                className={`text-[10px] ${
                  activityData.status === 'sold_out' 
                    ? 'bg-red-500' 
                    : activityData.status === 'active' 
                    ? 'bg-green-500' 
                    : 'bg-gray-500'
                }`}
              >
                {activityData.status === 'sold_out' ? 'AGOTADO' : 
                 activityData.status === 'active' ? 'ACTIVO' : 'FINALIZADO'}
              </Badge>
            </div>
            
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/20 py-2 px-3">
              <CardTitle className="text-sm text-center">
                ACTIVIDAD #{activityData.number}
              </CardTitle>
              <p className="text-xs text-center font-bold text-primary">
                {activityData.title}
              </p>
              <p className="text-center text-muted-foreground text-[10px]">
                {activityData.description}
              </p>
            </CardHeader>
          </div>
        </Card>

        {/* Progress and Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardHeader className="py-2 px-2">
              <CardTitle className="flex items-center gap-1 text-[10px]">
                <Users className={ICON_SM + " text-primary"} />
                Ventas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-0">
              <Progress value={activityData.soldPercentage} className="h-1.5 mb-1" />
              <p className="text-center font-bold text-sm text-primary">
                {activityData.soldPercentage}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2 px-2">
              <CardTitle className="flex items-center gap-1 text-[10px]">
                <Calendar className={ICON_SM + " text-primary"} />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-0 space-y-1">
              <div>
                <p className="text-[9px] font-medium">Inicio</p>
                <p className="text-[10px] text-muted-foreground">{activityData.startDate}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium">Sorteo</p>
                <p className="text-[10px] text-muted-foreground">{activityData.expectedDrawDate}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2 px-2">
              <CardTitle className="flex items-center gap-1 text-[10px]">
                <Trophy className={ICON_SM + " text-primary"} />
                Valor
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 pt-0">
              <p className="text-sm font-bold text-primary">${activityData.pricePerNumber}</p>
              <p className="text-[9px] text-muted-foreground">por número</p>
            </CardContent>
          </Card>
        </div>

        {/* Prizes */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-center text-sm">🏆 PREMIOS PRINCIPALES</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {activityData.prizes.map((prize, index) => (
                <div key={index} className="relative">
                  <img 
                    src={prize.image} 
                    alt={prize.prize}
                    className="w-full h-28 sm:h-36 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded flex items-end p-1.5">
                    <div className="text-white">
                      <Badge className="text-[8px] px-1 py-0 bg-primary">{prize.position}</Badge>
                      <h3 className="text-xs font-bold">{prize.prize}</h3>
                      <p className="text-[9px] text-primary font-bold">{prize.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">📋 Reglas</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="space-y-1">
              {activityData.rules.map((rule, index) => (
                <div key={index} className="flex gap-1.5 items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-[10px]">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Previous Winners */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-1 text-xs">
              <Trophy className={ICON_SM + " text-primary"} />
              Ganadores Anteriores
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="grid grid-cols-3 gap-1.5">
              {activityData.previousWinners.map((winner, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-2">
                    <div className="text-center space-y-0.5">
                      <Badge variant="outline" className="text-[8px] px-1 py-0">#{winner.activity}</Badge>
                      <h4 className="font-bold text-primary text-[10px]">{winner.winner}</h4>
                      <p className="text-[9px]">{winner.prize}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-1 text-xs">
              <Instagram className={ICON_SM + " text-primary"} />
              Instagram
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[10px] h-7 px-2">
                <Instagram className={ICON_SM + " mr-1"} />
                @proyectosflores
              </Button>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[10px] h-7 px-2">
                <Instagram className={ICON_SM + " mr-1"} />
                @alex47flores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-2">
          <h3 className="text-sm font-bold text-foreground">
            {activityData.status === 'sold_out' 
              ? '¡Actividad agotada!' 
              : '¿Listo para participar?'}
          </h3>
          <div className="flex gap-2 justify-center">
            <Link to="/comprar">
              <Button 
                size="sm" 
                className={`text-xs h-7 ${activityData.status === 'sold_out' ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-aqua hover:shadow-aqua'}`}
                disabled={activityData.status === 'sold_out'}
              >
                {activityData.status === 'sold_out' ? 'AGOTADO' : 'COMPRAR'}
              </Button>
            </Link>
            <Link to="/consultar">
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs h-7">
                CONSULTAR
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesActividad;