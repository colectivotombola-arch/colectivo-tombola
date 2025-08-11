import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  Palette, 
  Type, 
  Layout, 
  Save,
  RotateCcw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DesignSettings {
  id?: string;
  font_family: string;
  font_size_base: number;
  font_size_heading: number;
  border_radius: number;
  theme_mode: string;
  custom_css?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminDesign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<DesignSettings>({
    font_family: 'Inter',
    font_size_base: 16,
    font_size_heading: 24,
    border_radius: 8,
    theme_mode: 'light',
    custom_css: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Moderno)' },
    { value: 'Roboto', label: 'Roboto (Legible)' },
    { value: 'Open Sans', label: 'Open Sans (Versátil)' },
    { value: 'Poppins', label: 'Poppins (Redondeado)' },
    { value: 'Montserrat', label: 'Montserrat (Elegante)' },
    { value: 'Lato', label: 'Lato (Amigable)' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro (Profesional)' },
    { value: 'Nunito', label: 'Nunito (Suave)' }
  ];

  useEffect(() => {
    loadDesignSettings();
  }, []);

  const loadDesignSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('design_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        applyDesignSettings(data);
      }
    } catch (error) {
      console.error('Error loading design settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de diseño",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyDesignSettings = (designSettings: DesignSettings) => {
    const root = document.documentElement;
    
    // Aplicar fuente
    root.style.setProperty('--font-family', designSettings.font_family);
    
    // Aplicar tamaños de fuente
    root.style.setProperty('--font-size-base', `${designSettings.font_size_base}px`);
    root.style.setProperty('--font-size-heading', `${designSettings.font_size_heading}px`);
    
    // Aplicar border radius
    root.style.setProperty('--border-radius', `${designSettings.border_radius}px`);
    
    // Aplicar CSS personalizado
    if (designSettings.custom_css) {
      let styleElement = document.getElementById('custom-css');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-css';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = designSettings.custom_css;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('design_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        applyDesignSettings(data);
        
        toast({
          title: "¡Éxito!",
          description: "La configuración de diseño se guardó correctamente",
        });
      }
    } catch (error) {
      console.error('Error saving design settings:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de diseño",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      font_family: 'Inter',
      font_size_base: 16,
      font_size_heading: 24,
      border_radius: 8,
      theme_mode: 'light',
      custom_css: ''
    };
    
    setSettings(defaultSettings);
    applyDesignSettings(defaultSettings);
    
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto",
    });
  };

  const previewChanges = () => {
    applyDesignSettings(settings);
    toast({
      title: "Vista previa aplicada",
      description: "Los cambios se han aplicado temporalmente para previsualización",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración de diseño...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="Diseño Personalizado" 
      subtitle="Personaliza la apariencia visual de tu sitio web"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tipografía */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Type className="w-5 h-5" />
              <span>Tipografía</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="font_family">Familia de Fuente</Label>
                <Select 
                  value={settings.font_family} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, font_family: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="font_size_base">Tamaño Base (px)</Label>
                <Input
                  id="font_size_base"
                  type="number"
                  value={settings.font_size_base}
                  onChange={(e) => setSettings(prev => ({ ...prev, font_size_base: parseInt(e.target.value) || 16 }))}
                  min="12"
                  max="24"
                />
              </div>
              
              <div>
                <Label htmlFor="font_size_heading">Tamaño Títulos (px)</Label>
                <Input
                  id="font_size_heading"
                  type="number"
                  value={settings.font_size_heading}
                  onChange={(e) => setSettings(prev => ({ ...prev, font_size_heading: parseInt(e.target.value) || 24 }))}
                  min="18"
                  max="48"
                />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 style={{ fontFamily: settings.font_family, fontSize: `${settings.font_size_heading}px` }}>
                Vista previa del título
              </h3>
              <p style={{ fontFamily: settings.font_family, fontSize: `${settings.font_size_base}px` }}>
                Este es un texto de ejemplo para mostrar cómo se verá con la configuración actual.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layout className="w-5 h-5" />
              <span>Diseño y Layout</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="border_radius">Radio de Borde (px)</Label>
              <Input
                id="border_radius"
                type="number"
                value={settings.border_radius}
                onChange={(e) => setSettings(prev => ({ ...prev, border_radius: parseInt(e.target.value) || 8 }))}
                min="0"
                max="20"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Controla qué tan redondeados son los bordes de botones y tarjetas
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="mb-2">Vista previa de elementos:</h4>
              <div className="space-y-2">
                <Button 
                  style={{ borderRadius: `${settings.border_radius}px` }}
                  className="mr-2"
                >
                  Botón de ejemplo
                </Button>
                <div 
                  className="p-3 bg-card border"
                  style={{ borderRadius: `${settings.border_radius}px` }}
                >
                  Tarjeta de ejemplo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSS Personalizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>CSS Personalizado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="custom_css">CSS Personalizado</Label>
              <Textarea
                id="custom_css"
                value={settings.custom_css || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, custom_css: e.target.value }))}
                placeholder={`/* Agrega tu CSS personalizado aquí */
.custom-button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 10px;
}

.highlight-text {
  color: #ff6b6b;
  font-weight: bold;
}`}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Escribe CSS personalizado para estilos avanzados. Ten cuidado de no romper el diseño existente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 sticky bottom-4">
          <Button 
            variant="outline" 
            onClick={resetToDefaults} 
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar por defecto</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={previewChanges} 
            className="flex items-center space-x-2"
          >
            <Palette className="w-4 h-4" />
            <span>Vista previa</span>
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold px-8 py-4 text-lg shadow-lg flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Guardando...' : 'Guardar Diseño'}</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDesign;