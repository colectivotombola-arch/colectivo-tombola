import { MessageCircle } from 'lucide-react';
import { SiteSettings } from '@/lib/supabase';

interface FloatingWhatsAppProps {
  settings?: Partial<SiteSettings> | null;
}

const FloatingWhatsApp = ({ settings }: FloatingWhatsAppProps) => {
  const whatsappNumber = ((settings?.payment_settings as any)?.whatsapp?.number || settings?.whatsapp_number || '593999053073').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, tengo preguntas sobre las rifas de Colectivo Tómbola')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      title="Contáctanos por WhatsApp"
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
    </a>
  );
};

export default FloatingWhatsApp;
