import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
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
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={settings?.logo_url || '/lovable-uploads/2bd5468e-8deb-4143-b094-25a54b2a10d7.png'} 
              alt="Colectivo Tombola" 
              className="h-5 w-auto sm:h-7 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/lovable-uploads/2bd5468e-8deb-4143-b094-25a54b2a10d7.png';
              }}
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground">
                <span className="text-primary">{settings?.site_name?.split(' ')[0] || 'COLECTIVO'}</span>
                <span className="text-foreground ml-1">{settings?.site_name?.split(' ')[1] || 'TOMBOLA'}</span>
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Home className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">INICIO</span>
              </Button>
            </Link>
            <Link to="/comprar">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                COMPRAR
              </Button>
            </Link>
            <Link to="/consultar">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                CONSULTAR
              </Button>
            </Link>
            <Link to="/detalles">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                DETALLES
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;