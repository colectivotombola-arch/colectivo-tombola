import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Trophy, Users, Instagram, ExternalLink } from 'lucide-react';
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Detalles de la Actividad</h1>
              <p className="text-muted-foreground">Actividad #{activityData.number}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Main Info */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <Badge 
                className={
                  activityData.status === 'sold_out' 
                    ? 'bg-red-500' 
                    : activityData.status === 'active' 
                    ? 'bg-green-500' 
                    : 'bg-gray-500'
                }
              >
                {activityData.status === 'sold_out' ? 'AGOTADO' : 
                 activityData.status === 'active' ? 'ACTIVO' : 'FINALIZADO'}
              </Badge>
            </div>
            
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/20">
              <CardTitle className="text-3xl text-center">
                ACTIVIDAD #{activityData.number}
              </CardTitle>
              <p className="text-xl text-center font-bold text-primary">
                {activityData.title}
              </p>
              <p className="text-center text-muted-foreground mt-2">
                {activityData.description}
              </p>
            </CardHeader>
          </div>
        </Card>

        {/* Progress and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Progreso de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={activityData.soldPercentage} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span>Vendidos: {activityData.soldNumbers.toLocaleString()}</span>
                  <span>Total: {activityData.totalNumbers.toLocaleString()}</span>
                </div>
                <p className="text-center font-bold text-2xl text-primary">
                  {activityData.soldPercentage}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Inicio de Ventas</p>
                <p className="text-sm text-muted-foreground">{activityData.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sorteo Estimado</p>
                <p className="text-sm text-muted-foreground">{activityData.expectedDrawDate}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-primary" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Precio por Número</p>
                <p className="text-2xl font-bold text-primary">${activityData.pricePerNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Valor Total en Premios</p>
                <p className="text-lg font-bold">$70,000+</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prizes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">🏆 PREMIOS PRINCIPALES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activityData.prizes.map((prize, index) => (
                <div key={index} className="space-y-4">
                  <div className="relative group">
                    <img 
                      src={prize.image} 
                      alt={prize.prize}
                      className="w-full h-64 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-4">
                      <div className="text-white">
                        <Badge className="mb-2 bg-primary">{prize.position}</Badge>
                        <h3 className="text-2xl font-bold">{prize.prize}</h3>
                        <p className="text-sm opacity-90">{prize.description}</p>
                        <p className="text-lg font-bold text-primary mt-2">{prize.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 Reglas y Condiciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityData.rules.map((rule, index) => (
                <div key={index} className="flex gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Previous Winners */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              🎉 Ganadores Anteriores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activityData.previousWinners.map((winner, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <Badge variant="outline">Actividad #{winner.activity}</Badge>
                      <h4 className="font-bold text-primary">{winner.winner}</h4>
                      <p className="text-sm">{winner.prize}</p>
                      <p className="text-xs text-muted-foreground">{winner.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-primary" />
              Síguenos en Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Mantente al tanto de todos los sorteos, entregas y nuevas actividades siguiendo nuestras cuentas oficiales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Instagram className="w-4 h-4 mr-2" />
                  @proyectosflores
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Instagram className="w-4 h-4 mr-2" />
                  @alex47flores
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">
            {activityData.status === 'sold_out' 
              ? '¡Esta actividad está agotada!' 
              : '¿Listo para participar?'}
          </h3>
          <p className="text-muted-foreground">
            {activityData.status === 'sold_out'
              ? 'Mantente atento a nuestras redes sociales para conocer nuevas actividades.'
              : 'Compra tus números ahora y participa por estos increíbles premios.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/comprar">
              <Button 
                size="lg" 
                className={`${activityData.status === 'sold_out' ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-aqua hover:shadow-aqua'}`}
                disabled={activityData.status === 'sold_out'}
              >
                {activityData.status === 'sold_out' ? 'AGOTADO' : 'COMPRAR NÚMEROS'}
              </Button>
            </Link>
            <Link to="/consultar">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                CONSULTAR MIS NÚMEROS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesActividad;