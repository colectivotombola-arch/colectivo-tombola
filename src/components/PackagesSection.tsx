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
    <section className="mobile-section bg-card/30">
      <div className="mobile-container">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
            ¡ADQUIERE TUS NÚMEROS!
          </h2>
          <p className="text-muted-foreground">
            Valor de la Unidad: <span className="text-primary font-bold">${raffle.price_per_number}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                pkg.is_popular 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'border-border'
              }`}
            >
              {pkg.is_popular && (
                <Badge className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-b-md rounded-t-none">
                  ★ Más Vendido ★
                </Badge>
              )}
              <CardContent className={`text-center p-4 ${pkg.is_popular ? 'pt-6' : 'pt-4'}`}>
                <div className="text-sm sm:text-base font-bold text-foreground mb-2">
                  x{pkg.ticket_count} Números
                </div>
                <div className="text-2xl sm:text-3xl font-black text-primary mb-4">
                  ${(pkg.ticket_count * pkg.price_per_ticket).toFixed(0)}
                </div>
                <Link to={`/purchase/${raffle.id}/${pkg.id}`}>
                  <Button 
                    size="sm"
                    className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs h-8"
                    disabled={raffle.status !== 'active'}
                  >
                    {raffle.status === 'active' ? 'COMPRAR' : 'AGOTADO'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Link to custom purchase */}
        <div className="text-center mt-6">
          <Link to="/comprar">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8 text-xs">
              VER MÁS OPCIONES
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
