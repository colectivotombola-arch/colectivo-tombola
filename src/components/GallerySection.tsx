import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GallerySection = () => {
  // Placeholder images for the gallery
  const galleryImages = [
    { id: 1, alt: "Toyota Fortuner exterior view" },
    { id: 2, alt: "Chevrolet Onix front view" },
    { id: 3, alt: "Toyota Fortuner interior" },
    { id: 4, alt: "Chevrolet Onix interior" },
    { id: 5, alt: "Toyota Fortuner side view" },
    { id: 6, alt: "Chevrolet Onix rear view" },
    { id: 7, alt: "Toyota Fortuner engine" },
    { id: 8, alt: "Chevrolet Onix dashboard" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-primary text-primary-foreground text-lg px-6 py-2 mb-4">
            GALERÍA DE PREMIOS
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Conoce tus próximos vehículos
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora cada detalle de los increíbles premios que puedes ganar en nuestra actividad #33
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <Card key={image.id} className="group overflow-hidden cursor-pointer hover:shadow-aqua transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-muted via-muted to-primary/20 flex items-center justify-center relative">
                <div className="w-full h-full bg-muted/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-center text-muted-foreground">
                    <div className="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-xs font-medium">{image.alt}</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Card>
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
      </div>
    </section>
  );
};

export default GallerySection;