import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, RotateCcw } from 'lucide-react';

const PagoFallido = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Pago Fallido</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground mb-4">
            Hubo un problema al procesar tu pago. Esto puede deberse a:
          </p>
          
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg text-left">
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Fondos insuficientes en tu tarjeta</li>
              <li>Datos de tarjeta incorrectos</li>
              <li>Problemas con tu banco</li>
              <li>Conexión interrumpida</li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground">
            No se ha realizado ningún cargo a tu cuenta. Puedes intentar nuevamente o contactar con nosotros si el problema persiste.
          </p>
          
          <div className="flex flex-col gap-2 mt-6">
            <Button 
              onClick={() => navigate('/comprar-numeros')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Intentar de Nuevo
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagoFallido;