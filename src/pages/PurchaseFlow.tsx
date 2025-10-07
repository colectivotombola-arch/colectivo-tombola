import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Building2, Mail, User, Phone, ShoppingCart } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { rafflesAPI, rafflePackagesAPI, raffleNumbersAPI, purchaseConfirmationsAPI, siteSettingsAPI, supabase, type Raffle, type RafflePackage, type SiteSettings } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PurchaseFlow = () => {
  const { raffleId, packageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<RafflePackage | null>(null);
  const [customQuantity, setCustomQuantity] = useState('');
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Datos del cliente
  const [buyerData, setBuyerData] = useState({
    name: '',
    phone: '',
    email: '',
    terms_accepted: false
  });

  // Método de pago seleccionado (solo PayPal y transferencia bancaria)
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'paypal'>('paypal');

  useEffect(() => {
    loadData();
  }, [raffleId, packageId]);

  const loadData = async () => {
    try {
      const [raffleData, settingsData] = await Promise.all([
        rafflesAPI.getActive(),
        siteSettingsAPI.getPublic()
      ]);
      
      setRaffle(raffleData);
      
      // Parse payment_settings from JSON string if needed
      if (settingsData) {
        let processedSettings = { ...settingsData };
        
        if (settingsData.payment_settings) {
          try {
            processedSettings.payment_settings = typeof settingsData.payment_settings === 'string' 
              ? JSON.parse(settingsData.payment_settings) 
              : settingsData.payment_settings;
          } catch (e) {
            console.log('Error parsing payment_settings:', e);
            processedSettings.payment_settings = {};
          }
        }
        
        setSettings(processedSettings);
      }
      
      if (raffleData && packageId && packageId !== 'custom') {
        const packages = await rafflePackagesAPI.getByRaffle(raffleData.id!);
        const pkg = packages.find(p => p.id === packageId);
        setSelectedPackage(pkg || null);
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

  if (loading || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando proceso de compra...</div>
      </div>
    );
  }

  const getQuantity = () => {
    if (packageId === 'custom') {
      return parseInt(customQuantity) || 0;
    }
    return selectedPackage?.ticket_count || 0;
  };

  const getTotal = () => {
    const quantity = getQuantity();
    return quantity * raffle.price_per_number;
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validar cantidad mínima y permitir paquetes mayores al límite configurado
      const quantity = getQuantity();
      const minTickets = raffle.min_tickets_per_purchase || 1;
      const maxTickets = raffle.max_tickets_per_purchase || 1000;
      const effectiveMax = Math.max(maxTickets, quantity);
      
      if (quantity < minTickets) {
        toast({
          title: "Cantidad insuficiente",
          description: `El mínimo de boletos es ${minTickets}`,
          variant: "destructive",
        });
        return;
      }
      
      if (quantity > effectiveMax) {
        toast({
          title: "Cantidad excesiva",
          description: `El máximo de boletos es ${effectiveMax}`,
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validar datos del cliente
      if (!buyerData.name || !buyerData.phone || !buyerData.email) {
        toast({
          title: "Datos incompletos",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        });
        return;
      }
      if (!buyerData.terms_accepted) {
        toast({
          title: "Términos y condiciones",
          description: "Debes aceptar los términos y condiciones",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const handlePurchase = async () => {
    try {
      const quantity = getQuantity();
      const total = getTotal();
      
      // Generar número de confirmación único
      const confirmationNumber = `RF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      if (paymentMethod === 'bank_transfer') {
        // Crear registro de confirmación para transferencia bancaria
        const { data: confirmationData, error: confirmationError } = await supabase
          .from('purchase_confirmations')
          .insert({
            raffle_id: raffle.id!,
            buyer_name: buyerData.name,
            buyer_email: buyerData.email,
            buyer_phone: buyerData.phone,
            quantity,
            total_amount: total,
            payment_method: paymentMethod,
            confirmation_number: confirmationNumber,
            status: 'payment_pending',
            assigned_numbers: [] // Sin números asignados hasta confirmar pago
          })
          .select()
          .single();
        
        if (confirmationError) {
          console.error('Error creating confirmation:', confirmationError);
          throw new Error('No se pudo crear la confirmación de compra');
        }
        
        const paymentConfig = settings?.payment_settings as any;
        const bankName = paymentConfig?.bank_name || 'Banco';
        const accountHolder = paymentConfig?.account_holder || 'Titular';
        const bankAccount = paymentConfig?.bank_account || 'Cuenta bancaria';
        const routingNumber = paymentConfig?.routing_number || '';
        
        const bankInfo = `Banco: ${bankName}\nTitular: ${accountHolder}\nCuenta: ${bankAccount}${routingNumber ? '\nCódigo: ' + routingNumber : ''}`;
        
        toast({
          title: "Compra registrada",
          description: `Confirmación: ${confirmationNumber}. Completa la transferencia bancaria.`,
          duration: 8000,
        });
        
        // Mostrar información bancaria
        alert(`DATOS PARA TRANSFERENCIA BANCARIA:\n\n${bankInfo}\n\nMonto a transferir: $${total.toFixed(2)}\nCódigo de confirmación: ${confirmationNumber}\n\nUna vez realizada la transferencia, contacta por WhatsApp con el comprobante para confirmar tu compra.`);
        
        setTimeout(() => navigate('/'), 3000);
      }
      
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la compra. Intenta nuevamente.",
        variant: "destructive",
      });
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Proceso de Compra</h1>
              <p className="text-sm text-muted-foreground">{raffle.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto mobile-container py-4 sm:py-6 max-w-2xl">
        {/* Progress Steps - Mobile Responsive */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-4 sm:w-8 h-1 ${step > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`w-4 sm:w-8 h-1 ${step > 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Confirmar Cantidad */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Confirma tu compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {packageId === 'custom' ? (
                <div>
                  <Label htmlFor="custom_quantity">Cantidad de boletos</Label>
                  <Input
                    id="custom_quantity"
                    type="number"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                  min="1"
                  max={raffle.max_tickets_per_purchase || 1000}
                  placeholder={`Mínimo ${raffle.min_tickets_per_purchase || 1}, máximo ${raffle.max_tickets_per_purchase || 1000}`}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Límite: {raffle.min_tickets_per_purchase || 1} - {raffle.max_tickets_per_purchase || 1000} boletos
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold">{selectedPackage?.ticket_count}</div>
                    <div>
                      <div className="font-medium">boletos</div>
                      {selectedPackage?.is_popular && (
                        <Badge className="text-xs">Más popular</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ${(selectedPackage?.ticket_count || 0) * raffle.price_per_number}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Precio por boleto:</span>
                  <span>${raffle.price_per_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cantidad:</span>
                  <span>{getQuantity()} boletos</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleNextStep} 
                className="w-full bg-gradient-aqua hover:shadow-aqua"
                disabled={getQuantity() === 0}
              >
                Continuar con los datos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Datos del Cliente */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Tus datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyer_name">Nombre completo *</Label>
                <Input
                  id="buyer_name"
                  value={buyerData.name}
                  onChange={(e) => setBuyerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <Label htmlFor="buyer_phone">Teléfono *</Label>
                <Input
                  id="buyer_phone"
                  value={buyerData.phone}
                  onChange={(e) => setBuyerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div>
                <Label htmlFor="buyer_email">Correo electrónico *</Label>
                <Input
                  id="buyer_email"
                  type="email"
                  value={buyerData.email}
                  onChange={(e) => setBuyerData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Tu correo electrónico"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Aquí recibirás tus números asignados
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={buyerData.terms_accepted}
                  onChange={(e) => setBuyerData(prev => ({ ...prev, terms_accepted: e.target.checked }))}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Acepto los términos y condiciones. Los números se asignarán aleatoriamente una vez confirmado el pago.
                </label>
              </div>

               <div className="flex flex-col sm:flex-row gap-2">
                 <Button variant="outline" onClick={() => setStep(1)} className="touch-target">
                   Volver
                 </Button>
                 <Button 
                   onClick={handleNextStep} 
                   className="flex-1 bg-gradient-aqua hover:shadow-aqua touch-target"
                 >
                   Continuar al pago
                 </Button>
               </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Método de Pago */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Método de pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen de la compra */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen de tu compra</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nombre:</span>
                    <span>{buyerData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{buyerData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Boletos:</span>
                    <span>{getQuantity()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="space-y-3">
                {/* PayPal - Habilitado condicionalmente */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    !(((settings?.payment_settings as any)?.paypal?.enabled) || ((settings?.payment_settings as any)?.paypal_enabled)) ? 'opacity-50' : ''
                  } ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => (((settings?.payment_settings as any)?.paypal?.enabled) || ((settings?.payment_settings as any)?.paypal_enabled)) && setPaymentMethod('paypal')}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-muted-foreground">
                        {(((settings?.payment_settings as any)?.paypal?.enabled) || ((settings?.payment_settings as any)?.paypal_enabled)) 
                          ? 'Pago seguro con tarjeta o PayPal'
                          : 'No disponible'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transferencia Bancaria - Habilitada condicionalmente */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    !(((settings?.payment_settings as any)?.bank_transfer?.enabled) || ((settings?.payment_settings as any)?.bank_transfer_enabled)) ? 'opacity-50' : ''
                  } ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => (((settings?.payment_settings as any)?.bank_transfer?.enabled) || ((settings?.payment_settings as any)?.bank_transfer_enabled)) && setPaymentMethod('bank_transfer')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Transferencia Bancaria</div>
                      <div className="text-sm text-muted-foreground">
                        {(((settings?.payment_settings as any)?.bank_transfer?.enabled) || ((settings?.payment_settings as any)?.bank_transfer_enabled)) 
                          ? 'Pago directo a cuenta bancaria'
                          : 'No disponible'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               <div className="flex flex-col sm:flex-row gap-2">
                 <Button variant="outline" onClick={() => setStep(2)} className="touch-target">
                   Volver
                 </Button>
                  {paymentMethod === 'paypal' && ((((settings?.payment_settings as any)?.paypal?.enabled) || ((settings?.payment_settings as any)?.paypal_enabled))) && (
                    <Button 
                      onClick={() => navigate(`/purchase-paypal/${raffle.id}/${getQuantity()}`, { state: { buyerData } })} 
                      className="flex-1 bg-gradient-aqua hover:shadow-aqua touch-target"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagar con PayPal
                    </Button>
                  )}
                  {paymentMethod === 'bank_transfer' && ((((settings?.payment_settings as any)?.bank_transfer?.enabled) || ((settings?.payment_settings as any)?.bank_transfer_enabled))) && (
                    <Button 
                      onClick={handlePurchase} 
                      className="flex-1 bg-gradient-aqua hover:shadow-aqua touch-target"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Transferencia Bancaria
                    </Button>
                  )}
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseFlow;