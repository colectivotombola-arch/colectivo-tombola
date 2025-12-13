import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PackagesSection from '@/components/PackagesSection';
import GallerySection from '@/components/GallerySection';
import WhatsAppSection from '@/components/WhatsAppSection';
import WinnersGallerySection from '@/components/WinnersGallerySection';
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
      
      {/* 1. Hero Section */}
      <HeroSection settings={settings} />
      
      {/* 2. Packages/Combos Section */}
      <PackagesSection />
      
      {/* 3. Prize Gallery */}
      <GallerySection settings={settings} />
      
      {/* 4. WhatsApp Contact */}
      <WhatsAppSection settings={settings} />
      
      {/* 5. Winners Gallery (Photos & Videos) */}
      <WinnersGallerySection />
      
      {/* Instant Prizes (Optional - if raffle has them) */}
      {activeRaffle?.instant_prizes && (Array.isArray(activeRaffle.instant_prizes) ? activeRaffle.instant_prizes.length > 0 : false) && (
        <section className="py-6 bg-card/30">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-bold text-foreground mb-4 text-center">🎯 Premios Instantáneos</h3>
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

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            {/* Brand */}
            <div>
              <h3 className="font-bold text-primary mb-2">
                {settings?.site_name || 'Colectivo Tómbola'}
              </h3>
              <p className="text-muted-foreground text-xs">
                {settings?.hero_subtitle || 'Rifas seguras y transparentes'}
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-2">Enlaces</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li><Link to="/comprar" className="hover:text-primary transition-colors">Comprar Números</Link></li>
                <li><Link to="/consultar" className="hover:text-primary transition-colors">Consultar Números</Link></li>
                <li><Link to="/detalles" className="hover:text-primary transition-colors">Detalles</Link></li>
                <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
              </ul>
            </div>
            
            {/* Social */}
            <div>
              <h4 className="font-semibold text-foreground mb-2">Síguenos</h4>
              <div className="flex gap-3">
                {socialMedia.instagram_url && socialMedia.instagram_url !== '#' && (
                  <a 
                    href={socialMedia.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.facebook_url && socialMedia.facebook_url !== '#' && (
                  <a 
                    href={socialMedia.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.tiktok_url && socialMedia.tiktok_url !== '#' && (
                  <a 
                    href={socialMedia.tiktok_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-border mt-6 pt-4 text-center text-muted-foreground text-xs">
            <p>&copy; {new Date().getFullYear()} {settings?.site_name || 'Colectivo Tómbola'}. Todos los derechos reservados.</p>
          </div>
        </div>
        
        {/* Admin Link */}
        <Link 
          to="/admin" 
          className="fixed bottom-3 right-3 z-50 bg-card/80 backdrop-blur-sm p-2 rounded-full border border-border text-muted-foreground hover:text-primary transition-colors opacity-50 hover:opacity-100"
          title="Panel de Administración"
        >
          🔐
        </Link>
      </footer>
    </div>
  );
};

export default Index;