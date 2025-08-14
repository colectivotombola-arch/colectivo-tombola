import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

interface GallerySectionProps {
  settings?: { price_per_number?: string } | null;
}

const GallerySection = ({ settings }: GallerySectionProps) => {
  const [prizes, setPrizes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [media, setMedia] = useState([]);

  useEffect(() => {
    loadGalleryContent();
  }, []);

  const loadGalleryContent = async () => {
    try {
      // Load prizes
      const { data: prizesData } = await supabase
        .from('prizes')
        .select('*')
        .order('position');
      
      // Load photo gallery
      const { data: photosData } = await supabase
        .from('photo_gallery')
        .select('*')
        .eq('is_active', true)
        .order('position');
      
      // Load media gallery
      const { data: mediaData } = await supabase
        .from('media_gallery')
        .select('*')
        .eq('is_active', true)
        .order('position');

      setPrizes(prizesData || []);
      setPhotos(photosData || []);
      setMedia(mediaData || []);
    } catch (error) {
      console.error('Error loading gallery content:', error);
    }
  };

  // Combine all images for the gallery display
  const allImages = [
    ...(prizes as any[]).map((p: any) => p.image_url).filter(Boolean),
    ...(photos as any[]).map((p: any) => p.image_url).filter(Boolean)
  ];

  // Fallback to default images if no content is configured
  const galleryImages = allImages.length > 0 ? allImages : [
    "/src/assets/toyota-fortuner.jpg",
    "/src/assets/chevrolet-onix.jpg",
    "/src/assets/toyota-fortuner.jpg", 
    "/src/assets/chevrolet-onix.jpg"
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground mb-8 sm:mb-12">
          Galería de Premios
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {galleryImages.map((image, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg">
              <img 
                src={image} 
                alt={`Premio ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <Card className="text-center p-8 bg-card border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-xl font-semibold text-foreground mb-1">Vehículos</div>
            <div className="text-muted-foreground">Premios principales</div>
          </Card>
          
          <Card className="text-center p-8 bg-card border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">
              ${settings?.price_per_number || "1.50"}
            </div>
            <div className="text-xl font-semibold text-foreground mb-1">Por número</div>
            <div className="text-muted-foreground">Precio accesible</div>
          </Card>
          
          <Card className="text-center p-8 bg-card border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">0km</div>
            <div className="text-xl font-semibold text-foreground mb-1">Vehículos nuevos</div>
            <div className="text-muted-foreground">Directos de agencia</div>
          </Card>
        </div>

        {/* Videos y medios configurados */}
        {media.length > 0 && (
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-black mb-8">
              Videos y Contenido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(media as any[]).map((item: any, index: number) => (
                <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                  {item.media_type === 'video' ? (
                    <div className="aspect-square bg-black flex items-center justify-center">
                      <div className="text-white text-center">
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm">Video: {item.media_url}</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.media_url} 
                      alt={item.title}
                      className="w-full aspect-square object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;