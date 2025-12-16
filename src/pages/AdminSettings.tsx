import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { siteSettingsAPI, SiteSettings } from '@/lib/supabase';
import { toFloat, normalizeWhatsApp } from '@/lib/numberUtils';
import { AdminLayout } from '@/components/AdminLayout';
import { useDesignSettings } from '@/hooks/useDesignSettings';
import { 
  Save, 
  Video, 
  Instagram, 
  CreditCard, 
  Facebook,
  Twitter,
  Globe,
  Mail,
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshFromSiteSettings } = useDesignSettings();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'TOMBOLA PREMIUM',
    primary_color: '#00e5cc',
    secondary_color: '#1a1a1a',
    whatsapp_number: '',
    instagram_video_url: '',
    hero_title: 'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km',
    hero_subtitle: 'Rifas seguras y transparentes con los mejores premios del mercado'
  });
  
  // Estados para métodos de pago - with sandbox/live support
  const [paymentSettings, setPaymentSettings] = useState({
    paypal_enabled: true,
    paypal_environment: 'sandbox' as 'sandbox' | 'live',
    paypal_sandbox_client_id: '',
    paypal_live_client_id: '',
    paypal_currency: 'USD',
    paypal_min_amount: '1.00',
    paypal_email: '',
    bank_transfer_enabled: true,
    bank_account: '',
    bank_name: '',
    account_holder: '',
    routing_number: '',
    bank_instructions: '',
    hotmart_enabled: false,
    hotmart_payment_link: ''
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
            // Migrate old format to new format
            setPaymentSettings(prev => ({
              ...prev,
              ...payment,
              paypal_min_amount: String(payment.paypal_min_amount || '1.00'),
              paypal_environment: payment.paypal_environment || 'sandbox',
              paypal_sandbox_client_id: payment.paypal_sandbox_client_id || payment.paypal_client_id || '',
              paypal_live_client_id: payment.paypal_live_client_id || '',
            }));
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

  const validatePaymentSettings = (): boolean => {
    // Validate PayPal if enabled
    if (paymentSettings.paypal_enabled) {
      const activeClientId = paymentSettings.paypal_environment === 'sandbox' 
        ? paymentSettings.paypal_sandbox_client_id 
        : paymentSettings.paypal_live_client_id;
      
      if (!activeClientId?.trim()) {
        toast({
          title: "Error de validación",
          description: `Client ID de PayPal (${paymentSettings.paypal_environment}) es requerido`,
          variant: "destructive",
        });
        return false;
      }

      const minAmount = parseFloat(paymentSettings.paypal_min_amount);
      if (isNaN(minAmount) || minAmount < 1) {
        toast({
          title: "Error de validación",
          description: "El monto mínimo de PayPal debe ser al menos $1.00",
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate SMTP port if provided
    if (emailSettings.smtp_port && !/^\d+$/.test(emailSettings.smtp_port)) {
      toast({
        title: "Error de validación",
        description: "El puerto SMTP debe ser un número",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validatePaymentSettings()) return;

    setSaving(true);
    try {
      // Normalize WhatsApp number
      const whatsappNumber = normalizeWhatsApp(settings.whatsapp_number || '', '+593');

      // Prepare payment settings with active client_id for compatibility
      const activeClientId = paymentSettings.paypal_environment === 'sandbox' 
        ? paymentSettings.paypal_sandbox_client_id 
        : paymentSettings.paypal_live_client_id;

      const normalizedPaymentSettings = {
        ...paymentSettings,
        paypal_min_amount: toFloat(paymentSettings.paypal_min_amount, 1),
        paypal_client_id: activeClientId, // For backward compatibility
      };

      // Combine all settings
      const allSettings = {
        ...settings,
        whatsapp_number: whatsappNumber,
        price_per_number: String(toFloat(settings.price_per_number, 1.5)),
        payment_settings: normalizedPaymentSettings,
        social_media: socialMedia,
        email_settings: emailSettings
      };

      console.log('Datos a guardar:', allSettings);

      const result = await siteSettingsAPI.update(allSettings);
      if (result) {
        setLastSaved(new Date());
        toast({
          title: "¡Configuraciones guardadas!",
          description: "Todos los cambios se han guardado permanentemente",
        });
        
        // Actualizar estados locales
        setSettings(prev => ({ ...prev, whatsapp_number: whatsappNumber }));
        
        // Refresh design settings to apply changes immediately
        await refreshFromSiteSettings();
        
        console.log('Configuraciones guardadas exitosamente');
      } else {
        throw new Error('No se recibió confirmación de guardado');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar las configuraciones. Verifique su conexión e intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getActivePayPalClientId = () => {
    return paymentSettings.paypal_environment === 'sandbox' 
      ? paymentSettings.paypal_sandbox_client_id 
      : paymentSettings.paypal_live_client_id;
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
        
        {/* Last saved indicator */}
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Última actualización: {lastSaved.toLocaleString('es-ES')}
          </div>
        )}
          
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
                <div>
                  <Label htmlFor="price_per_number">Precio por Número ($)</Label>
                  <Input
                    id="price_per_number"
                    value={settings.price_per_number || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, price_per_number: e.target.value }))}
                    placeholder="1.50"
                  />
                </div>
                <div>
                  <Label htmlFor="activity_title">Título de Actividad (ej: ACTIVIDAD #1)</Label>
                  <Input
                    id="activity_title"
                    value={settings.activity_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, activity_title: e.target.value }))}
                    placeholder="ACTIVIDAD #1"
                  />
                </div>
              </div>
              
                <div>
                  <Label>Logo del sitio</Label>
                  <ImageUpload
                    value={settings.logo_url || ''}
                    onChange={(url) => setSettings(prev => ({ ...prev, logo_url: url }))}
                    bucket="prize-images"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email de Contacto</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contacto@tuempresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+593999123456"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="site_tagline">Eslogan del Sitio</Label>
                  <Input
                    id="site_tagline"
                    value={settings.site_tagline || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_tagline: e.target.value }))}
                    placeholder="Tu eslogan aquí..."
                  />
                </div>

                <div>
                  <Label htmlFor="terms_and_conditions">Términos y Condiciones</Label>
                  <Textarea
                    id="terms_and_conditions"
                    value={settings.terms_and_conditions || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                    placeholder="Términos y condiciones completos..."
                    rows={6}
                    className="min-h-[150px]"
                  />
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

                <div>
                  <Label htmlFor="purchase_rules">Reglas de Compra</Label>
                  <Textarea
                    id="purchase_rules"
                    value={settings.purchase_rules || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, purchase_rules: e.target.value }))}
                    placeholder="Escribe aquí las reglas para realizar compras..."
                    rows={4}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="raffle_rules">Reglas de las Rifas</Label>
                  <Textarea
                    id="raffle_rules"
                    value={settings.raffle_rules || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, raffle_rules: e.target.value }))}
                    placeholder="Escribe aquí las reglas generales de las rifas..."
                    rows={4}
                    className="min-h-[100px]"
                  />
                </div>
            </CardContent>
          </Card>

          {/* Métodos de Pago - DARK THEME */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Métodos de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* PayPal Configuration - DARK THEME */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  Configuración PayPal
                  {paymentSettings.paypal_enabled && (
                    <Badge variant={paymentSettings.paypal_environment === 'live' ? 'default' : 'secondary'}>
                      {paymentSettings.paypal_environment === 'live' ? 'PRODUCCIÓN' : 'SANDBOX'}
                    </Badge>
                  )}
                </h4>
                
                <div className="space-y-4">
                  {/* Enable + Environment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="paypal_enabled"
                        checked={paymentSettings.paypal_enabled}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, paypal_enabled: checked }))}
                      />
                      <Label htmlFor="paypal_enabled" className="text-foreground">Habilitar PayPal</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="paypal_environment" className="text-foreground">Entorno</Label>
                      <select
                        id="paypal_environment"
                        value={paymentSettings.paypal_environment}
                        onChange={(e) => setPaymentSettings(prev => ({ 
                          ...prev, 
                          paypal_environment: e.target.value as 'sandbox' | 'live' 
                        }))}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        disabled={!paymentSettings.paypal_enabled}
                      >
                        <option value="sandbox">Sandbox (Pruebas)</option>
                        <option value="live">Live (Producción)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sandbox Client ID */}
                  <div>
                    <Label htmlFor="paypal_sandbox_client_id" className="text-foreground flex items-center gap-2">
                      Client ID Sandbox
                      {paymentSettings.paypal_environment === 'sandbox' && (
                        <Badge variant="outline" className="text-xs">ACTIVO</Badge>
                      )}
                    </Label>
                    <Input
                      id="paypal_sandbox_client_id"
                      value={paymentSettings.paypal_sandbox_client_id}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypal_sandbox_client_id: e.target.value }))}
                      placeholder="Client ID de PayPal Sandbox"
                      disabled={!paymentSettings.paypal_enabled}
                      className="bg-background border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Obtén tu Client ID en developer.paypal.com → Apps → Sandbox
                    </p>
                  </div>

                  {/* Live Client ID */}
                  <div>
                    <Label htmlFor="paypal_live_client_id" className="text-foreground flex items-center gap-2">
                      Client ID Live (Producción)
                      {paymentSettings.paypal_environment === 'live' && (
                        <Badge variant="outline" className="text-xs">ACTIVO</Badge>
                      )}
                    </Label>
                    <Input
                      id="paypal_live_client_id"
                      value={paymentSettings.paypal_live_client_id}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypal_live_client_id: e.target.value }))}
                      placeholder="Client ID de PayPal Live"
                      disabled={!paymentSettings.paypal_enabled}
                      className="bg-background border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Obtén tu Client ID en developer.paypal.com → Apps → Live
                    </p>
                  </div>

                  {/* Currency and Min Amount */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="paypal_currency" className="text-foreground">Moneda</Label>
                      <select
                        id="paypal_currency"
                        value={paymentSettings.paypal_currency}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypal_currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        disabled={!paymentSettings.paypal_enabled}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="COP">COP</option>
                        <option value="PEN">PEN</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="paypal_min_amount" className="text-foreground">Monto mínimo ($)</Label>
                      <Input
                        id="paypal_min_amount"
                        type="number"
                        step="0.01"
                        min="1"
                        value={paymentSettings.paypal_min_amount}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypal_min_amount: e.target.value }))}
                        placeholder="1.00"
                        disabled={!paymentSettings.paypal_enabled}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypal_email" className="text-foreground">Email de PayPal (opcional)</Label>
                      <Input
                        id="paypal_email"
                        value={paymentSettings.paypal_email}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypal_email: e.target.value }))}
                        placeholder="pagos@tuempresa.com"
                        disabled={!paymentSettings.paypal_enabled}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  {/* Validation warning */}
                  {paymentSettings.paypal_enabled && !getActivePayPalClientId() && (
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Client ID de {paymentSettings.paypal_environment} es requerido
                    </div>
                  )}
                </div>
              </div>

              {/* Transferencia Bancaria - DARK THEME */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Building2 className="w-4 h-4 text-green-500" />
                  Transferencia Bancaria
                </h4>
                <div className="flex items-center space-x-3 mb-4">
                  <Switch
                    id="bank_transfer_enabled"
                    checked={paymentSettings.bank_transfer_enabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, bank_transfer_enabled: checked }))}
                  />
                  <Label htmlFor="bank_transfer_enabled" className="text-foreground">Habilitar Transferencia Bancaria</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name" className="text-foreground">Nombre del Banco</Label>
                    <Input
                      id="bank_name"
                      value={paymentSettings.bank_name}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                      placeholder="Banco Nacional"
                      disabled={!paymentSettings.bank_transfer_enabled}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_holder" className="text-foreground">Titular de la Cuenta</Label>
                    <Input
                      id="account_holder"
                      value={paymentSettings.account_holder}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, account_holder: e.target.value }))}
                      placeholder="Nombre Completo"
                      disabled={!paymentSettings.bank_transfer_enabled}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_account" className="text-foreground">Número de Cuenta</Label>
                    <Input
                      id="bank_account"
                      value={paymentSettings.bank_account}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, bank_account: e.target.value }))}
                      placeholder="1234567890"
                      disabled={!paymentSettings.bank_transfer_enabled}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing_number" className="text-foreground">Código de Ruta/Swift</Label>
                    <Input
                      id="routing_number"
                      value={paymentSettings.routing_number}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, routing_number: e.target.value }))}
                      placeholder="SWIFT123"
                      disabled={!paymentSettings.bank_transfer_enabled}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="bank_instructions" className="text-foreground">Instrucciones de Pago (visible para el usuario)</Label>
                  <Textarea
                    id="bank_instructions"
                    value={paymentSettings.bank_instructions || ''}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, bank_instructions: e.target.value }))}
                    placeholder="Instrucciones detalladas para realizar la transferencia..."
                    rows={3}
                    disabled={!paymentSettings.bank_transfer_enabled}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              {/* Hotmart Pay - DARK THEME */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  Hotmart Pay
                </h4>
                <div className="flex items-center space-x-3 mb-4">
                  <Switch
                    id="hotmart_enabled"
                    checked={paymentSettings.hotmart_enabled}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, hotmart_enabled: checked }))}
                  />
                  <Label htmlFor="hotmart_enabled" className="text-foreground">Habilitar Hotmart Pay</Label>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hotmart_payment_link" className="text-foreground">Enlace de pago de Hotmart</Label>
                    <Input
                      id="hotmart_payment_link"
                      value={paymentSettings.hotmart_payment_link}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, hotmart_payment_link: e.target.value }))}
                      placeholder="https://pay.hotmart.com/..."
                      disabled={!paymentSettings.hotmart_enabled}
                      className="bg-background border-border text-foreground"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Crea un enlace de pago en tu cuenta de Hotmart y pégalo aquí
                    </p>
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
                  <Label htmlFor="facebook_url" className="text-foreground">Facebook URL</Label>
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
                  <Label htmlFor="instagram_url" className="text-foreground">Instagram URL</Label>
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
                  <Label htmlFor="tiktok_url" className="text-foreground">TikTok URL</Label>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4" />
                    <Input
                      id="tiktok_url"
                      value={socialMedia.tiktok_url}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, tiktok_url: e.target.value }))}
                      placeholder="https://tiktok.com/@tuempresa"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="twitter_url" className="text-foreground">Twitter/X URL</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram_handle" className="text-foreground">Handle de Instagram</Label>
                  <Input
                    id="instagram_handle"
                    value={settings.instagram_handle || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagram_handle: e.target.value }))}
                    placeholder="@tuempresa"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_display_name" className="text-foreground">Nombre para mostrar</Label>
                  <Input
                    id="instagram_display_name"
                    value={settings.instagram_display_name || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagram_display_name: e.target.value }))}
                    placeholder="Tu Empresa"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_video_url" className="text-foreground">URL del Video de Instagram (para incrustar)</Label>
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
                  <Label htmlFor="smtp_host" className="text-foreground">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port" className="text-foreground">Puerto SMTP</Label>
                  <Input
                    id="smtp_port"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                    placeholder="587"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Debe ser un número (ej: 587, 465)</p>
                </div>
                <div>
                  <Label htmlFor="smtp_user" className="text-foreground">Usuario SMTP</Label>
                  <Input
                    id="smtp_user"
                    value={emailSettings.smtp_user}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                    placeholder="usuario@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password" className="text-foreground">Contraseña SMTP</Label>
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
                <Label htmlFor="from_email" className="text-foreground">Email de Envío</Label>
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