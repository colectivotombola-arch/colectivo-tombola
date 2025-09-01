import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { rafflesAPI, siteSettingsAPI, type Raffle, type SiteSettings } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import DataFastPayment from '@/components/DataFastPayment';

const PurchaseDataFast = () => {
  const { raffleId, quantity } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [raffleData, settingsData] = await Promise.all([
          rafflesAPI.getActive(),
          siteSettingsAPI.getPublic(),
        ]);
        setRaffle(raffleData);
        setSettings(settingsData);
      } catch (e) {
        console.error('Error loading DataFast page:', e);
        toast({ title: 'Error', description: 'No se pudo cargar la información', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const qty = useMemo(() => parseInt(quantity || '0', 10) || 0, [quantity]);
  const amount = useMemo(() => {
    if (!raffle) return 0;
    return (qty * (raffle.price_per_number || 0));
  }, [qty, raffle]);

  const orderId = useMemo(() => {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `RF${Date.now().toString(36).toUpperCase()}${rand}`;
  }, []);

  if (loading || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando pago DataFast...</div>
      </div>
    );
  }

  if (!qty || amount <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Cantidad inválida. Regresa e intenta otra vez.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/comprar">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Pagar con DataFast</h1>
              <p className="text-sm text-muted-foreground">{raffle.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto mobile-container py-4 sm:py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Resumen de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Precio por boleto</span>
              <span>${raffle.price_per_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Cantidad</span>
              <span>{qty} boletos</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${amount.toFixed(2)}</span>
            </div>

            <div className="mt-4">
              <DataFastPayment 
                amount={amount} 
                orderId={orderId}
                onSuccess={() => {
                  toast({ title: 'Pago iniciado', description: 'Sigue las instrucciones del banco.' });
                }}
                onError={(err) => {
                  toast({ title: 'Error', description: err, variant: 'destructive' });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseDataFast;
