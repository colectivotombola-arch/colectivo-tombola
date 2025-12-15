import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GallerySectionProps {
  settings?: { price_per_number?: string } | null;
}

const GallerySection = ({ settings }: GallerySectionProps) => {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    loadGalleryContent();
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

  const allImages = [
    ...prizes.map((p) => ({ url: p.image_url, name: p.name, description: p.description })).filter(i => i.url),
    ...photos.map((p) => ({ url: p.image_url, name: p.title, description: p.description })).filter(i => i.url)
  ];

  // Don't render if no content
  if (allImages.length === 0 && prizes.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-8 bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-foreground mb-4 sm:mb-6">
          🎁 Galería de Premios
        </h2>
        
        {/* Prize Images Grid - Clean and simple */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <p className="text-white font-semibold text-xs sm:text-sm truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-white/80 text-[10px] sm:text-xs truncate">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;