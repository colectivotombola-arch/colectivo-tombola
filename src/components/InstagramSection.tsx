import { Instagram } from 'lucide-react';
import { SiteSettings } from '@/lib/supabase';

interface InstagramSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const InstagramSection = ({ settings }: InstagramSectionProps) => {
  const instagramHandle = settings?.instagram_handle || '@colectivotombola';
  const displayName = settings?.instagram_display_name || 'Colectivo Tombola';

  return (
    <section className="py-8 bg-card/50">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Instagram className="w-8 h-8 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">
            Síguenos en Instagram
          </h3>
        </div>
        <p className="text-foreground text-lg">
          {instagramHandle} - {displayName}
        </p>
        <p className="text-muted-foreground mt-2">
          ¡No te pierdas nuestras últimas actualizaciones y sorteos!
        </p>
      </div>
    </section>
  );
};

export default InstagramSection;