import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DataFastPaymentProps {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface CustomerData {
  givenName: string;
  middleName: string;
  surname: string;
  email: string;
  identificationDocId: string;
  phone: string;
  address: string;
  city: string;
}

const DataFastPayment = ({ amount, orderId, onSuccess, onError }: DataFastPaymentProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    givenName: '',
    middleName: '',
    surname: '',
    email: '',
    identificationDocId: '',
    phone: '',
    address: '',
    city: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    loadPaymentSettings();
    
    // Load DataFast validation script
    const script = document.createElement('script');
    script.src = 'https://www.datafast.com.ec/js/dfAdditionalValidations1.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://www.datafast.com.ec/js/dfAdditionalValidations1.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('payment_settings')
        .single();

      if (error || !settings) {
        throw new Error('Could not load payment settings');
      }

      const paymentConfig = typeof settings.payment_settings === 'string' 
        ? JSON.parse(settings.payment_settings) 
        : settings.payment_settings;

      setPaymentSettings(paymentConfig);
    } catch (error) {
      console.error('Error loading payment settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de pago",
        variant: "destructive"
      });
    }
  };

  const validateForm = (): boolean => {
    // Validate required fields
    if (!customerData.givenName || !customerData.surname || !customerData.email || 
        !customerData.identificationDocId || !customerData.phone || !customerData.address) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return false;
    }

    // Validate phone format (Ecuador: +593...)
    if (!customerData.phone.startsWith('+593')) {
      toast({
        title: "Teléfono inválido",
        description: "El teléfono debe incluir el código de país (+593)",
        variant: "destructive"
      });
      return false;
    }

    // Validate identification document (10 digits for Ecuador)
    if (customerData.identificationDocId.length !== 10) {
      toast({
        title: "Cédula inválida",
        description: "La cédula debe tener 10 dígitos",
        variant: "destructive"
      });
      return false;
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      toast({
        title: "Términos y condiciones",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm() || !paymentSettings || loading) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Initiating DataFast payment...', { amount, orderId });

      // Calculate taxes
      const ivaRate = paymentSettings.datafast_iva_rate || 0.12;
      const totalAmount = parseFloat(amount.toString());

      // Prepare customer data
      const customer = {
        givenName: customerData.givenName,
        middleName: customerData.middleName,
        surname: customerData.surname,
        email: customerData.email,
        identificationDocId: customerData.identificationDocId.substring(0, 10),
        phone: customerData.phone
      };

      const billing = {
        street1: customerData.address,
        city: customerData.city
      };

      const shipping = {
        street1: customerData.address,
        city: customerData.city
      };

      // Call DataFast checkout endpoint
      const { data, error } = await supabase.functions.invoke('datafast-checkout', {
        body: {
          amount: totalAmount,
          orderId: orderId,
          customer,
          billing,
          shipping
        }
      });

      if (error) {
        console.error('DataFast checkout error:', error);
        throw error;
      }

      const { checkoutId, host } = data;
      
      if (!checkoutId) {
        throw new Error('No checkout ID received');
      }

      console.log('DataFast checkout created:', checkoutId);

      // Load payment widget script
      const widgetScript = document.createElement('script');
      widgetScript.src = `https://${host}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
      widgetScript.async = true;
      
      widgetScript.onload = () => {
        console.log('DataFast widget script loaded');
        
        // Create payment form
        const paymentContainer = document.getElementById('datafast-payment-container');
        if (paymentContainer) {
          paymentContainer.innerHTML = `
            <form action="${paymentSettings.datafast_success_url || '/pago-exitoso'}" class="paymentWidgets" data-brands="VISA MASTER AMEX DINERS DISCOVER">
            </form>
          `;
        }
      };

      widgetScript.onerror = (error) => {
        console.error('Error loading DataFast widget:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el sistema de pagos",
          variant: "destructive"
        });
        setLoading(false);
      };

      document.head.appendChild(widgetScript);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error de pago",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive"
      });
      onError?.(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (!paymentSettings?.datafast_enabled) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">DataFast no está disponible actualmente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Pago con DataFast</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pago seguro con tarjetas de crédito y débito
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Information Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="givenName">Nombres *</Label>
            <Input
              id="givenName"
              value={customerData.givenName}
              onChange={(e) => setCustomerData(prev => ({ ...prev, givenName: e.target.value }))}
              placeholder="Juan Carlos"
              required
            />
          </div>
          <div>
            <Label htmlFor="surname">Apellidos *</Label>
            <Input
              id="surname"
              value={customerData.surname}
              onChange={(e) => setCustomerData(prev => ({ ...prev, surname: e.target.value }))}
              placeholder="Pérez González"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="juan@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={customerData.phone}
              onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+593999123456"
              required
            />
          </div>
          <div>
            <Label htmlFor="identificationDocId">Cédula/RUC *</Label>
            <Input
              id="identificationDocId"
              value={customerData.identificationDocId}
              onChange={(e) => setCustomerData(prev => ({ ...prev, identificationDocId: e.target.value }))}
              placeholder="1234567890"
              maxLength={10}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">Ciudad *</Label>
            <Input
              id="city"
              value={customerData.city}
              onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Quito"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            value={customerData.address}
            onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Av. Principal 123 y Secundaria"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="terms" className="text-sm">
            Acepto los términos y condiciones *
          </Label>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-600">Pago Seguro</span>
          </div>
          <p className="text-sm text-blue-600">
            Total a pagar: <strong>${amount.toFixed(2)} USD</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Procesado por DataFast - Tus datos están protegidos
          </p>
        </div>

        {/* Payment Widget Container */}
        <div id="datafast-payment-container" className="mt-4">
          <Button 
            onClick={handlePayment}
            disabled={loading || !termsAccepted}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar ${amount.toFixed(2)} USD
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFastPayment;