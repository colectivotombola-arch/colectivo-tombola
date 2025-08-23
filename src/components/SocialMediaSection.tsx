import { Facebook, Instagram, Twitter } from 'lucide-react';
import { SiteSettings } from '@/lib/supabase';

interface SocialMediaSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const SocialMediaSection = ({ settings }: SocialMediaSectionProps) => {
  // Parse social media settings
  let socialMedia;
  try {
    socialMedia = settings?.social_media ? 
      (typeof settings.social_media === 'string' ? JSON.parse(settings.social_media) : settings.social_media) 
      : {};
  } catch (e) {
    socialMedia = {};
  }

  const socialLinks = [
    {
      name: 'Facebook',
      url: socialMedia.facebook_url || '#',
      icon: Facebook,
      color: 'hover:text-blue-500'
    },
    {
      name: 'Instagram',  
      url: socialMedia.instagram_url || '#',
      icon: Instagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      url: socialMedia.tiktok_url || '#', 
      icon: () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
      color: 'hover:text-red-500'
    },
    {
      name: 'Twitter',
      url: socialMedia.twitter_url || '#',
      icon: Twitter,  
      color: 'hover:text-blue-400'
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-card via-muted/20 to-card">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-6">
          Síguenos en Redes Sociales
        </h3>
        <div className="flex justify-center items-center space-x-6">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return social.url && social.url !== '#' ? (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-muted-foreground ${social.color} transition-colors duration-200 flex items-center space-x-2 p-3 rounded-lg hover:bg-background/50`}
                aria-label={`Síguenos en ${social.name}`}
              >
                <IconComponent />
                <span className="hidden sm:inline">{social.name}</span>
              </a>
            ) : null;
          }).filter(Boolean)}
        </div>
        <p className="text-muted-foreground mt-4">
          ¡No te pierdas nuestras últimas actualizaciones y sorteos!
        </p>
      </div>
    </section>
  );
};

export default SocialMediaSection;