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
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center">
          <div className="text-xs uppercase tracking-widest text-primary/80 mb-1">
            Panel exclusivo de Colectivo Tómbola
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {isSignUp ? "Crear Cuenta Interna" : "Acceso Interno de Administración"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Registro interno para personal autorizado de Colectivo Tómbola."
              : "Área privada del equipo de Colectivo Tómbola. Este sitio no está afiliado a proveedores externos de correo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-identifier">Usuario o correo administrativo</Label>
              <Input
                id="admin-identifier"
                name="admin-identifier"
                type="email"
                autoComplete="username"
                placeholder="usuario administrativo interno"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña interna</Label>
              <Input
                id="admin-password"
                name="admin-password"
                type="password"
                autoComplete="current-password"
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
                ? (isSignUp ? 'Registrando...' : 'Verificando acceso...')
                : (isSignUp ? 'Crear Cuenta Interna' : 'Ingresar al Panel')}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Acceso restringido. Uso exclusivo del equipo administrativo de Colectivo Tómbola.
          </p>

          <div className="mt-2 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignUp
                ? "¿Ya tienes cuenta interna? Inicia sesión"
                : "Solicitar registro interno"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;