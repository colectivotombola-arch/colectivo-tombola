import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, CheckCircle, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { siteSettingsAPI, supabase, type SiteSettings } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PagoTransferencia = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  
  // Get data from navigation state
  const buyerData = location.state?.buyerData || {};
  const raffleId = location.state?.raffleId || null;
  const packageId = location.state?.packageId || null;
  const quantity = location.state?.quantity || 1;
  const passedTotal = location.state?.total || 0;
  
  const [formData, setFormData] = useState({
    nombre: buyerData.name || '',
    email: buyerData.email || '',
    telefono: buyerData.phone || '',
    monto_pagado: passedTotal > 0 ? passedTotal.toString() : '',
    numero_referencia: '',
    comprobante_url: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await siteSettingsAPI.getPublic();
      if (settingsData) {
        let processedSettings = { ...settingsData };
        if (settingsData.payment_settings) {
          try {
            processedSettings.payment_settings = typeof settingsData.payment_settings === 'string' 
              ? JSON.parse(settingsData.payment_settings) 
              : settingsData.payment_settings;
          } catch (e) {
            console.error('Error parsing payment_settings:', e);
            processedSettings.payment_settings = {};
          }
        }
        setSettings(processedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const getBankDetails = () => {
    const paymentConfig = settings?.payment_settings as any;
    return {
      bank_name: paymentConfig?.bank_name || 'No configurado',
      account_type: paymentConfig?.account_type || 'Ahorros',
      account_number: paymentConfig?.bank_account || 'No configurado',
      account_holder: paymentConfig?.bank_holder || 'No configurado',
      instructions: paymentConfig?.transfer_instructions || ''
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten imágenes",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload to Supabase Storage
      const fileName = `comprobantes/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);
      
      if (error) {
        console.error('Upload error:', error);
        // Try to create the bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('uploads', {
          public: true
        });
        
        if (!bucketError) {
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file);
          
          if (retryError) throw retryError;
          
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
          
          setFormData(prev => ({ ...prev, comprobante_url: urlData.publicUrl }));
        } else {
          throw error;
        }
      } else {
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        
        setFormData(prev => ({ ...prev, comprobante_url: urlData.publicUrl }));
      }
      
      toast({
        title: "Comprobante subido",
        description: "La imagen se ha cargado correctamente",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el comprobante. Continúa sin él y envíalo por WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!formData.monto_pagado.trim() || parseFloat(formData.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'El monto debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('transferencias')
        .insert({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim() || null,
          monto_pagado: parseFloat(formData.monto_pagado),
          numero_referencia: formData.numero_referencia.trim() || null,
          comprobante_url: formData.comprobante_url || null,
          raffle_id: raffleId,
          package_id: packageId,
          quantity: quantity,
          status: 'pendiente'
        });
      
      if (error) throw error;
      
      setSubmitted(true);
      toast({
        title: "Comprobante enviado",
        description: "Tu comprobante ha sido registrado correctamente. Te contactaremos pronto.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el comprobante. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">¡Comprobante Enviado!</h2>
            <p className="text-muted-foreground text-sm">
              Hemos recibido tu comprobante de transferencia. Te contactaremos pronto para confirmar tu compra y asignarte tus números.
            </p>
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium">Resumen:</p>
              <p>Cantidad: {quantity} boletos</p>
              <p>Monto: ${formData.monto_pagado}</p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bankDetails = getBankDetails();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Pago por Transferencia</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Datos bancarios */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Datos Bancarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground mb-3">
              Realiza la transferencia por el monto total de tu compra y envíanos tu comprobante.
            </p>
            
            {loadingSettings ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banco:</span>
                  <span className="font-medium">{bankDetails.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de cuenta:</span>
                  <span className="font-medium">{bankDetails.account_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número de cuenta:</span>
                  <span className="font-medium">{bankDetails.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titular:</span>
                  <span className="font-medium">{bankDetails.account_holder}</span>
                </div>
              </div>
            )}
            
            {bankDetails.instructions && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mt-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {bankDetails.instructions}
                </p>
              </div>
            )}
            
            {passedTotal > 0 && (
              <div className="bg-primary/10 p-3 rounded-lg mt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total a transferir:</span>
                  <span className="text-primary">${passedTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity} boleto{quantity > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Enviar Comprobante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="nombre" className="text-sm">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className="h-9"
                />
                {errors.nombre && <p className="text-destructive text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Correo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  className="h-9"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="telefono" className="text-sm">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Tu número de teléfono"
                  className="h-9"
                />
              </div>

              <div>
                <Label htmlFor="monto_pagado" className="text-sm">Monto Pagado *</Label>
                <Input
                  id="monto_pagado"
                  type="number"
                  step="0.01"
                  value={formData.monto_pagado}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto_pagado: e.target.value }))}
                  placeholder="0.00"
                  className="h-9"
                />
                {errors.monto_pagado && <p className="text-destructive text-xs mt-1">{errors.monto_pagado}</p>}
              </div>

              <div>
                <Label htmlFor="numero_referencia" className="text-sm">Número de Referencia</Label>
                <Input
                  id="numero_referencia"
                  value={formData.numero_referencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero_referencia: e.target.value }))}
                  placeholder="Número de referencia de la transferencia"
                  className="h-9"
                />
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-sm">Comprobante (opcional)</Label>
                <div 
                  className="mt-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Subiendo...</p>
                    </div>
                  ) : previewUrl ? (
                    <div className="space-y-2">
                      <img 
                        src={previewUrl} 
                        alt="Comprobante" 
                        className="max-h-32 mx-auto rounded"
                      />
                      <p className="text-xs text-muted-foreground">
                        Haz clic para cambiar la imagen
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Haz clic para subir una imagen del comprobante
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG hasta 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Comprobante'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          También puedes enviarnos el comprobante por WhatsApp si tienes problemas.
        </p>
      </div>
    </div>
  );
};

export default PagoTransferencia;
