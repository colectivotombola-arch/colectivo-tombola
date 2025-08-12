import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export const AdminLayout = ({ children, title, subtitle, showBackButton = true }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/?adminSuccess=true');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-1 sm:space-x-2 mr-2"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>
              )}
              
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <div>
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="outline" className="border-primary text-primary hidden md:flex text-xs">
                {user?.email}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut} 
                className="flex items-center space-x-1 text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
};