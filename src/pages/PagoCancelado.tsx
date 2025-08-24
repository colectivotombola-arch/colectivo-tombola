import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

const PagoCancelado = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-yellow-600">Pago Cancelado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground mb-4">
            Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
            <p className="text-sm">
              Si tienes alguna duda o necesitas ayuda con el proceso de pago, no dudes en contactarnos.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 mt-6">
            <Button 
              onClick={() => navigate('/comprar-numeros')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Continuar con la Compra
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

export default PagoCancelado;