import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PackagesSection from '@/components/PackagesSection';
import GallerySection from '@/components/GallerySection';
import VideoReelsSection from '@/components/VideoReelsSection';
import WinnersGallerySection from '@/components/WinnersGallerySection';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { siteSettingsAPI, SiteSettings, rafflesAPI, Raffle } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { useDesignSettings } from '@/hooks/useDesignSettings';
import { Instagram, Facebook } from 'lucide-react';

const Index = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const { refreshFromSiteSettings } = useDesignSettings();
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);

  useEffect(() => {
    loadSettings();
    loadActiveRaffle();
    refreshFromSiteSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await siteSettingsAPI.getPublic();
      setSettings(data);
      await refreshFromSiteSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadActiveRaffle = async () => {
    try {
      const raffle = await rafflesAPI.getActive();
      setActiveRaffle(raffle);
    } catch (e) {
      console.error('Error loading active raffle', e);
    }
  };

  const socialMedia = settings?.social_media 
    ? (typeof settings.social_media === 'string' ? JSON.parse(settings.social_media) : settings.social_media) 
    : {};

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation - Fixed */}
      <Header settings={settings} />
      
      {/* 1. Hero Section - Prominent with editable prize */}
      <HeroSection settings={settings} />
      
      {/* 2. Packages/Combos Section - Dynamic from admin */}
      <PackagesSection />
      
      {/* 3. Prize Gallery - Dynamic from admin */}
      <GallerySection settings={settings} />
      
      {/* 4. Video Reels Section - Replaces static boxes */}
      <VideoReelsSection />
      
      {/* 5. Winners Gallery (Photos & Videos) */}
      <WinnersGallerySection />
      
      {/* Instant Prizes (Optional - if raffle has them) */}
      {activeRaffle?.instant_prizes && (Array.isArray(activeRaffle.instant_prizes) ? activeRaffle.instant_prizes.length > 0 : false) && (
        <section className="py-4 sm:py-6 bg-card/30">
          <div className="container mx-auto px-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 text-center">🎯 Premios Instantáneos</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
              {(activeRaffle.instant_prizes as any[])
                .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                .slice(0, 12)
                .map((p: any) => (
                  <div key={p.number} className={`p-2 rounded-lg border text-center text-xs ${p.claimed ? 'opacity-50 border-border' : 'bg-primary/10 border-primary/30'}`}>
                    <div className="font-mono font-bold text-foreground">#{p.number}</div>
                    <div className="text-primary font-semibold">${p.prize_amount || 0}</div>
                    {p.claimed && <div className="text-muted-foreground text-[10px]">Entregado</div>}
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer - Clean and Simple */}
      <footer className="bg-card border-t border-border py-4 sm:py-6 mb-16 sm:mb-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand + Links */}
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-primary text-sm mb-1">
                {settings?.site_name || 'Colectivo Tómbola'}
              </h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-muted-foreground text-xs">
                <Link to="/comprar" className="hover:text-primary transition-colors">Comprar</Link>
                <Link to="/consultar" className="hover:text-primary transition-colors">Consultar</Link>
                <Link to="/detalles" className="hover:text-primary transition-colors">Detalles</Link>
                <Link to="/terminos" className="hover:text-primary transition-colors">Términos</Link>
              </div>
            </div>
            
            {/* Social Icons - Simple */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs mr-1">Síguenos</span>
              {socialMedia.instagram_url && socialMedia.instagram_url !== '#' && (
                <a 
                  href={socialMedia.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-pink-500 transition-colors p-1"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialMedia.facebook_url && socialMedia.facebook_url !== '#' && (
                <a 
                  href={socialMedia.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-blue-500 transition-colors p-1"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialMedia.tiktok_url && socialMedia.tiktok_url !== '#' && (
                <a 
                  href={socialMedia.tiktok_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-border mt-3 pt-3 text-center text-muted-foreground text-[10px] sm:text-xs">
            <p>&copy; {new Date().getFullYear()} {settings?.site_name || 'Colectivo Tómbola'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      
      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp settings={settings} />
      
      {/* Admin Link */}
      <Link 
        to="/admin" 
        className="fixed bottom-3 left-3 z-40 bg-card/80 backdrop-blur-sm p-2 rounded-full border border-border text-muted-foreground hover:text-primary transition-colors opacity-30 hover:opacity-100"
        title="Panel de Administración"
      >
        🔐
      </Link>
    </div>
  );
};

export default Index;