import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: isSignUp ? "Error en registro" : "Error de acceso",
          description: error.message || "Verifica tus credenciales",
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "¡Registro exitoso!" : "¡Bienvenido!",
          description: isSignUp 
            ? "Revisa tu email para confirmar tu cuenta" 
            : "Has iniciado sesión correctamente",
        });
        if (!isSignUp) {
          navigate('/admin');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isSignUp ? "Crear Cuenta" : "Panel Administrativo"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Crea una cuenta para acceder al panel administrativo" 
              : "Accede para gestionar tu sitio de rifas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tombola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-aqua hover:shadow-aqua"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Registrando...' : 'Accediendo...') 
                : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignUp 
                ? "¿Ya tienes cuenta? Inicia sesión" 
                : "¿No tienes cuenta? Regístrate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;