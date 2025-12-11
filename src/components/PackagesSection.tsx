import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase, rafflesAPI, type Raffle } from '@/lib/supabase';

interface Package {
  id: string;
  ticket_count: number;
  price_per_ticket: number;
  is_popular: boolean;
  display_order: number;
}

const PackagesSection = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const activeRaffle = await rafflesAPI.getActive();
      setRaffle(activeRaffle);
      
      if (activeRaffle) {
        const { data } = await supabase
          .from('raffle_packages')
          .select('*')
          .eq('raffle_id', activeRaffle.id)
          .order('display_order');
        
        setPackages(data || []);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !raffle || packages.length === 0) {
    return null;
  }

  return (
    <section className="py-4 sm:py-6 bg-card/30">
      <div className="mobile-container">
        <div className="text-center mb-4">
          <h2 className="text-lg sm:text-xl font-black text-foreground mb-1">
            ¡ADQUIERE TUS NÚMEROS!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Valor de la Unidad: <span className="text-primary font-bold">${raffle.price_per_number}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                pkg.is_popular 
                  ? 'ring-1 ring-primary shadow-md' 
                  : 'border-border'
              }`}
            >
              {pkg.is_popular && (
                <Badge className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-[9px] px-1 py-0 rounded-b-sm rounded-t-none">
                  ★ Popular ★
                </Badge>
              )}
              <CardContent className={`text-center p-2 ${pkg.is_popular ? 'pt-4' : 'pt-2'}`}>
                <div className="text-xs font-bold text-foreground mb-1">
                  x{pkg.ticket_count}
                </div>
                <div className="text-base sm:text-lg font-black text-primary mb-2">
                  ${(pkg.ticket_count * pkg.price_per_ticket).toFixed(0)}
                </div>
                <Link to={`/purchase/${raffle.id}/${pkg.id}`}>
                  <Button 
                    size="sm"
                    className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold text-[10px] h-6 px-1"
                    disabled={raffle.status !== 'active'}
                  >
                    {raffle.status === 'active' ? 'COMPRAR' : 'AGOTADO'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-3">
          <Link to="/comprar">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-6 text-[10px] px-2">
              VER MÁS OPCIONES
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
