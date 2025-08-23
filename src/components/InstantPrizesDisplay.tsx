import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Star } from 'lucide-react';

interface InstantPrize {
  id: string;
  raffle_id: string;
  numbers: number[];
  prize_name: string;
  prize_description?: string;
  prize_image?: string;
  is_active: boolean;
  created_at: string;
}

const InstantPrizesDisplay = () => {
  const [instantPrizes, setInstantPrizes] = useState<InstantPrize[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstantPrizes();
  }, []);

  const loadInstantPrizes = async () => {
    try {
      // Get from raffles.instant_prizes JSON field since instant_prizes table doesn't exist
      const { data: rafflesData, error: rafflesError } = await supabase
        .from('raffles')
        .select('id, title, instant_prizes')
        .eq('status', 'active')
        .not('instant_prizes', 'is', null);

      if (!rafflesError && rafflesData) {
        const allPrizes: InstantPrize[] = [];
        
        rafflesData.forEach(raffle => {
          if (raffle.instant_prizes && Array.isArray(raffle.instant_prizes)) {
            raffle.instant_prizes.forEach((prize: any, index: number) => {
              if (prize.numbers && prize.numbers.length > 0) {
                allPrizes.push({
                  id: `${raffle.id}-${index}`,
                  raffle_id: raffle.id,
                  numbers: prize.numbers,
                  prize_name: prize.name || 'Premio Instantáneo',
                  prize_description: prize.description,
                  prize_image: prize.image_url,
                  is_active: true,
                  created_at: new Date().toISOString()
                });
              }
            });
          }
        });
        
        setInstantPrizes(allPrizes);
      }
    } catch (error) {
      console.error('Error loading instant prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Cargando premios instantáneos...</p>
      </div>
    );
  }

  if (instantPrizes.length === 0) {
    return null; // Don't show section if no prizes
  }

  return (
    <section className="mobile-section bg-gradient-to-r from-card via-muted/20 to-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gift className="w-8 h-8 text-primary" />
            <h2 className="responsive-title font-bold text-foreground">
              ¡Premios Instantáneos!
            </h2>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground mobile-text">
            Números con premios garantizados al instante
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instantPrizes.map((prize) => (
            <Card key={prize.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {prize.prize_image && (
                <div className="aspect-video bg-muted">
                  <img
                    src={prize.prize_image}
                    alt={prize.prize_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{prize.prize_name}</span>
                  <Badge className="bg-gradient-aqua">
                    <Gift className="w-3 h-3 mr-1" />
                    Instantáneo
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {prize.prize_description && (
                  <p className="text-muted-foreground mb-4 text-sm">
                    {prize.prize_description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <p className="font-semibold text-primary">Números Ganadores:</p>
                  <div className="flex flex-wrap gap-2">
                    {prize.numbers.slice(0, 10).map((number) => (
                      <Badge key={number} variant="outline" className="font-mono">
                        #{number}
                      </Badge>
                    ))}
                    {prize.numbers.length > 10 && (
                      <Badge variant="secondary">
                        +{prize.numbers.length - 10} más
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            * Los premios instantáneos se otorgan automáticamente al comprar estos números
          </p>
        </div>
      </div>
    </section>
  );
};

export default InstantPrizesDisplay;