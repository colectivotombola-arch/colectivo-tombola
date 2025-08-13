import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Car, 
  Settings, 
  ImageIcon, 
  LogOut,
  Plus,
  Eye,
  Trophy,
  Video
} from 'lucide-react';


const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    activeRaffles: 0,
    totalNumbers: 0,
    soldNumbers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Mock data for now - this will be replaced with real Supabase data later
      setStats({
        activeRaffles: 1,
        totalNumbers: 1000,
        soldNumbers: 450,
        totalRevenue: 22500
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { title: 'Actividades Activas', value: '1', icon: Car, color: 'bg-primary' },
    { title: 'Total Premios', value: '2', icon: Car, color: 'bg-secondary' },
    { title: 'Imágenes Subidas', value: '8', icon: ImageIcon, color: 'bg-accent' },
  ];

  const quickActions = [
    { title: 'Gestionar Rifas', description: 'Ver y administrar rifas activas', icon: Car, href: '/admin/raffles' },
    { title: 'Ver Números', description: 'Consultar números vendidos', icon: Eye, href: '/admin/sold-numbers' },
    { title: 'Confirmaciones', description: 'Gestionar compras pendientes', icon: Eye, href: '/admin/confirmations' },
    { title: 'Premios Instant.', description: 'Configurar números bendecidos', icon: Car, href: '/admin/instant-prizes' },
    { title: 'Paquetes', description: 'Gestionar paquetes de boletos', icon: Plus, href: '/admin/packages' },
    { title: 'Pantallas Premios', description: 'Configurar suertes dinámicas', icon: Trophy, href: '/admin/prize-displays' },
    { title: 'Galería Videos', description: 'TikTok e Instagram', icon: Video, href: '/admin/media-gallery' },
    { title: 'Galería Fotos', description: 'Fotos generales del sitio', icon: ImageIcon, href: '/admin/photo-gallery' },
    { title: 'Galería Premios', description: 'Imágenes de premios', icon: ImageIcon, href: '/admin/gallery' },
    { title: 'Diseño', description: 'Personalizar apariencia', icon: Settings, href: '/admin/design' },
    { title: 'Configuración', description: 'Ajustes del sitio web', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Panel Admin</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Proyectos Flores</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="outline" className="border-primary text-primary hidden sm:flex text-xs">
                {user?.email}
              </Badge>
              <Button variant="outline" onClick={signOut} className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
            ¡Bienvenido de vuelta! 👋
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona tu sitio de rifas desde aquí. Puedes crear nuevas actividades, subir imágenes y configurar todo.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-aqua transition-all duration-300 border-primary/20"
                  onClick={() => window.location.href = action.href}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <action.icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2 sm:mb-4" />
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Actividad #33 creada</p>
                  <p className="text-sm text-muted-foreground">Toyota Fortuner 4x4 + Chevrolet Onix Turbo RS</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">Activa</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Configuración del sitio actualizada</p>
                  <p className="text-sm text-muted-foreground">Logo y colores principales</p>
                </div>
                <Badge variant="outline">Completado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;