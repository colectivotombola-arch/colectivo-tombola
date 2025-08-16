import { Instagram } from 'lucide-react';
import { SiteSettings } from '@/lib/supabase';

interface InstagramSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const InstagramSection = ({ settings }: InstagramSectionProps) => {
  const instagramHandle = settings?.instagram_handle || '@colectivotombola';
  const displayName = settings?.instagram_display_name || 'Colectivo Tombola';

  return (
    <section className="py-8 bg-gradient-to-r from-pink-500 to-purple-600">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Instagram className="w-8 h-8 text-white" />
          <h3 className="text-2xl font-bold text-white">
            Síguenos en Instagram
          </h3>
        </div>
        <p className="text-white/90 text-lg">
          {instagramHandle} - {displayName}
        </p>
        <p className="text-white/70 mt-2">
          ¡No te pierdas nuestras últimas actualizaciones y sorteos!
        </p>
      </div>
    </section>
  );
};

export default InstagramSection;