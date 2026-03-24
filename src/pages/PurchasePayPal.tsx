import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { rafflesAPI, siteSettingsAPI, supabase, type Raffle, type SiteSettings } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PurchasePayPal = () => {
  const { raffleId, quantity } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const buyerData = (location.state as any)?.buyerData || null;
  
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [assignedNumbers, setAssignedNumbers] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const cardButtonRef = useRef<HTMLDivElement>(null);
  const sdkLoadedRef = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);

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
      
      if (settingsData) {
        let processedSettings = { ...settingsData };
        if (settingsData.payment_settings) {
          try {
            processedSettings.payment_settings = typeof settingsData.payment_settings === 'string' 
              ? JSON.parse(settingsData.payment_settings) 
              : settingsData.payment_settings;
          } catch (e) {
            console.log('Error parsing payment_settings:', e);
          }
        }
        setSettings(processedSettings);
      }
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

  // Get PayPal config from settings
  const getPayPalConfig = useCallback(() => {
    const paymentSettings = settings?.payment_settings || {};
    const envVar = import.meta.env.VITE_PAYPAL_ENVIRONMENT;
    const environment = envVar || paymentSettings.paypal_environment || 'sandbox';
    
    // Get client ID based on environment
    let clientId = '';
    if (environment === 'live') {
      clientId = paymentSettings.paypal_live_client_id || paymentSettings.paypal_client_id || '';
    } else {
      clientId = paymentSettings.paypal_sandbox_client_id || paymentSettings.paypal_client_id || '';
    }
    
    // Fallback to env var, then hardcoded live ID
    if (!clientId) {
      clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AYTM22fKDLvESVIkL24TETFA9igHtO_0IiocvjnehdX6aqcMTWmrE_oSXt8kw6A-nPEyje77exEjxRUw';
    }
    
    const currency = paymentSettings.paypal_currency || 'USD';
    
    return { clientId, currency, environment };
  }, [settings]);

  // Process payment after PayPal approval
  const processPayment = async (orderId: string, captureDetails: any) => {
    if (!buyerData) {
      setPaymentStatus('error');
      setErrorMessage('Faltan datos del comprador. Por favor vuelve e ingresa tus datos.');
      return;
    }

    setPaymentStatus('processing');

    try {
      const ticketQuantity = parseInt(quantity || '1');
      const total = ticketQuantity * (raffle?.price_per_number || 0);

      console.log('Processing PayPal purchase:', {
        raffle_id: raffle?.id,
        quantity: ticketQuantity,
        total_amount: total,
        paypal_order_id: orderId,
      });

      const { data, error } = await supabase.functions.invoke('process-paypal-purchase', {
        body: {
          raffle_id: raffle?.id,
          quantity: ticketQuantity,
          total_amount: total,
          buyer_name: buyerData.name,
          buyer_email: buyerData.email,
          buyer_phone: buyerData.phone,
          paypal_order_id: orderId,
        }
      });

      if (error) throw error;

      console.log('Payment processed successfully:', data);
      
      setAssignedNumbers(data?.assigned_numbers || []);
      setPaymentStatus('success');
      
      toast({
        title: "¡Pago exitoso!",
        description: `Se te han asignado ${ticketQuantity} números. Revisa tu correo.`,
      });

    } catch (err: any) {
      console.error('Error processing payment:', err);
      setPaymentStatus('error');
      setErrorMessage(err.message || 'Ocurrió un error procesando tu compra. Si el cargo fue realizado, contáctanos.');
      
      toast({
        title: "Error",
        description: "No se pudo confirmar la compra. Si el cargo fue realizado, contáctanos.",
        variant: "destructive",
      });
    }
  };

  // Initialize PayPal buttons
  const initializePayPal = useCallback(() => {
    if (!(window as any).paypal || sdkLoadedRef.current) return;
    if (!paypalButtonRef.current && !cardButtonRef.current) return;
    
    sdkLoadedRef.current = true;
    
    const ticketQuantity = parseInt(quantity || '1');
    const total = ticketQuantity * (raffle?.price_per_number || 0);
    const { currency } = getPayPalConfig();

    const buttonConfig = {
      style: { 
        layout: 'vertical' as const, 
        shape: 'rect' as const, 
        label: 'paypal' as const,
        height: 45
      },
      createOrder: (_data: any, actions: any) => {
        console.log('Creating PayPal order:', { total, currency });
        return actions.order.create({
          purchase_units: [{
            amount: { 
              value: total.toFixed(2), 
              currency_code: currency 
            },
            description: `Compra de ${ticketQuantity} boletos - ${raffle?.title || 'Rifa'}`
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        console.log('PayPal payment approved, capturing...', data);
        try {
          const captureDetails = await actions.order.capture();
          console.log('Payment captured:', captureDetails);
          await processPayment(data.orderID, captureDetails);
        } catch (err) {
          console.error('Error capturing payment:', err);
          setPaymentStatus('error');
          setErrorMessage('Error al capturar el pago. Intenta de nuevo.');
        }
      },
      onCancel: () => {
        console.log('Payment cancelled by user');
        toast({
          title: "Pago cancelado",
          description: "Has cancelado el proceso de pago.",
          variant: "destructive",
        });
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        setPaymentStatus('error');
        setErrorMessage('Error de PayPal. Verifica tu conexión e intenta de nuevo.');
        toast({
          title: "Error de PayPal",
          description: "Hubo un problema con PayPal. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    };

    // Render PayPal button
    if (paypalButtonRef.current) {
      const ppBtn = (window as any).paypal.Buttons({ 
        fundingSource: (window as any).paypal.FUNDING.PAYPAL, 
        ...buttonConfig 
      });
      if (ppBtn.isEligible()) {
        ppBtn.render(paypalButtonRef.current);
      }
    }

    // Render Card button
    if (cardButtonRef.current) {
      const cardBtn = (window as any).paypal.Buttons({ 
        fundingSource: (window as any).paypal.FUNDING.CARD, 
        ...buttonConfig 
      });
      if (cardBtn.isEligible()) {
        cardBtn.render(cardButtonRef.current);
      }
    }
  }, [raffle, quantity, getPayPalConfig, toast]);

  // Load PayPal SDK
  useEffect(() => {
    if (!settings || !raffle) return;
    
    const { clientId, currency, environment } = getPayPalConfig();
    
    if (!clientId) {
      console.error('No PayPal Client ID configured');
      setErrorMessage('PayPal no está configurado. Contacta al administrador.');
      setPaymentStatus('error');
      return;
    }
    
    console.log('Loading PayPal SDK:', { clientId: clientId.substring(0, 20) + '...', currency, environment });
    
    // Reset state for reload
    sdkLoadedRef.current = false;
    setSdkReady(false);
    
    // Remove any existing PayPal scripts
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existingScripts.forEach(script => script.remove());
    
    // Clear PayPal namespace
    if ((window as any).paypal) {
      delete (window as any).paypal;
    }
    
    // Clear button containers
    if (paypalButtonRef.current) paypalButtonRef.current.innerHTML = '';
    if (cardButtonRef.current) cardButtonRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons&enable-funding=card`;
    script.async = true;
    script.id = 'paypal-sdk';
    
    script.onload = () => {
      console.log('PayPal SDK loaded successfully, window.paypal:', !!(window as any).paypal);
      setSdkReady(true);
      // Small delay to ensure DOM refs are ready
      setTimeout(() => initializePayPal(), 500);
    };
    
    script.onerror = (error) => {
      console.error('Error loading PayPal SDK script. This may be caused by an ad blocker or CSP policy.', error);
      setPaymentStatus('error');
      setErrorMessage('No se pudo cargar PayPal. Desactiva tu bloqueador de anuncios o verifica tu conexión a internet.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      const sdkScript = document.getElementById('paypal-sdk');
      if (sdkScript) sdkScript.remove();
    };
  }, [settings, raffle, getPayPalConfig, initializePayPal]);

  if (loading || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando proceso de pago...</span>
        </div>
      </div>
    );
  }

  // Check for buyer data
  if (!buyerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <h2 className="text-xl font-bold text-foreground">Faltan datos del comprador</h2>
              <p className="text-muted-foreground">
                Por favor vuelve al paso anterior e ingresa tus datos de contacto.
              </p>
              <Link to="/comprar">
                <Button className="w-full">Volver al inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticketQuantity = parseInt(quantity || '1');
  const total = ticketQuantity * raffle.price_per_number;
  const { environment } = getPayPalConfig();

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-foreground">¡Pago Exitoso!</h2>
              <p className="text-muted-foreground">
                Tu compra ha sido procesada correctamente.
              </p>
              
              {assignedNumbers.length > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Tus números asignados:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {assignedNumbers.sort((a, b) => a - b).map(num => (
                      <span 
                        key={num} 
                        className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                También recibirás un correo con los detalles de tu compra.
              </p>
              
              <Link to="/">
                <Button className="w-full mt-4">Volver al inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold text-foreground">Error en el pago</h2>
              <p className="text-muted-foreground">{errorMessage}</p>
              
              <div className="flex flex-col gap-2">
                <Button onClick={() => setPaymentStatus('idle')} variant="outline">
                  Intentar de nuevo
                </Button>
                <Link to="/comprar">
                  <Button variant="ghost" className="w-full">Volver al inicio</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Processing state
  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <h2 className="text-xl font-bold text-foreground">Procesando tu pago...</h2>
              <p className="text-muted-foreground">
                Por favor espera mientras confirmamos tu compra.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {environment === 'sandbox' && (
              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                SANDBOX
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto mobile-container py-8 max-w-2xl">
        {/* Buyer Info Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Datos del comprador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Nombre:</strong> {buyerData.name}</p>
              <p><strong>Email:</strong> {buyerData.email}</p>
              <p><strong>Teléfono:</strong> {buyerData.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Summary */}
        <Card className="mb-6">
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
                <span className="font-medium">${raffle.price_per_number.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total a pagar:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PayPal Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecciona método de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Paga de forma segura con PayPal o tarjeta de crédito/débito.
            </p>
            
            {/* PayPal Button Container */}
            <div ref={paypalButtonRef} className="min-h-[45px]"></div>
            
            {/* Card Button Container */}
            <div ref={cardButtonRef} className="min-h-[45px]"></div>
            
            {/* Loading state for buttons */}
            {!sdkReady && paymentStatus === 'idle' && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Cargando opciones de pago...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Haz clic en el botón de PayPal o Tarjeta para iniciar el pago</p>
              <p>• Completa el proceso de pago en la ventana que se abrirá</p>
              <p>• Una vez completado, recibirás tus números automáticamente</p>
              <p>• También recibirás un correo con los detalles de tu compra</p>
              <p>• Si tienes problemas, contacta con nuestro soporte</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchasePayPal;
