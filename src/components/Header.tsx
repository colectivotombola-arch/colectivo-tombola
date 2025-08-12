import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { SiteSettings } from "@/lib/supabase";
import logoImage from "@/assets/logo-colectivo-tombola.png";

interface HeaderProps {
  settings?: SiteSettings | null;
}

const Header = ({ settings }: HeaderProps) => {
  return (
    <header className="bg-black/95 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Colectivo Tombola" 
              className="h-8 w-auto sm:h-10 lg:h-12 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                <span className="text-primary">{settings?.site_name?.split(' ')[0] || 'COLECTIVO'}</span>
                <span className="text-white ml-2">{settings?.site_name?.split(' ')[1] || 'TOMBOLA'}</span>
              </h1>
              <p className="text-xs text-gray-400">Cumpliendo sueños</p>
            </div>
          </Link>

          {/* Nueva Actividad Badge */}
          <div className="hidden md:block">
            <div className="bg-primary px-4 py-2 rounded-full">
              <span className="text-black font-bold text-sm">¡NUEVA ACTIVIDAD!</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/comprar" 
              className="text-white hover:text-primary transition-colors font-medium"
            >
              COMPRAR
            </Link>
            <Link 
              to="/consultar" 
              className="text-white hover:text-primary transition-colors font-medium"
            >
              CONSULTAR
            </Link>
            <Link 
              to="/detalles" 
              className="text-white hover:text-primary transition-colors font-medium"
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