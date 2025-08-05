import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Reset() {
  const navigate = useNavigate();

  useEffect(() => {
    const resetAuth = async () => {
      // Limpiar todo localStorage relacionado con Supabase
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Esperar un momento y redirigir al login
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    };

    resetAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Reiniciando autenticación...</h2>
        <p className="text-muted-foreground">Te redirigiremos al login en un momento</p>
      </div>
    </div>
  );
}