import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from "@/lib/supabase";

interface PrizeDisplay {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  position: number;
}

interface HeroSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const HeroSection = ({ settings }: HeroSectionProps) => {
  const [prizeDisplays, setPrizeDisplays] = useState<PrizeDisplay[]>([]);

  useEffect(() => {
    loadPrizeDisplays();
  }, []);

  const loadPrizeDisplays = async () => {
    try {
      const { data, error } = await supabase
        .from('prize_displays')
        .select('*')
        .eq('is_active', true)
        .order('position')
        .limit(5);
      
      if (error) throw error;
      setPrizeDisplays(data || []);
    } catch (error) {
      console.error('Error loading prize displays:', error);
    }
  };

  // Fallback to static content if no prize displays are configured
  const defaultPrizes = [
    {
      id: 'default-1',
      title: 'TOYOTA FORTUNER 4X4',
      subtitle: '',
      image_url: '/src/assets/toyota-fortuner.jpg',
      position: 1
    },
    {
      id: 'default-2', 
      title: 'CHEVROLET ONIX TURBO',
      subtitle: '0km',
      image_url: '/src/assets/chevrolet-onix.jpg',
      position: 2
    }
  ];

  const displaysToShow = prizeDisplays.length > 0 ? prizeDisplays : defaultPrizes;

  return (
    <section className="relative bg-gradient-to-b from-background to-card py-8 sm:py-12 lg:py-20">
      <div className="container mx-auto px-4 text-center">

        {/* Imagen Principal Hero */}
        <div className="relative max-w-6xl mx-auto mb-12">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Etiquetas de Premios */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-black font-bold text-lg">Actividad #33</span>
              </div>
            </div>
            
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-primary text-black px-6 py-3 rounded-2xl text-center">
                <div className="text-sm font-medium">POR SÓLO</div>
                <div className="text-3xl font-black">${settings?.price_per_number || '1.50'}</div>
                <div className="text-sm font-medium">CADA NÚMERO</div>
              </div>
            </div>

            {/* Imagen de los premios dinámicos */}
            <div className="relative aspect-video bg-gradient-to-br from-background to-card p-4 sm:p-6 lg:p-8">
              <div className={`grid gap-4 sm:gap-6 lg:gap-8 h-full ${
                displaysToShow.length === 1 ? 'grid-cols-1' :
                displaysToShow.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                displaysToShow.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                displaysToShow.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}>
                {displaysToShow.map((display, index) => {
                  const suerteTitles = ['PRIMERA SUERTE', 'SEGUNDA SUERTE', 'TERCERA SUERTE', 'CUARTA SUERTE', 'QUINTA SUERTE'];
                  return (
                    <div key={display.id} className="relative">
                      <div className="absolute top-2 left-2 z-20">
                        <div className="bg-primary text-primary-foreground px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-bold">
                          {suerteTitles[index] || `SUERTE ${index + 1}`}
                        </div>
                      </div>
                      <img 
                        src={display.image_url || '/placeholder.svg'} 
                        alt={display.title}
                        className="w-full h-full object-contain rounded-lg bg-muted/10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-foreground bg-background/80 backdrop-blur-sm rounded p-2">
                        <h4 className="text-sm sm:text-lg lg:text-xl font-bold text-primary">{display.title}</h4>
                        {display.subtitle && <p className="text-xs sm:text-sm lg:text-base">{display.subtitle}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Efectos visuales */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Texto central dinámico */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <h3 className="text-4xl md:text-6xl font-black text-white mb-2">
                  GÁNATE
                </h3>
                {displaysToShow.map((display, index) => (
                  <div key={display.id}>
                    <div className="text-2xl md:text-4xl lg:text-5xl font-black text-primary">
                      {display.title}
                    </div>
                    {display.subtitle && (
                      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{display.subtitle}</div>
                    )}
                    {index < displaysToShow.length - 1 && (
                      <div className="text-2xl md:text-4xl font-black text-white">+</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Link to="/comprar" className="w-full">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg px-8 py-4"
            >
              COMPRAR NÚMEROS
            </Button>
          </Link>
          <Link to="/detalles" className="w-full">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-black font-bold text-lg px-8 py-4"
            >
              VER DETALLES
            </Button>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">1000</div>
            <div className="text-gray-600">Números Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">${settings?.price_per_number || '1.50'}</div>
            <div className="text-gray-600">Cada Número</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{displaysToShow.length}</div>
            <div className="text-gray-600">Premios Principales</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;