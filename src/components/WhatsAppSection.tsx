import React from 'react';
import { SiteSettings } from '@/lib/supabase';
import { MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppSectionProps {
  settings?: Partial<SiteSettings> | null;
}

const WhatsAppSection = ({ settings }: WhatsAppSectionProps) => {
  const whatsappNumber = ((settings?.payment_settings as any)?.whatsapp?.number || settings?.whatsapp_number || '593999053073').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, tengo preguntas sobre las rifas de Colectivo Tómbola')}`;

  return (
    <section className="py-6 sm:py-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
          ¿Tienes preguntas?
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Estamos aquí para ayudarte
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button 
              size="lg" 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </Button>
          </a>
          
          {settings?.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="w-full sm:w-auto"
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-border text-foreground hover:bg-muted gap-2"
              >
                <Mail className="w-5 h-5" />
                Email
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhatsAppSection;