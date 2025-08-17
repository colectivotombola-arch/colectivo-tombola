import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { rafflesAPI, siteSettingsAPI, type Raffle, type SiteSettings } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import PayPalWidget from '@/components/PayPalWidget';

const PurchasePayPal = () => {
  const { raffleId, quantity } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [raffleId]);

  const loadData = async () => {
    try {
      const [raffleData, settingsData] = await Promise.all([
        rafflesAPI.getActive(),
        siteSettingsAPI.getPublic()
      ]);
      
      setRaffle(raffleData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalSuccess = (details: any) => {
    toast({
      title: "¡Pago exitoso!",
      description: `Pago procesado correctamente. ID: ${details.id}`,
    });
    
    // Redirect to confirmation page
    setTimeout(() => {
      navigate(`/purchase-confirmation/${details.id}`);
    }, 2000);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error:', error);
    toast({
      title: "Error en el pago",
      description: "Hubo un problema procesando tu pago. Intenta nuevamente.",
      variant: "destructive",
    });
  };

  if (loading || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando proceso de pago...</div>
      </div>
    );
  }

  const ticketQuantity = parseInt(quantity || '1');
  const total = ticketQuantity * raffle.price_per_number;
  
  // Get PayPal client ID from settings
  const paymentSettings = settings?.payment_settings ? 
    (typeof settings.payment_settings === 'string' ? 
      JSON.parse(settings.payment_settings) : 
      settings.payment_settings) : {};
  
  const paypalClientId = paymentSettings?.paypal?.client_id || 
    'AcThy7S3bmb6CLJVF9IhV0xsbEkrXmYm-rilgJHnf3t4XVE_3zQrtHSW_tudJvXPlZEE912X9tlsR624';

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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Pago con PayPal</h1>
              <p className="text-sm text-muted-foreground">{raffle.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto mobile-container py-8 max-w-2xl">
        {/* Purchase Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumen de tu compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Rifa:</span>
                <span className="font-medium">{raffle.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Cantidad de boletos:</span>
                <span className="font-medium">{ticketQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Precio por boleto:</span>
                <span className="font-medium">${raffle.price_per_number}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total a pagar:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PayPal Widget */}
        <PayPalWidget
          onSuccess={handlePayPalSuccess}
          onError={handlePayPalError}
          onCancel={() => navigate('/comprar')}
          minAmount={total}
          currency="USD"
          clientId={paypalClientId}
        />

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Una vez completado el pago, recibirás tus números por email</p>
              <p>• Los números se asignan automáticamente y de forma aleatoria</p>
              <p>• Guarda tu comprobante de pago para futuras consultas</p>
              <p>• Si tienes problemas, contacta con nuestro soporte</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchasePayPal;