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

  // Errores de validación
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!buyerData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    if (!buyerData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    }
    if (!buyerData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerData.email)) {
      errors.email = 'El correo no es válido';
    }
    if (!buyerData.terms_accepted) {
      errors.terms = 'Debes aceptar los términos y condiciones';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    // Validar cantidad
    const quantity = getQuantity();
    
    // Solo aplicar validación de min/max para compras personalizadas, no para paquetes predefinidos
    if (packageId === 'custom') {
      const minTickets = raffle.min_tickets_per_purchase || 1;
      const maxTickets = raffle.max_tickets_per_purchase || 1000;
      
      if (quantity < minTickets) {
        toast({
          title: "Cantidad insuficiente",
          description: `El mínimo de boletos es ${minTickets}`,
          variant: "destructive",
        });
        return;
      }
      
      if (quantity > maxTickets) {
        toast({
          title: "Cantidad excesiva",
          description: `El máximo de boletos es ${maxTickets}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    if (quantity <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "Selecciona al menos 1 boleto",
        variant: "destructive",
      });
      return;
    }

    // Validar formulario
    if (!validateForm()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };

  const handlePayment = async (metodo: 'paypal' | 'transferencia' | 'payphone') => {
    const quantity = getQuantity();
    const total = getTotal();
    
    try {
      // Guardar orden en Supabase
      const { error } = await supabase
        .from('orders')
        .insert({
          nombre: buyerData.name.trim(),
          telefono: buyerData.phone.trim(),
          email: buyerData.email.trim(),
          cantidad_boletos: quantity,
          total: total,
          metodo_pago: metodo,
          estado: 'pendiente'
        });
      
      if (error) {
        console.error('Error saving order:', error);
        toast({
          title: "Error",
          description: "No se pudo registrar la orden. Intenta nuevamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Pedido registrado",
        description: "Tu pedido ha sido registrado correctamente.",
      });

      // Lógica según método de pago
      if (metodo === 'paypal') {
        // Obtener usuario PayPal desde settings o usar placeholder
        const paymentConfig = settings?.payment_settings as any;
        const paypalUser = paymentConfig?.paypal_me_user || 'TU_USUARIO_PAYPAL';
        const paypalUrl = `https://paypal.me/${paypalUser}/${total.toFixed(2)}`;
        window.open(paypalUrl, '_blank', 'noopener,noreferrer');
      } else if (metodo === 'transferencia') {
        navigate('/pago-transferencia');
      } else if (metodo === 'payphone') {
        const paymentConfig = settings?.payment_settings as any;
        const payphoneLink = paymentConfig?.payphone_link || paymentConfig?.payphone?.payment_link || 'https://payphone.app';
        window.open(payphoneLink, '_blank', 'noopener,noreferrer');
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
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
        {/* Progress Steps - Simplified */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-8 sm:w-12 h-1 ${step > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Datos y Cantidad */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Completa tu compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cantidad */}
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
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-primary">{selectedPackage?.ticket_count}</div>
                    <div className="font-medium">boletos</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ${(selectedPackage?.ticket_count || 0) * raffle.price_per_number}
                  </div>
                </div>
              )}

              <Separator />

              {/* Datos del cliente */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buyer_name">Nombre completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="buyer_name"
                      value={buyerData.name}
                      onChange={(e) => setBuyerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre completo"
                      className={`pl-10 ${formErrors.name ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {formErrors.name && <p className="text-destructive text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="buyer_phone">Teléfono *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="buyer_phone"
                      value={buyerData.phone}
                      onChange={(e) => setBuyerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Tu número de teléfono"
                      className={`pl-10 ${formErrors.phone ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {formErrors.phone && <p className="text-destructive text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="buyer_email">Correo electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="buyer_email"
                      type="email"
                      value={buyerData.email}
                      onChange={(e) => setBuyerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                      className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {formErrors.email && <p className="text-destructive text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <Separator />

              {/* Resumen */}
              <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cantidad:</span>
                  <span className="font-medium">{getQuantity()} boletos</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={buyerData.terms_accepted}
                    onChange={(e) => setBuyerData(prev => ({ ...prev, terms_accepted: e.target.checked }))}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    Acepto los términos y condiciones *
                  </label>
                </div>
                {formErrors.terms && <p className="text-destructive text-xs mt-1">{formErrors.terms}</p>}
              </div>

              <Button 
                onClick={handleNextStep} 
                className="w-full bg-gradient-aqua hover:shadow-aqua"
                disabled={getQuantity() === 0}
              >
                Continuar al pago
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Método de Pago */}
        {step === 2 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Selecciona tu método de pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumen de la compra */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span>{buyerData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Boletos:</span>
                    <span className="font-medium">{getQuantity()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-1 border-t border-border mt-1">
                    <span>Total:</span>
                    <span className="text-primary">${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Mensaje de confirmación */}
              <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Tu pedido ha sido registrado. Después de confirmar el pago, recibirás tus números digitales.
                </p>
              </div>

              {/* Botones de pago */}
              <div className="space-y-2">
                <Button 
                  onClick={() => handlePayment('paypal')} 
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagar con PayPal
                </Button>

                <Button 
                  onClick={() => handlePayment('transferencia')} 
                  className="w-full h-12 text-base bg-gray-700 hover:bg-gray-800 text-white"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Pagar por Transferencia Bancaria
                </Button>

                <Button 
                  onClick={() => handlePayment('payphone')} 
                  className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Pagar con PayPhone
                </Button>
              </div>

              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Volver
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseFlow;