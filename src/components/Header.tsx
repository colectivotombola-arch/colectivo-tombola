import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { SiteSettings } from "@/lib/supabase";
import logoImage from "@/assets/logo-colectivo-tombola-new.png";
import userLogo1 from "@/assets/user-logo-1.png";
import userLogo2 from "@/assets/user-logo-2.png";

interface HeaderProps {
  settings?: Partial<SiteSettings> | null;
}

const Header = ({ settings }: HeaderProps) => {
  // Use custom logo from settings or fallback to default
  const logoToUse = settings?.logo_url || logoImage;
  
  return (
    <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/20">
      <div className="mobile-container">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={logoToUse} 
              alt="Colectivo Tombola" 
              className="h-6 w-auto sm:h-8 lg:h-10 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = logoImage;
              }}
            />
            <div className="hidden sm:block">
              <h1 className="responsive-subtitle font-bold text-white">
                <span className="text-primary">{settings?.site_name?.split(' ')[0] || 'COLECTIVO'}</span>
                <span className="text-white ml-2">{settings?.site_name?.split(' ')[1] || 'TOMBOLA'}</span>
              </h1>
              <p className="mobile-body text-gray-400">{settings?.site_tagline || 'Cumpliendo sueños'}</p>
            </div>
          </Link>

          {/* Nueva Actividad Badge */}
          <div className="hidden md:block">
            <div className="bg-primary px-3 py-1 sm:px-4 sm:py-2 rounded-full">
              <span className="text-black font-bold mobile-body">¡NUEVA ACTIVIDAD!</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center mobile-gap">
            <Link 
              to="/comprar" 
              className="text-white hover:text-primary transition-colors font-medium mobile-body"
            >
              COMPRAR
            </Link>
            <Link 
              to="/consultar" 
              className="text-white hover:text-primary transition-colors font-medium mobile-body"
            >
              CONSULTAR
            </Link>
            <Link 
              to="/detalles" 
              className="text-white hover:text-primary transition-colors font-medium mobile-body"
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