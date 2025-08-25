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

      {/* Imagen al final de la página */}
      <section className="mobile-section p-0" aria-label="Imagen final de la página">
        <img 
          src="/lovable-uploads/40dd58e7-1558-43d2-84a8-c2a6176de594.png" 
          alt="Foto del vehículo - imagen final de la página" 
          loading="lazy" 
          className="w-full h-auto object-cover" 
        />
      </section>

      {/* Footer */}
      <footer className="bg-background text-foreground mobile-section relative overflow-hidden">
        {/* Background Logo - More visible */}
        <div className="absolute inset-0 opacity-20 bg-no-repeat bg-center bg-contain" 
             style={{backgroundImage: `url(${settings?.logo_url || footerLogo})`}}></div>
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
                {socialMedia.facebook_url && (
                  <a href={socialMedia.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-500 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialMedia.instagram_url && (
                  <a href={socialMedia.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500 transition-colors">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
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