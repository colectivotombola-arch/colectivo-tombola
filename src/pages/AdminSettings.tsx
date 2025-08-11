import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { siteSettingsAPI, SiteSettings } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  Save, 
  Video, 
  Instagram, 
  CreditCard, 
  Facebook,
  Twitter,
  Globe,
  Mail
} from 'lucide-react';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'TOMBOLA PREMIUM',
    primary_color: '#00e5cc',
    secondary_color: '#1a1a1a',
    whatsapp_number: '',
    instagram_video_url: '',
    hero_title: 'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km',
    hero_subtitle: 'Rifas seguras y transparentes con los mejores premios del mercado'
  });
  
  // Estados adicionales para funcionalidades completas
  const [paymentSettings, setPaymentSettings] = useState({
    paypal_email: '',
    bank_account: '',
    bank_name: '',
    account_holder: '',
    routing_number: '',
    stripe_public_key: '',
    mercadopago_access_token: ''
  });

  const [socialMedia, setSocialMedia] = useState({
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    twitter_url: '',
    youtube_url: ''
  });

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    from_email: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await siteSettingsAPI.get();
      if (data) {
        setSettings(data);
        
        // Cargar configuraciones adicionales desde JSON
        if (data.social_media) {
          try {
            const social = typeof data.social_media === 'string' 
              ? JSON.parse(data.social_media) 
              : data.social_media;
            setSocialMedia(social);
          } catch (e) {
            console.log('No social media settings found');
          }
        }
        
        if (data.payment_settings) {
          try {
            const payment = typeof data.payment_settings === 'string' 
              ? JSON.parse(data.payment_settings) 
              : data.payment_settings;
            setPaymentSettings(payment);
          } catch (e) {
            console.log('No payment settings found');
          }
        }
        
        if (data.email_settings) {
          try {
            const email = typeof data.email_settings === 'string' 
              ? JSON.parse(data.email_settings) 
              : data.email_settings;
            setEmailSettings(email);
          } catch (e) {
            console.log('No email settings found');
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Combinar todas las configuraciones
      const allSettings = {
        ...settings,
        payment_settings: JSON.stringify(paymentSettings),
        social_media: JSON.stringify(socialMedia),
        email_settings: JSON.stringify(emailSettings)
      };

      const result = await siteSettingsAPI.update(allSettings);
      if (result) {
        toast({
          title: "¡Éxito!",
          description: "Todas las configuraciones se guardaron correctamente",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Cargando configuraciones...</div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Configuración Completa" 
      subtitle="Gestiona todos los aspectos de tu sitio"
    >
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Configuración General del Sitio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Configuración General del Sitio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_name">Nombre del Sitio</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    placeholder="TOMBOLA PREMIUM"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp de Contacto (incluir código de país)</Label>
                  <Input
                    id="whatsapp_number"
                    value={settings.whatsapp_number || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    placeholder="+593999053073"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Incluye el código de país (ej: +593 para Ecuador)
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="hero_title">Título Principal de la Actividad</Label>
                <Input
                  id="hero_title"
                  value={settings.hero_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                  placeholder="TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km"
                />
              </div>
              
              <div>
                <Label htmlFor="hero_subtitle">Descripción del Sitio</Label>
                <Textarea
                  id="hero_subtitle"
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  placeholder="Rifas seguras y transparentes con los mejores premios del mercado"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Color Primario (Aqua)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      placeholder="#00e5cc"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary_color">Color Secundario</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Métodos de Pago y Cuentas Bancarias</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paypal_email">Email de PayPal</Label>
                  <Input
                    id="paypal_email"
                    value={paymentSettings.paypal_email}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypal_email: e.target.value }))}
                    placeholder="pagos@tuempresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="stripe_public_key">Clave Pública de Stripe</Label>
                  <Input
                    id="stripe_public_key"
                    value={paymentSettings.stripe_public_key}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripe_public_key: e.target.value }))}
                    placeholder="pk_live_..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mercadopago_access_token">Token de MercadoPago</Label>
                <Input
                  id="mercadopago_access_token"
                  value={paymentSettings.mercadopago_access_token}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, mercadopago_access_token: e.target.value }))}
                  placeholder="APP_USR-..."
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Información Bancaria</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name">Nombre del Banco</Label>
                    <Input
                      id="bank_name"
                      value={paymentSettings.bank_name}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="Banco Nacional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_holder">Titular de la Cuenta</Label>
                    <Input
                      id="account_holder"
                      value={paymentSettings.account_holder}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, account_holder: e.target.value }))}
                      placeholder="Nombre Completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_account">Número de Cuenta</Label>
                    <Input
                      id="bank_account"
                      value={paymentSettings.bank_account}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, bank_account: e.target.value }))}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing_number">Código de Ruta/Swift</Label>
                    <Input
                      id="routing_number"
                      value={paymentSettings.routing_number}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, routing_number: e.target.value }))}
                      placeholder="SWIFT123"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Instagram className="w-5 h-5" />
                <span>Redes Sociales e Integración</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <Input
                      id="facebook_url"
                      value={socialMedia.facebook_url}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, facebook_url: e.target.value }))}
                      placeholder="https://facebook.com/tuempresa"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <Input
                      id="instagram_url"
                      value={socialMedia.instagram_url}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, instagram_url: e.target.value }))}
                      placeholder="https://instagram.com/tuempresa"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tiktok_url">TikTok URL</Label>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-black" />
                    <Input
                      id="tiktok_url"
                      value={socialMedia.tiktok_url}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, tiktok_url: e.target.value }))}
                      placeholder="https://tiktok.com/@tuempresa"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="twitter_url">Twitter/X URL</Label>
                  <div className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <Input
                      id="twitter_url"
                      value={socialMedia.twitter_url}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, twitter_url: e.target.value }))}
                      placeholder="https://twitter.com/tuempresa"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_video_url">URL del Video de Instagram (para incrustar)</Label>
                <Input
                  id="instagram_video_url"
                  value={settings.instagram_video_url || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, instagram_video_url: e.target.value }))}
                  placeholder="https://www.instagram.com/reel/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Configuración de Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">Puerto SMTP</Label>
                  <Input
                    id="smtp_port"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                    placeholder="587"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_user">Usuario SMTP</Label>
                  <Input
                    id="smtp_user"
                    value={emailSettings.smtp_user}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                    placeholder="usuario@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">Contraseña SMTP</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                    placeholder="contraseña_de_aplicación"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="from_email">Email de Envío</Label>
                <Input
                  id="from_email"
                  value={emailSettings.from_email}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                  placeholder="noreply@tuempresa.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end sticky bottom-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-black font-bold px-8 py-4 text-lg shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : 'Guardar Toda la Configuración'}</span>
            </Button>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminSettings;