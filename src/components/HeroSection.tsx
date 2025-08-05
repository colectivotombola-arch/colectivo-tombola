import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-b from-gray-100 to-white py-20">
      <div className="container mx-auto px-4 text-center">
        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl font-bold text-black mb-4">
          <span className="block">JUEGA</span>
        </h1>
        
        {/* Subtítulo de Actividad */}
        <h2 className="text-2xl md:text-4xl font-bold text-black mb-8">
          TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km
        </h2>
        
        <h3 className="text-xl md:text-2xl font-semibold text-black mb-12">
          ACTIVIDAD #33
        </h3>

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
                <div className="text-3xl font-black">$1.50</div>
                <div className="text-sm font-medium">CADA NÚMERO</div>
              </div>
            </div>

            {/* Imagen de los autos */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* Toyota Fortuner */}
                <div className="relative">
                  <div className="absolute top-0 left-0 z-20">
                    <div className="bg-primary text-black px-3 py-1 rounded text-sm font-bold">
                      PRIMERA SUERTE
                    </div>
                  </div>
                  <img 
                    src="/src/assets/toyota-fortuner.jpg" 
                    alt="Toyota Fortuner 4x4"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-2xl font-bold text-primary">TOYOTA FORTUNER 4X4</h4>
                  </div>
                </div>

                {/* Chevrolet Onix */}
                <div className="relative">
                  <div className="absolute top-0 left-0 z-20">
                    <div className="bg-primary text-black px-3 py-1 rounded text-sm font-bold">
                      SEGUNDA SUERTE
                    </div>
                  </div>
                  <img 
                    src="/src/assets/chevrolet-onix.jpg" 
                    alt="Chevrolet Onix Turbo RS"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="text-2xl font-bold text-primary">CHEVROLET ONIX TURBO</h4>
                    <p className="text-lg">0km</p>
                  </div>
                </div>
              </div>

              {/* Efectos visuales */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Texto central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <h3 className="text-4xl md:text-6xl font-black text-white mb-2">
                  GÁNATE
                </h3>
                <div className="text-3xl md:text-5xl font-black text-primary">
                  TOYOTA FORTUNER 4X4
                </div>
                <div className="text-2xl md:text-4xl font-black text-white">+</div>
                <div className="text-3xl md:text-5xl font-black text-primary">
                  CHEVROLET ONIX TURBO
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">0km</div>
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
            <div className="text-3xl font-bold text-primary mb-2">$1.50</div>
            <div className="text-gray-600">Cada Número</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">2</div>
            <div className="text-gray-600">Premios Principales</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;