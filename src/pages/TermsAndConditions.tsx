import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteSettingsAPI, type SiteSettings } from '@/lib/supabase';
import { MobileContainer, ResponsiveText } from '@/components/MobileOptimized';

const TermsAndConditions = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await siteSettingsAPI.getPublic();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando términos y condiciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <MobileContainer className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            <ResponsiveText variant="title" className="text-foreground mb-2">
              Términos y Condiciones
            </ResponsiveText>
            <ResponsiveText className="text-muted-foreground">
              {settings?.site_name || 'Colectivo Tombola'}
            </ResponsiveText>
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Términos y Condiciones de Uso</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {settings?.terms_and_conditions || 
                  `Términos y Condiciones Generales

1. ACEPTACIÓN DE LOS TÉRMINOS
Al participar en nuestras actividades de rifa, usted acepta estar sujeto a estos términos y condiciones.

2. ELEGIBILIDAD
- Deben ser mayores de 18 años para participar
- Solo se permite un número por persona por actividad
- Los participantes deben proporcionar información veraz

3. COMPRA DE NÚMEROS
- Los números se venden por orden de llegada
- El pago debe realizarse completo al momento de la reserva
- Los números reservados sin pago se liberarán automáticamente

4. SORTEO
- El sorteo se realizará en la fecha programada
- El proceso será transparente y verificable
- Los ganadores serán contactados inmediatamente

5. PREMIOS
- Los premios se entregarán según las condiciones establecidas
- Los ganadores tienen 30 días para reclamar su premio
- Los premios no reclamados quedarán a disposición de la organización

6. RESPONSABILIDADES
- No nos hacemos responsables por información incorrecta proporcionada por el participante
- Los participantes son responsables de verificar su información de contacto

7. MODIFICACIONES
Nos reservamos el derecho de modificar estos términos en cualquier momento.

Para consultas, contáctanos por WhatsApp.`
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileContainer>
    </div>
  );
};

export default TermsAndConditions;