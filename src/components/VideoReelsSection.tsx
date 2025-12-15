import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Play } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  description?: string;
}

const VideoReelsSection = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_gallery')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInstagramReel = (url: string) => url.includes('instagram.com');
  const isTikTok = (url: string) => url.includes('tiktok.com');
  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

  const getEmbedUrl = (url: string) => {
    if (isYouTube(url)) {
      return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  // Don't render if no content
  if (loading || media.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-8 bg-card/40">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-xl font-bold text-center text-foreground mb-4 sm:mb-6">
          📹 Ganadores y Pruebas Sociales
        </h2>
        
        {/* Video Grid - Responsive carousel/grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {media.slice(0, 6).map((item) => (
            <div 
              key={item.id} 
              className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[9/16] sm:aspect-video relative">
                {item.media_type === 'video' ? (
                  <>
                    {isYouTube(item.media_url) ? (
                      <iframe
                        src={getEmbedUrl(item.media_url)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isInstagramReel(item.media_url) || isTikTok(item.media_url) ? (
                      <a 
                        href={item.media_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full h-full bg-muted flex items-center justify-center group"
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/40 transition-colors">
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {isInstagramReel(item.media_url) ? 'Ver en Instagram' : 'Ver en TikTok'}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <video 
                        src={item.media_url} 
                        controls 
                        className="w-full h-full object-cover"
                        playsInline
                      />
                    )}
                  </>
                ) : (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-2 sm:p-3">
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{item.title}</p>
                {item.description && (
                  <p className="text-muted-foreground text-[10px] sm:text-xs truncate mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoReelsSection;
