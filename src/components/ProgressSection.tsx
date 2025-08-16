import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Trophy, Eye } from "lucide-react";
import { SiteSettings } from '@/lib/supabase';

interface ProgressSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const ProgressSection = ({ settings }: ProgressSectionProps) => {
  // Mock data - in a real app this would come from database
  const salesProgress = {
    sold: 450,
    total: 1000,
    percentage: 45
  };

  return (
    <section className="py-8 progress-background" style={{backgroundImage: 'url(/src/assets/logo-background-1.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'}}>
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-6 bg-gradient-to-br from-background/90 to-card/90 border-primary/20 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-primary mr-2" />
                <h3 className="text-xl font-bold text-foreground">Progreso de Ventas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                ¡Ya se han vendido {salesProgress.sold} números de {salesProgress.total}!
              </p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Números vendidos</span>
                <span className="font-medium text-foreground">{salesProgress.sold}/{salesProgress.total}</span>
              </div>
              <Progress value={salesProgress.percentage} className="h-3" />
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-primary">{salesProgress.percentage}%</span>
                <span className="text-sm text-muted-foreground ml-1">completado</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to="/comprar" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold">
                  COMPRAR NÚMEROS
                </Button>
              </Link>
              <Link to="/detalles">
                <Button variant="outline" size="icon" className="border-primary text-primary hover:bg-primary hover:text-black">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProgressSection;