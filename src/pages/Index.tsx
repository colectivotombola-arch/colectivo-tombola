import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProgressSection from '@/components/ProgressSection';
import GallerySection from '@/components/GallerySection';
import InstagramSection from '@/components/InstagramSection';
import SocialMediaSection from '@/components/SocialMediaSection';
import WhatsAppSection from '@/components/WhatsAppSection';
import { siteSettingsAPI, SiteSettings, rafflesAPI, Raffle } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { useDesignSettings } from '@/hooks/useDesignSettings';
import { Instagram, Facebook } from 'lucide-react';
import footerLogo from '@/assets/logo-colectivo-tombola-new.png';

const Index = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const { refreshFromSiteSettings } = useDesignSettings();
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);

  useEffect(() => {
    loadSettings();
    loadActiveRaffle();
    refreshFromSiteSettings(); // Apply design settings
  }, []);

  const loadSettings = async () => {
    try {
      const data = await siteSettingsAPI.getPublic();
      setSettings(data);
      // Refresh design settings when site settings change
      await refreshFromSiteSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const socialMedia = settings?.social_media ? (typeof settings.social_media === 'string' ? JSON.parse(settings.social_media) : settings.social_media) : {};

  const loadActiveRaffle = async () => {
    try {
      const raffle = await rafflesAPI.getActive();
      setActiveRaffle(raffle);
    } catch (e) {
      console.error('Error loading active raffle', e);
    }
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header settings={settings} />
      <HeroSection settings={settings} />
      <ProgressSection settings={settings} />
      <InstagramSection settings={settings} />
      {/* Instant Prizes Section */}
      {activeRaffle?.instant_prizes && (Array.isArray(activeRaffle.instant_prizes) ? activeRaffle.instant_prizes.length > 0 : false) && (
        <section className="mobile-section bg-card/50">
          <div className="mobile-container">
            <h3 className="responsive-subtitle mb-4">Premios Instantáneos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {(activeRaffle.instant_prizes as any[])
                .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                .map((p: any) => (
                  <div key={p.number} className={`p-3 rounded-lg border text-center ${p.claimed ? 'opacity-60' : 'bg-primary/10 border-primary'}`}>
                    <div className="font-mono font-bold">#{p.number}</div>
                    <div className="text-sm text-muted-foreground">${p.prize_amount || 0}</div>
                    {p.claimed && <div className="text-xs mt-1">Entregado</div>}
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}
      <GallerySection settings={settings} />
      
      {/* Contact Section */}
      <WhatsAppSection settings={settings} />


      {/* Footer */}
      <footer className="bg-background text-foreground mobile-section relative overflow-hidden">
        {/* Background Logo - More visible */}
        <div className="absolute inset-0 opacity-60 bg-no-repeat bg-center bg-cover" 
             style={{backgroundImage: `url(/lovable-uploads/40dd58e7-1558-43d2-84a8-c2a6176de594.png)`}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-background/95"></div>
        <div className="mobile-container relative z-10">
          <div className="mobile-grid">
            <div>
              <h3 className="responsive-subtitle mb-4 text-primary">
                {settings?.site_name || 'Colectivo Tombola'}
              </h3>
              <p className="text-muted-foreground mobile-text">
                {settings?.hero_subtitle || 'Rifas seguras y transparentes con los mejores premios'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 mobile-text">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-muted-foreground mobile-body">
                <li><Link to="/comprar" className="hover:text-primary transition-colors">Comprar Números</Link></li>
                <li><Link to="/consultar" className="hover:text-primary transition-colors">Consultar Números</Link></li>
                <li><Link to="/detalles" className="hover:text-primary transition-colors">Detalles de Actividad</Link></li>
                <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 mobile-text">Síguenos</h4>
              <div className="flex space-x-4">
                <a 
                  href={socialMedia.instagram_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-pink-500 transition-colors"
                  aria-label="Síguenos en Instagram"
                >
                  <Instagram className="w-8 h-8" />
                </a>
                <a 
                  href={socialMedia.facebook_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-blue-500 transition-colors"
                  aria-label="Síguenos en Facebook"
                >
                  <Facebook className="w-8 h-8" />
                </a>
                <a 
                  href={socialMedia.tiktok_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label="Síguenos en TikTok"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground relative">
            <p className="mobile-body">&copy; 2024 {settings?.site_name || 'Colectivo Tombola'}. Todos los derechos reservados.</p>
            <Link 
              to="/admin" 
              className="fixed bottom-4 right-4 z-50 bg-background/30 backdrop-blur-sm p-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300 shadow-md mobile-body opacity-70"
              title="Admin"
            >
              🔐
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;