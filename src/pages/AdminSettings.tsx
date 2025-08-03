import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'PROYECTOS FLORES',
    site_tagline: 'Cumpliendo sueños',
    primary_color: '#00e5cc',
    secondary_color: '#1a1a1a',
    contact_email: '',
    contact_phone: '',
    logo_url: ''
  });

  useEffect(() => {
    // Load settings from localStorage for demo
    const savedSettings = localStorage.getItem('demo_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    // Save to localStorage for demo purposes
    localStorage.setItem('demo_settings', JSON.stringify(settings));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "¡Guardado!",
      description: "Configuración actualizada correctamente",
    });
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configuración del Sitio</h1>
              <p className="text-muted-foreground">Personaliza la apariencia y datos de tu sitio web</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Site Identity */}
          <Card>
            <CardHeader>
              <CardTitle>Identidad del Sitio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Nombre del Sitio</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="PROYECTOS FLORES"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_tagline">Eslogan</Label>
                  <Input
                    id="site_tagline"
                    value={settings.site_tagline}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    placeholder="Cumpliendo sueños"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logo_url"
                    value={settings.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colores del Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color Primario (Aqua)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#00e5cc"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color Secundario (Oscuro)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de Contacto</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="contacto@proyectosflores.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Teléfono</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-gradient-aqua hover:shadow-aqua"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;