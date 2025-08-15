import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import ProgressSection from "@/components/ProgressSection";
import { Link, useNavigate } from 'react-router-dom';
import { siteSettingsAPI, type SiteSettings } from '@/lib/supabase';
import { useDesignSettings } from '@/hooks/useDesignSettings';
import { MobileContainer, MobileSection, ResponsiveText } from '@/components/MobileOptimized';

const Index = () => {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const navigate = useNavigate();
  const { loading: designLoading } = useDesignSettings();

  useEffect(() => {
    loadSettings();
    
    // Check if redirected from admin with success flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('adminSuccess') === 'true') {
      // Remove the query parameter and reload settings
      navigate('/', { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const data = await siteSettingsAPI.getPublic();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const socialMedia = settings?.social_media ? (typeof settings.social_media === 'string' ? JSON.parse(settings.social_media) : settings.social_media) : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header settings={settings} />
      <HeroSection settings={settings} />
      <ProgressSection settings={settings} />
      <GallerySection settings={settings} />
      
      {/* Contact Section */}
      <MobileSection className="bg-primary/10">
        <MobileContainer className="text-center">
          <ResponsiveText variant="title" className="text-foreground mb-4">
            ¿Tienes preguntas?
          </ResponsiveText>
          <ResponsiveText className="text-muted-foreground mb-8">
            Contacta con nosotros por WhatsApp
          </ResponsiveText>
          <a
            href={`https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || '593999053073'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors touch-target"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <ResponsiveText>Escribir por WhatsApp</ResponsiveText>
          </a>
        </MobileContainer>
      </MobileSection>

      {/* Footer */}
      <footer className="bg-black text-white mobile-section relative overflow-hidden">
        {/* Background Logo */}
        <div className="absolute inset-0 opacity-5 bg-no-repeat bg-center bg-contain" 
             style={{backgroundImage: "url('/src/assets/logo-colectivo-tombola-new.png')"}}></div>
        <MobileContainer className="relative z-10">
          <div className="mobile-grid">
            <div>
              <ResponsiveText variant="subtitle" className="mb-4 text-primary">
                {settings?.site_name || 'Colectivo Tombola'}
              </ResponsiveText>
              <ResponsiveText className="text-gray-400">
                {settings?.hero_subtitle || 'Rifas seguras y transparentes con los mejores premios'}
              </ResponsiveText>
            </div>
            <div>
              <h4 className="font-semibold mb-4 mobile-text">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/comprar" className="hover:text-primary transition-colors mobile-text touch-target">Comprar Números</Link></li>
                <li><Link to="/consultar" className="hover:text-primary transition-colors mobile-text touch-target">Consultar Números</Link></li>
                <li><Link to="/detalles" className="hover:text-primary transition-colors mobile-text touch-target">Detalles de Actividad</Link></li>
                <li><Link to="/terminos" className="hover:text-primary transition-colors mobile-text touch-target">Términos y Condiciones</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 mobile-text">Síguenos</h4>
              <div className="flex space-x-4 flex-wrap mobile-gap">
                {socialMedia.facebook_url && (
                  <a href={socialMedia.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors touch-target">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialMedia.instagram_url && (
                  <a href={socialMedia.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors touch-target">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {socialMedia.twitter_url && (
                  <a href={socialMedia.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors touch-target">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                )}
                {socialMedia.tiktok_url && (
                  <a href={socialMedia.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors touch-target">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                )}
                {socialMedia.youtube_url && (
                  <a href={socialMedia.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors touch-target">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 relative">
            <ResponsiveText>&copy; 2024 {settings?.site_name || 'Colectivo Tombola'}. Todos los derechos reservados.</ResponsiveText>
            <Link 
              to="/admin" 
              className="fixed bottom-4 right-4 z-50 bg-black/30 backdrop-blur-sm p-1.5 rounded-full border border-gray-800 text-gray-600 hover:text-gray-500 hover:border-gray-700 transition-all duration-300 shadow-md text-xs opacity-70"
              title="Admin"
            >
              🔐
            </Link>
          </div>
        </MobileContainer>
      </footer>
    </div>
  );
};

export default Index;