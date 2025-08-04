import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import toyotaFortuner from "@/assets/toyota-fortuner.jpg";
import chevroletOnix from "@/assets/chevrolet-onix.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-background relative">
      {/* Nueva Actividad Badge */}
      <div className="absolute top-6 right-6 z-20">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold animate-glow">
          ¡NUEVA ACTIVIDAD!
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-foreground mb-4">
            <span className="text-primary">JUEGA</span>
          </h1>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km
          </h2>
          <h3 className="text-2xl font-bold text-primary">
            ACTIVIDAD #33
          </h3>
        </div>

        {/* Main Card with Cars */}
        <Card className="relative overflow-hidden bg-card border-primary/20 shadow-aqua-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10"></div>
          
          <div className="relative p-8">
            {/* Prize Section */}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Left Side - Text and Price */}
              <div className="lg:w-1/3 text-center lg:text-left">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-foreground mb-2">Actividad #33</div>
                  <div className="text-5xl font-black text-primary mb-4">GÁNATE</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    TOYOTA FORTUNER 4X4
                  </div>
                  <div className="text-lg text-muted-foreground mb-2">PRIMERA SUERTE</div>
                  <div className="text-lg font-bold text-foreground mb-4">+</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    CHEVROLET ONIX TURBO
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">0km</div>
                  <div className="text-lg text-muted-foreground">SEGUNDA SUERTE</div>
                </div>
                
                {/* Price Circle */}
                <div className="inline-block">
                  <div className="bg-primary text-primary-foreground rounded-full p-8 text-center shadow-aqua animate-glow">
                    <div className="text-sm font-bold mb-1">POR SÓLO</div>
                    <div className="text-5xl font-black">$1.50</div>
                    <div className="text-sm font-bold">CADA NÚMERO</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Car Images */}
              <div className="lg:w-2/3 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <img 
                      src={toyotaFortuner} 
                      alt="Toyota Fortuner 4x4" 
                      className="w-full h-auto rounded-lg shadow-aqua group-hover:shadow-aqua-lg transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="relative group">
                    <img 
                      src={chevroletOnix} 
                      alt="Chevrolet Onix Turbo RS" 
                      className="w-full h-auto rounded-lg shadow-aqua group-hover:shadow-aqua-lg transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/comprar">
                  <Button size="lg" className="bg-gradient-aqua hover:shadow-aqua-lg text-xl px-8 py-4 font-bold transition-all duration-300">
                    JUGAR AHORA
                  </Button>
                </Link>
                <Link to="/detalles">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xl px-8 py-4 font-bold">
                    VER DETALLES
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;