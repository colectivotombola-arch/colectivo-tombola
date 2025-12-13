import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

  const mainPrize = prizeDisplays[0] || (activeRaffle ? {
    id: 'raffle-main',
    title: activeRaffle.title || 'Rifa Activa',
    subtitle: activeRaffle.description || '',
    image_url: activeRaffle.prize_image || '/placeholder.svg',
    position: 1
  } : null);

  const pricePerNumber = settings?.price_per_number ?? activeRaffle?.price_per_number ?? '1.50';

  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] lg:min-h-[80vh] flex items-center bg-gradient-to-br from-background via-card to-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.3),transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Activity Badge */}
        <div className="text-center mb-4 sm:mb-6">
          <span className="inline-block bg-primary/90 text-primary-foreground px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base font-bold">
            {settings?.activity_title || 'ACTIVIDAD #1'}
          </span>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left: Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground mb-3 sm:mb-4 leading-tight">
              ¡GÁNATE UN{' '}
              <span className="text-primary">
                {mainPrize?.title || 'VEHÍCULO'}
              </span>!
            </h1>
            
            {mainPrize?.subtitle && (
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                {mainPrize.subtitle}
              </p>
            )}

            {/* Price Badge */}
            <div className="inline-block bg-card border border-primary/30 rounded-xl p-3 sm:p-4 mb-6">
              <p className="text-muted-foreground text-xs sm:text-sm">Por solo</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">
                ${pricePerNumber}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">cada número</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to="/comprar">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base sm:text-lg px-8 py-4 sm:py-6 shadow-lg hover:shadow-aqua transition-all"
                >
                  COMPRAR AHORA
                </Button>
              </Link>
              <Link to="/detalles">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-base sm:text-lg px-8 py-4 sm:py-6"
                >
                  VER DETALLES
                </Button>
              </Link>
            </div>

            {/* Progress Bar (Mobile) */}
            {activeRaffle && (
              <div className="mt-6 lg:hidden">
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progreso de venta</span>
                    <span className="text-primary font-bold">
                      {activeRaffle.numbers_sold || 0}/{activeRaffle.total_numbers || 0}
                    </span>
                  </div>
                  <Progress value={activeRaffle.sold_percentage || 0} className="h-2" />
                  <p className="text-center mt-1">
                    <span className="text-lg font-bold text-primary">
                      {(activeRaffle.sold_percentage || 0).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">vendido</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Prize Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75" />
              
              {/* Prize Image Container */}
              <div className="relative bg-gradient-to-br from-card to-muted/20 rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
                <img 
                  src={mainPrize?.image_url || '/placeholder.svg'} 
                  alt={mainPrize?.title || 'Premio Principal'}
                  className="w-full aspect-[4/3] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                
                {/* Prize Label */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span className="bg-primary text-primary-foreground px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold">
                    PRIMERA SUERTE
                  </span>
                </div>

                {/* Prize Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg sm:text-xl">{mainPrize?.title}</h3>
                  {mainPrize?.subtitle && (
                    <p className="text-white/80 text-sm">{mainPrize.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Additional Prizes Thumbnails */}
              {prizeDisplays.length > 1 && (
                <div className="flex gap-2 mt-3 justify-center">
                  {prizeDisplays.slice(1, 4).map((prize, index) => (
                    <div 
                      key={prize.id}
                      className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border border-primary/20 bg-card"
                    >
                      <img 
                        src={prize.image_url || '/placeholder.svg'} 
                        alt={prize.title}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                  {prizeDisplays.length > 4 && (
                    <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">+{prizeDisplays.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar (Desktop) */}
        {activeRaffle && (
          <div className="hidden lg:block max-w-4xl mx-auto mt-8">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {activeRaffle.total_numbers ? (activeRaffle.total_numbers - (activeRaffle.numbers_sold || 0)) : 0}
                  </p>
                  <p className="text-muted-foreground text-xs">Números Disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">${pricePerNumber}</p>
                  <p className="text-muted-foreground text-xs">Por Número</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{prizeDisplays.length || 1}</p>
                  <p className="text-muted-foreground text-xs">Premios</p>
                </div>
                <div className="col-span-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="text-primary font-bold">{(activeRaffle.sold_percentage || 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={activeRaffle.sold_percentage || 0} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;