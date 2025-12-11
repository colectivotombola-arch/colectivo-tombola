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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="h-7 px-2 text-xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">Volver</span>
                </Button>
              )}
              
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-primary text-primary hidden md:flex text-[10px] h-5">
                {user?.email}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut} 
                className="h-7 px-2 text-xs"
              >
                <LogOut className="w-3 h-3" />
                <span className="ml-1">Salir</span>
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