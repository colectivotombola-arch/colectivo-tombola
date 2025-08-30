import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import heroBackground from '@/assets/logo-background-1.png';
import toyotaFortuner from "/public/lovable-uploads/a070bca1-29cb-463b-bee8-960692557b67.png";
import chevroletOnix from "/public/lovable-uploads/40dd58e7-1558-43d2-84a8-c2a6176de594.png";
import { Link } from 'react-router-dom';
import { supabase, rafflesAPI, type SiteSettings, type Raffle } from '@/lib/supabase';

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
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);

  useEffect(() => {
    loadPrizeDisplays();
    loadActiveRaffle();
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

  const loadActiveRaffle = async () => {
    try {
      const raffle = await rafflesAPI.getActive();
      setActiveRaffle(raffle);
    } catch (error) {
      console.error('Error loading active raffle:', error);
    }
  };

  // Solo mostrar contenido si hay datos de la base de datos o si hay rifa activa
  const displaysToShow = prizeDisplays.length > 0 ? prizeDisplays : (activeRaffle ? [{
    id: 'raffle-main',
    title: activeRaffle.title || 'Rifa Activa',
    subtitle: activeRaffle.description || '',
    image_url: activeRaffle.prize_image || '/placeholder.svg',
    position: 1
  }] : []);

  return (
    <section className="relative hero-background mobile-section">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt="Hero background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80"></div>
      </div>
      
      <div className="mobile-container text-center relative z-10">
        {/* Actividad Badge - Now Editable - Moved higher up and centered */}
        <div className="absolute top-1 sm:top-2 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-primary/90 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl">
            <span className="text-primary-foreground font-bold mobile-text sm:text-lg">
              {settings?.activity_title || 'ACTIVIDAD #1'}
            </span>
          </div>
        </div>

        {/* Imagen Principal Hero */}
        <div className="relative max-w-6xl mx-auto mb-6 sm:mb-12">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
              <div className="bg-primary text-black px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-center">
                <div className="mobile-body font-medium">POR SÓLO</div>
                <div className="text-xl sm:text-3xl font-black">${settings?.price_per_number ?? activeRaffle?.price_per_number ?? '1.50'}</div>
                <div className="mobile-body font-medium">CADA NÚMERO</div>
              </div>
            </div>

            {/* Imagen de los premios dinámicos */}
            <div className="relative aspect-video bg-gradient-to-br from-background/20 to-card/20 p-2 sm:p-4 lg:p-8" style={{backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'}}>
              <div className={`mobile-grid h-full ${
                displaysToShow.length === 1 ? 'grid-cols-1' :
                displaysToShow.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                displaysToShow.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                displaysToShow.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}>
                {displaysToShow.map((display, index) => {
                  const suerteTitles = ['PRIMERA SUERTE', 'SEGUNDA SUERTE', 'TERCERA SUERTE', 'CUARTA SUERTE', 'QUINTA SUERTE'];
                  return (
                    <div key={display.id} className="relative">
                      <div className="absolute top-4 sm:top-10 md:top-14 left-1 sm:left-2 z-20">
                        <div className="bg-primary text-primary-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded mobile-body font-bold">
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
                        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-foreground bg-background/90 backdrop-blur-sm rounded p-1 sm:p-2">
                          <h4 className="mobile-body sm:text-lg lg:text-xl font-bold text-primary">{display.title}</h4>
                          {display.subtitle && <p className="mobile-body text-foreground">{display.subtitle}</p>}
                        </div>
                    </div>
                  );
                })}
              </div>

              {/* Efectos visuales */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Texto central dinámico - Título de la rifa activa */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <h3 className="text-4xl md:text-6xl font-black text-white mb-2">
                  {activeRaffle?.title?.split(' ')[0] || 'GÁNATE'}
                </h3>
                {prizeDisplays.length > 0 ? (
                  prizeDisplays.map((display, index) => (
                    <div key={display.id}>
                      <div className="text-2xl md:text-4xl lg:text-5xl font-black text-primary">
                        {display.title}
                      </div>
                      {display.subtitle && (
                        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{display.subtitle}</div>
                      )}
                      {index < prizeDisplays.length - 1 && (
                        <div className="text-2xl md:text-4xl font-black text-white">+</div>
                      )}
                    </div>
                  ))
                ) : (
                  activeRaffle && (
                    <div className="text-2xl md:text-4xl lg:text-5xl font-black text-primary">
                      {activeRaffle.title}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row mobile-gap justify-center items-center max-w-md mx-auto">
          <Link to="/comprar" className="w-full">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold mobile-text px-4 py-3 sm:px-8 sm:py-4"
            >
              COMPRAR NÚMEROS
            </Button>
          </Link>
          <Link to="/detalles" className="w-full">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-black font-bold mobile-text px-4 py-3 sm:px-8 sm:py-4"
            >
              VER DETALLES
            </Button>
          </Link>
        </div>

        {/* Información adicional - Completamente dinámica */}
        <div className="mt-8 sm:mt-12">
          {/* Barra de progreso en línea con datos reales */}
          {activeRaffle && (
            <div className="max-w-lg mx-auto mb-8 bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground font-medium">Progreso de venta</span>
                <span className="text-primary font-bold">{activeRaffle.numbers_sold || 0}/{activeRaffle.total_numbers || 0}</span>
              </div>
              <Progress value={activeRaffle.sold_percentage || 0} className="h-2 mb-2" />
              <div className="text-center">
                <span className="text-lg font-bold text-primary">{(activeRaffle.sold_percentage || 0).toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground ml-1">vendido</span>
              </div>
            </div>
          )}
          
          <div className="mobile-grid max-w-4xl mx-auto">
            <div className="text-center">
              <div className="responsive-subtitle font-bold text-primary mb-2">
                {activeRaffle?.total_numbers ? (activeRaffle.total_numbers - (activeRaffle.numbers_sold || 0)) : 'N/A'}
              </div>
              <div className="text-gray-600 mobile-text">Números Disponibles</div>
            </div>
            <div className="text-center">
              <div className="responsive-subtitle font-bold text-primary mb-2">
                ${activeRaffle?.price_per_number ?? settings?.price_per_number ?? 'N/A'}
              </div>
              <div className="text-gray-600 mobile-text">Cada Número</div>
            </div>
            <div className="text-center">
              <div className="responsive-subtitle font-bold text-primary mb-2">
                {prizeDisplays.length > 0 ? prizeDisplays.length : 'N/A'}
              </div>
              <div className="text-gray-600 mobile-text">Premios Principales</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;