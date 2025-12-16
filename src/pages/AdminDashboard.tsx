import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Settings, 
  ImageIcon, 
  Eye,
  Trophy,
  Video,
  DollarSign,
  Users,
  Package,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { rafflesAPI } from '@/lib/supabase';
import { AdminLayout } from '@/components/AdminLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeRaffles: 0,
    totalNumbers: 0,
    soldNumbers: 0,
    totalRevenue: 0,
    pricePerNumber: 0
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const raffle = await rafflesAPI.getActive();
      if (raffle) {
        const revenue = (raffle.numbers_sold || 0) * (raffle.price_per_number || 0);
        setStats({
          activeRaffles: 1,
          totalNumbers: raffle.total_numbers || 0,
          soldNumbers: raffle.numbers_sold || 0,
          totalRevenue: revenue,
          pricePerNumber: raffle.price_per_number || 0
        });
      } else {
        setStats({ activeRaffles: 0, totalNumbers: 0, soldNumbers: 0, totalRevenue: 0, pricePerNumber: 0 });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { title: 'Actividades Activas', value: String(stats.activeRaffles), icon: Car, color: 'bg-primary' },
    { title: 'Total Números', value: String(stats.totalNumbers.toLocaleString()), icon: Package, color: 'bg-secondary' },
    { title: 'Vendidos', value: String(stats.soldNumbers.toLocaleString()), icon: Users, color: 'bg-accent' },
    { title: 'Recaudación Estimada', value: `$${stats.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-green-600' },
  ];

  const quickActions = [
    { title: 'Gestionar Rifas', description: 'Crear y editar rifas activas', icon: Car, href: '/admin/raffles' },
    { title: 'Paquetes/Combos', description: 'Configurar precios y cantidades', icon: Package, href: '/admin/packages' },
    { title: 'Números Vendidos', description: 'Consultar ventas y exportar', icon: Users, href: '/admin/sold-numbers' },
    { title: 'Confirmaciones', description: 'Aprobar pagos pendientes', icon: CheckCircle, href: '/admin/confirmations' },
    { title: 'Galería de Premios', description: 'Imágenes de premios en web', icon: ImageIcon, href: '/admin/gallery' },
    { title: 'Galería de Videos', description: 'Reels de TikTok/Instagram', icon: Video, href: '/admin/media-gallery' },
    { title: 'Pantallas de Premio', description: 'Hero y suertes del sorteo', icon: Trophy, href: '/admin/prize-displays' },
    { title: 'Diseño', description: 'Personalizar apariencia', icon: Settings, href: '/admin/design' },
    { title: 'Configuración', description: 'Pagos, redes y ajustes', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <AdminLayout 
      title="Panel Admin" 
      subtitle="Proyectos Flores"
      showBackButton={false}
    >

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.color} flex-shrink-0 ml-2`}>
                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-aqua transition-all duration-300 border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => navigate(action.href)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(action.href)}
                >
                  <CardContent className="p-3 sm:p-4 text-center">
                    <action.icon className="w-6 h-6 sm:w-10 sm:h-10 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-1 text-xs sm:text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Rifa activa cargada</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.soldNumbers} de {stats.totalNumbers} números vendidos ({stats.totalNumbers > 0 ? ((stats.soldNumbers / stats.totalNumbers) * 100).toFixed(1) : 0}%)
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">Activa</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">Recaudación actual</p>
                  <p className="text-sm text-muted-foreground">
                    ${stats.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })} (${stats.pricePerNumber} por número)
                  </p>
                </div>
                <Badge variant="outline">En progreso</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;