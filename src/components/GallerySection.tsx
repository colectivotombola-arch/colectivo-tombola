import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteSettings } from '@/lib/supabase';

interface GallerySectionProps {
  settings?: SiteSettings | null;
}

const GallerySection = ({ settings }: GallerySectionProps) => {
  // Imágenes de la galería
  const galleryImages = [
    "/src/assets/toyota-fortuner.jpg",
    "/src/assets/chevrolet-onix.jpg",
    "/src/assets/toyota-fortuner.jpg", 
    "/src/assets/chevrolet-onix.jpg",
    "/src/assets/toyota-fortuner.jpg",
    "/src/assets/chevrolet-onix.jpg",
    "/src/assets/toyota-fortuner.jpg",
    "/src/assets/chevrolet-onix.jpg",
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-black mb-12">
          Galería de Premios
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-card border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">2</div>
            <div className="text-xl font-semibold text-foreground mb-1">Vehículos</div>
            <div className="text-muted-foreground">Premios principales</div>
          </Card>
          
          <Card className="text-center p-8 bg-card border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">$1.50</div>
            <div className="text-xl font-semibold text-foreground mb-1">Por número</div>
            <div className="text-muted-foreground">Precio accesible</div>
          </Card>
          
          <Card className="text-center p-8 bg-card border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">0km</div>
            <div className="text-xl font-semibold text-foreground mb-1">Vehículos nuevos</div>
            <div className="text-muted-foreground">Directos de agencia</div>
          </Card>
        </div>

        {/* Video de Instagram si está configurado */}
        {settings?.instagram_video_url && (
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-black mb-8">
              Video de Instagram
            </h3>
            <div className="max-w-md mx-auto">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={`${settings.instagram_video_url}/embed`}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;