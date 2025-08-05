import { SiteSettings } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface HeaderProps {
  settings: SiteSettings | null;
}

export const Header = ({ settings }: HeaderProps) => {
  return (
    <header className="bg-black/95 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {settings?.site_logo && (
              <img 
                src={settings.site_logo} 
                alt="Logo" 
                className="h-10 w-auto"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                <span className="text-primary">
                  {settings?.site_name || 'TOMBOLA'}
                </span>
                <span className="text-white ml-2">PREMIUM</span>
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
            <Link 
              to="/admin" 
              className="text-gray-400 hover:text-primary transition-colors text-sm"
            >
              ADMIN
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};