import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { rafflesAPI } from '@/lib/supabase';

interface GallerySectionProps {
  settings?: { price_per_number?: string } | null;
}

const GallerySection = ({ settings }: GallerySectionProps) => {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [rafflePrice, setRafflePrice] = useState<number | string | null>(null);

  useEffect(() => {
    loadGalleryContent();
    loadActiveRafflePrice();
  }, []);

  const loadGalleryContent = async () => {
    try {
      const [prizesRes, photosRes] = await Promise.all([
        supabase
          .from('prizes')
          .select('*')
          .eq('is_active', true)
          .order('position'),
        supabase
          .from('photo_gallery')
          .select('*')
          .eq('is_active', true)
          .order('position')
      ]);

      setPrizes(prizesRes.data || []);
      setPhotos(photosRes.data || []);
    } catch (error) {
      console.error('Error loading gallery content:', error);
    }
  };

  const loadActiveRafflePrice = async () => {
    try {
      const active = await rafflesAPI.getActive();
      setRafflePrice(active?.price_per_number ?? null);
    } catch (e) {
      console.error('Error loading raffle price:', e);
    }
  };

  const allImages = [
    ...prizes.map((p) => ({ url: p.image_url, name: p.name, description: p.description })).filter(i => i.url),
    ...photos.map((p) => ({ url: p.image_url, name: p.title, description: p.description })).filter(i => i.url)
  ];

  // Don't render if no content
  if (allImages.length === 0 && prizes.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-10 lg:py-12 bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8">
          🎁 Galería de Premios
        </h2>
        
        {/* Prize Images Grid */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {allImages.map((item, index) => (
              <div 
                key={index} 
                className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <img 
                  src={item.url} 
                  alt={item.name || `Premio ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-white/80 text-xs truncate">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Card className="text-center p-4 sm:p-6 bg-card border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
              {prizes.length || 2}
            </div>
            <div className="text-sm font-semibold text-foreground">Vehículos</div>
            <div className="text-muted-foreground text-xs">Premios principales</div>
          </Card>
          
          <Card className="text-center p-4 sm:p-6 bg-card border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
              ${rafflePrice ?? (settings?.price_per_number || "1.50")}
            </div>
            <div className="text-sm font-semibold text-foreground">Por número</div>
            <div className="text-muted-foreground text-xs">Precio accesible</div>
          </Card>
          
          <Card className="text-center p-4 sm:p-6 bg-card border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">0km</div>
            <div className="text-sm font-semibold text-foreground">Nuevos</div>
            <div className="text-muted-foreground text-xs">Directos de agencia</div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;