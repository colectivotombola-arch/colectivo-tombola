import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { siteSettingsAPI, SiteSettings } from '@/lib/supabase';
import { ArrowLeft, Save, Upload, Video, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'TOMBOLA PREMIUM',
    primary_color: '#00e5cc',
    secondary_color: '#1a1a1a',
    whatsapp_number: '',
    instagram_video_url: '',
    hero_title: '¡Participa y Gana Premios Increíbles!',
    hero_subtitle: 'Rifas seguras y transparentes con los mejores premios del mercado. Tu próximo premio te espera.'
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
      const result = await siteSettingsAPI.update(settings);
      if (result) {
        toast({
          title: "¡Éxito!",
          description: "Configuraciones guardadas correctamente. Recarga la página para ver los cambios.",
        });
        // Update local storage to reflect changes immediately
        localStorage.setItem('site_settings', JSON.stringify(result));
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // For now, we'll use a placeholder. In a real implementation, you'd upload to Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, site_logo: imageUrl }));
      toast({
        title: "Imagen cargada",
        description: "La imagen se ha cargado correctamente",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Configuración del Sitio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">{user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General del Sitio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_name">Nombre del Sitio</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                  placeholder="Ej: Tombola Premium"
                />
              </div>
              
              <div>
                <Label htmlFor="hero_title">Título Principal de la Página</Label>
                <Input
                  id="hero_title"
                  value={settings.hero_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                  placeholder="Ej: ¡Participa y Gana Premios Increíbles!"
                />
              </div>
              
              <div>
                <Label htmlFor="hero_subtitle">Subtítulo de la Página</Label>
                <Textarea
                  id="hero_subtitle"
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  placeholder="Ej: Rifas seguras y transparentes con los mejores premios"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo del Sitio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.site_logo && (
                  <div className="flex items-center space-x-4">
                    <img 
                      src={settings.site_logo} 
                      alt="Logo actual" 
                      className="w-24 h-24 object-contain border border-border rounded"
                    />
                    <span className="text-muted-foreground">Logo actual</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="logo_upload">Subir Nuevo Logo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="logo_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('logo_upload')?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Seleccionar Imagen</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colores */}
          <Card>
            <CardHeader>
              <CardTitle>Colores del Sitio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp_number">Número de WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="Ej: +573001234567"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Los usuarios podrán contactarte a este número para consultas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instagram Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Instagram className="w-5 h-5" />
                <span>Video de Instagram</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="instagram_video_url">URL del Video de Instagram</Label>
                <Input
                  id="instagram_video_url"
                  value={settings.instagram_video_url || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, instagram_video_url: e.target.value }))}
                  placeholder="Ej: https://www.instagram.com/reel/..."
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Pega la URL completa del video de Instagram que quieres mostrar en tu página principal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;