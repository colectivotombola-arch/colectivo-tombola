import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { SiteSettings } from "@/lib/supabase";

interface HeaderProps {
  settings?: Partial<SiteSettings> | null;
}

const Header = ({ settings }: HeaderProps) => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/20 transition-all duration-300"
      style={{
        backgroundImage: `url('/lovable-uploads/40dd58e7-1558-43d2-84a8-c2a6176de594.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm"></div>
      <div className="mobile-container relative z-10">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={settings?.logo_url || '/lovable-uploads/2bd5468e-8deb-4143-b094-25a54b2a10d7.png'} 
              alt="Colectivo Tombola" 
              className="h-6 w-auto sm:h-8 lg:h-10 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/lovable-uploads/2bd5468e-8deb-4143-b094-25a54b2a10d7.png';
              }}
            />
            <div className="hidden sm:block">
              <h1 className="responsive-subtitle font-bold text-foreground">
                <span className="text-primary">{settings?.site_name?.split(' ')[0] || 'COLECTIVO'}</span>
                <span className="text-foreground ml-2">{settings?.site_name?.split(' ')[1] || 'TOMBOLA'}</span>
              </h1>
              <p className="mobile-body text-muted-foreground">{settings?.site_tagline || 'Cumpliendo sueños'}</p>
            </div>
          </Link>

          {/* Nueva Actividad Badge */}
          <div className="hidden md:block">
            <div className="bg-primary px-3 py-1 sm:px-4 sm:py-2 rounded-full">
              <span className="text-primary-foreground font-bold mobile-body">¡NUEVA ACTIVIDAD!</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center mobile-gap">
            <Link 
              to="/comprar" 
              className="text-foreground hover:text-primary transition-colors font-medium mobile-body"
            >
              COMPRAR
            </Link>
            <Link 
              to="/consultar" 
              className="text-foreground hover:text-primary transition-colors font-medium mobile-body"
            >
              CONSULTAR
            </Link>
            <Link 
              to="/detalles" 
              className="text-foreground hover:text-primary transition-colors font-medium mobile-body"
            >
              DETALLES
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;