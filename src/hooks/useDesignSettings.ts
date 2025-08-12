import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DesignSettings {
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  font_size?: string;
  custom_css?: string;
}

export const useDesignSettings = () => {
  const [settings, setSettings] = useState<DesignSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDesignSettings();
  }, []);

  const loadDesignSettings = async () => {
    try {
      const { data } = await supabase
        .from('design_settings')
        .select('*')
        .single();
      
      if (data) {
        setSettings(data);
        applyDesignSettings(data);
      }
    } catch (error) {
      console.error('Error loading design settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyDesignSettings = (designSettings: DesignSettings) => {
    const root = document.documentElement;
    
    if (designSettings.primary_color) {
      // Convert hex to HSL for CSS variables
      const hsl = hexToHsl(designSettings.primary_color);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--aqua-glow', hsl);
      root.style.setProperty('--accent', hsl);
    }
    
    if (designSettings.secondary_color) {
      const hsl = hexToHsl(designSettings.secondary_color);
      root.style.setProperty('--secondary', hsl);
    }
    
    if (designSettings.font_family) {
      root.style.setProperty('--font-family', designSettings.font_family);
      document.body.style.fontFamily = designSettings.font_family;
    }
    
    if (designSettings.font_size) {
      root.style.setProperty('--font-size', designSettings.font_size);
      document.body.style.fontSize = designSettings.font_size;
    }
    
    if (designSettings.custom_css) {
      // Apply custom CSS
      let styleElement = document.getElementById('custom-design-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-design-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = designSettings.custom_css;
    }
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return { settings, loading, applyDesignSettings };
};