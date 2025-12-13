import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Play } from 'lucide-react';

interface Winner {
  id: string;
  name: string;
  prize: string;
  date_won: string;
  image_url?: string;
  description?: string;
}

interface MediaItem {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  description?: string;
}

const WinnersGallerySection = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [winnersRes, mediaRes] = await Promise.all([
        supabase
          .from('winners')
          .select('*')
          .eq('is_active', true)
          .order('position'),
        supabase
          .from('media_gallery')
          .select('*')
          .eq('is_active', true)
          .order('position')
      ]);

      setWinners(winnersRes.data || []);
      setMedia(mediaRes.data || []);
    } catch (error) {
      console.error('Error loading winners gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no content
  if (loading || (winners.length === 0 && media.length === 0)) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-card/30">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8">
          🏆 Galería de Ganadores
        </h2>

        {/* Winners Photos */}
        {winners.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {winners.map((winner) => (
                <div 
                  key={winner.id} 
                  className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                >
                  {winner.image_url ? (
                    <img 
                      src={winner.image_url} 
                      alt={winner.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <span className="text-4xl">🎉</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-foreground text-sm truncate">{winner.name}</p>
                    <p className="text-primary text-xs truncate">{winner.prize}</p>
                    <p className="text-muted-foreground text-[10px]">
                      {new Date(winner.date_won).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {media.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground mb-4">
              📹 Videos de Premios Entregados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                >
                  {item.media_type === 'video' ? (
                    <div className="aspect-video bg-muted relative group cursor-pointer">
                      {item.media_url.includes('youtube') || item.media_url.includes('youtu.be') ? (
                        <iframe
                          src={item.media_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video 
                          src={item.media_url} 
                          controls 
                          className="w-full h-full object-cover"
                          poster={item.media_url + '?poster'}
                        />
                      )}
                    </div>
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    {item.description && (
                      <p className="text-muted-foreground text-xs mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WinnersGallerySection;
