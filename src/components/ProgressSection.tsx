import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { SiteSettings } from '@/lib/supabase';
import { Instagram, Twitter, Facebook, Trophy, Eye } from 'lucide-react';
const PROGRESS_BG = '/lovable-uploads/a070bca1-29cb-463b-bee8-960692557b67.png';
import progressLogo from '@/assets/logo-colectivo-tombola.png';

interface ProgressSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const ProgressSection = ({ settings }: ProgressSectionProps) => {
  const [raffle, setRaffle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { rafflesAPI } = await import('@/lib/supabase');
        const data = await rafflesAPI.getActive();
        if (mounted) setRaffle(data);
      } catch (e) {
        console.error('Error loading progress:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <section className="py-8 relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={PROGRESS_BG}
          alt="Progress background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <Card className="p-6 bg-gradient-to-br from-background/95 to-card/95 border-primary/20 backdrop-blur-sm relative overflow-hidden">
            {/* Logo del Colectivo Tómbola dentro del card */}
             <div className="absolute inset-0 opacity-10 bg-no-repeat bg-center bg-contain pointer-events-none" 
                 style={{backgroundImage: `url(${settings?.logo_url || progressLogo})`}}></div>
            <div className="relative z-10">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-primary mr-2" />
                  <h3 className="text-xl font-bold text-foreground">Progreso de Ventas</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Cargando...' : `¡Ya se han vendido ${raffle?.numbers_sold || 0} números de ${raffle?.total_numbers || 0}!`}
                </p>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Números vendidos</span>
                  <span className="font-medium text-foreground">{raffle?.numbers_sold || 0}/{raffle?.total_numbers || 0}</span>
                </div>
                <Progress value={raffle?.sold_percentage || 0} className="h-3" />
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-primary">{(raffle?.sold_percentage || 0).toFixed(2)}%</span>
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
            
            {/* Social Media Links - Now Editable */}
            {settings?.social_media && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Síguenos en:</p>
                <div className="flex justify-center gap-4">
                  {settings.social_media.instagram && (
                    <a 
                      href={settings.social_media.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {settings.social_media.twitter && (
                    <a 
                      href={settings.social_media.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {settings.social_media.facebook && (
                    <a 
                      href={settings.social_media.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProgressSection;