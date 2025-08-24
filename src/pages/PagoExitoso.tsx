import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Home, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PagoExitoso = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'approved' | 'rejected' | 'pending'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Get resourcePath from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const resourcePath = urlParams.get('resourcePath');

      if (!resourcePath) {
        toast({
          title: "Error",
          description: "No se encontró información de pago",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      console.log('Checking payment status with resourcePath:', resourcePath);

      // Call our edge function to check status
      const { data, error } = await supabase.functions.invoke('datafast-status', {
        body: { resourcePath }
      });

      if (error) {
        console.error('Error checking payment status:', error);
        throw error;
      }

      console.log('Payment status response:', data);

      setPaymentDetails(data);

      // Check if payment was approved (codes starting with 000.)
      if (data.result?.code?.startsWith('000.')) {
        setPaymentStatus('approved');
        toast({
          title: "¡Pago Aprobado!",
          description: "Tu pago ha sido procesado exitosamente",
        });
      } else {
        setPaymentStatus('rejected');
        toast({
          title: "Pago No Aprobado",
          description: `El pago no fue procesado. Código: ${data.result?.code}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('rejected');
      toast({
        title: "Error",
        description: "No se pudo verificar el estado del pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Verificando pago...</h2>
          <p className="text-muted-foreground">Por favor espera mientras confirmamos tu transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {paymentStatus === 'approved' ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {paymentStatus === 'approved' ? '¡Pago Exitoso!' : 'Pago No Aprobado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentStatus === 'approved' ? (
            <>
              <p className="text-green-600 mb-4">
                Tu pago ha sido procesado exitosamente. Recibirás un correo de confirmación en breve.
              </p>
              {paymentDetails?.merchantTransactionId && (
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <p className="text-sm font-medium">Número de Orden:</p>
                  <p className="text-lg font-bold">{paymentDetails.merchantTransactionId}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-red-600 mb-4">
                Tu pago no pudo ser procesado. Por favor intenta nuevamente o contacta con nosotros.
              </p>
              {paymentDetails?.result?.description && (
                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <p className="text-sm font-medium">Detalles:</p>
                  <p className="text-sm">{paymentDetails.result.description}</p>
                </div>
              )}
            </>
          )}
          
          <div className="flex flex-col gap-2 mt-6">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
            
            {paymentStatus === 'rejected' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/comprar-numeros')}
                className="w-full"
              >
                Intentar Nuevamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagoExitoso;