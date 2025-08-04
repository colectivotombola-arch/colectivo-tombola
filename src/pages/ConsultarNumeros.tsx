import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Mail, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ConsultarNumeros = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const { toast } = useToast();

  // Datos demo de ejemplo
  const demoResults = {
    email: 'ejemplo@correo.com',
    purchases: [
      {
        id: 'PF-001',
        activityNumber: 33,
        activityName: 'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS',
        purchaseDate: '2024-12-15',
        quantity: 10,
        totalAmount: 15,
        numbers: ['01234', '05678', '09012', '15432', '18765', '23456', '27890', '31234', '35678', '39012'],
        status: 'confirmed',
        instantPrizes: ['15432'], // Números que ganaron premio instantáneo
      },
      {
        id: 'PF-002',
        activityNumber: 32,
        activityName: 'YAMAHA MT-07 + SUZUKI SWIFT RS',
        purchaseDate: '2024-11-28',
        quantity: 6,
        totalAmount: 9,
        numbers: ['45678', '49012', '53456', '57890', '61234', '65678'],
        status: 'drawn',
        result: 'no_winner',
      }
    ]
  };

  const handleSearch = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simular búsqueda
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo: si el email contiene "demo" o "ejemplo", mostrar resultados
    if (email.toLowerCase().includes('demo') || email.toLowerCase().includes('ejemplo') || email.includes('@')) {
      setSearchResults(demoResults);
      toast({
        title: "¡Encontrado!",
        description: `Se encontraron ${demoResults.purchases.length} compras para ${email}`,
      });
    } else {
      setSearchResults({ purchases: [] });
      toast({
        title: "Sin resultados",
        description: "No se encontraron compras asociadas a este correo electrónico",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>;
      case 'drawn':
        return <Badge className="bg-purple-500">Sorteado</Badge>;
      case 'winner':
        return <Badge className="bg-green-500">¡GANADOR!</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'winner':
        return <Badge className="bg-green-500 text-white">¡GANASTE!</Badge>;
      case 'no_winner':
        return <Badge variant="outline">No ganador</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/comprar">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Consultar Mis Números</h1>
              <p className="text-muted-foreground">Revisa tus compras y números asignados</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Buscar por Correo Electrónico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu-email@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-gradient-aqua hover:shadow-aqua"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Ingresa el correo electrónico que usaste al momento de realizar tu compra.
                <br />
                <strong>Demo:</strong> Usa cualquier email con "@" para ver resultados de ejemplo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-6">
            {searchResults.purchases.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron compras</h3>
                    <p className="text-muted-foreground mb-4">
                      No hay compras asociadas al correo electrónico proporcionado.
                    </p>
                    <Link to="/comprar">
                      <Button className="bg-gradient-aqua hover:shadow-aqua">
                        Comprar Números Ahora
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              searchResults.purchases.map((purchase: any) => (
                <Card key={purchase.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Actividad #{purchase.activityNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">{purchase.activityName}</p>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(purchase.status)}
                        {purchase.result && getResultBadge(purchase.result)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Fecha de Compra</p>
                          <p className="text-sm text-muted-foreground">{purchase.purchaseDate}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Cantidad de Números</p>
                        <p className="text-sm text-muted-foreground">{purchase.quantity} números</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Total Pagado</p>
                        <p className="text-sm text-muted-foreground">${purchase.totalAmount}</p>
                      </div>
                    </div>

                    {/* Instant Prizes */}
                    {purchase.instantPrizes && purchase.instantPrizes.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-bold">¡FELICIDADES! ¡GANASTE UN PREMIO INSTANTÁNEO!</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Los números {purchase.instantPrizes.join(', ')} han sido premiados con dinero en efectivo.
                        </p>
                      </div>
                    )}

                    {/* Numbers Grid */}
                    <div>
                      <h4 className="font-medium mb-3">Tus Números:</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {purchase.numbers.map((number: string) => (
                          <div 
                            key={number}
                            className={`text-center p-2 rounded border-2 font-mono text-sm ${
                              purchase.instantPrizes?.includes(number)
                                ? 'bg-green-100 border-green-500 text-green-700 font-bold'
                                : 'bg-card border-border'
                            }`}
                          >
                            {number}
                            {purchase.instantPrizes?.includes(number) && (
                              <div className="text-xs text-green-600">💰</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Purchase ID */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        ID de Compra: {purchase.id}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Los números se asignan automáticamente de forma aleatoria después del pago.</p>
              <p>• Revisa tu bandeja de entrada y carpeta de spam para encontrar tus números.</p>
              <p>• Los premios instantáneos se identifican inmediatamente después de la compra.</p>
              <p>• El sorteo principal se realiza cuando se venden todos los números disponibles.</p>
              <p>• Mantén este comprobante como respaldo de tu participación.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultarNumeros;