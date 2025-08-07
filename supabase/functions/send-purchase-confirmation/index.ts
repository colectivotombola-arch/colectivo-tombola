import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseConfirmationRequest {
  raffleId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketCount: number;
  totalAmount: number;
  assignedNumbers: number[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const requestData: PurchaseConfirmationRequest = await req.json();

    // Obtener información de la rifa
    const { data: raffle, error: raffleError } = await supabaseClient
      .from('raffles')
      .select('title, description')
      .eq('id', requestData.raffleId)
      .single();

    if (raffleError) throw raffleError;

    // Obtener configuraciones del sitio
    const { data: settings, error: settingsError } = await supabaseClient
      .from('site_settings')
      .select('site_name, contact_email')
      .single();

    if (settingsError) throw settingsError;

    // Simular envío de email al cliente
    const customerEmailContent = `
      <h2>¡Confirmación de Compra - ${settings.site_name}</h2>
      
      <p>Hola ${requestData.buyerName},</p>
      
      <p>¡Gracias por tu compra! Estos son los detalles de tu participación:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Compra</h3>
        <p><strong>Rifa:</strong> ${raffle.title}</p>
        <p><strong>Cantidad de boletos:</strong> ${requestData.ticketCount}</p>
        <p><strong>Monto total:</strong> $${requestData.totalAmount.toFixed(2)}</p>
        <p><strong>Fecha de compra:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Tus Números Asignados</h3>
        <p style="font-size: 18px; font-weight: bold; color: #006600;">
          ${requestData.assignedNumbers.join(', ')}
        </p>
        <p><em>¡Guarda estos números! Los necesitarás para verificar si has ganado.</em></p>
      </div>
      
      <p>El sorteo se realizará una vez que se vendan todos los boletos. Te notificaremos por este medio cuando tengamos la fecha confirmada.</p>
      
      <p>¡Mucha suerte!</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        Este es un correo automático, por favor no responder a esta dirección.
        Si tienes consultas, contáctanos a ${settings.contact_email || 'info@tombola.com'}
      </p>
    `;

    // Simular envío de email a administradores
    const adminEmailContent = `
      <h2>Nueva Compra Registrada - ${settings.site_name}</h2>
      
      <div style="background: #f0f8ff; padding: 20px; border-radius: 8px;">
        <h3>Detalles del Cliente</h3>
        <p><strong>Nombre:</strong> ${requestData.buyerName}</p>
        <p><strong>Email:</strong> ${requestData.buyerEmail}</p>
        <p><strong>Teléfono:</strong> ${requestData.buyerPhone}</p>
      </div>
      
      <div style="background: #fff8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Compra</h3>
        <p><strong>Rifa:</strong> ${raffle.title}</p>
        <p><strong>Cantidad:</strong> ${requestData.ticketCount} boletos</p>
        <p><strong>Total:</strong> $${requestData.totalAmount.toFixed(2)}</p>
        <p><strong>Números asignados:</strong> ${requestData.assignedNumbers.join(', ')}</p>
      </div>
      
      <p>Fecha y hora: ${new Date().toLocaleString()}</p>
    `;

    // Log para debugging (en producción, aquí iría la integración real con un servicio de email)
    console.log("===== EMAIL AL CLIENTE =====");
    console.log(`Para: ${requestData.buyerEmail}`);
    console.log(`Asunto: Confirmación de compra - ${raffle.title}`);
    console.log(customerEmailContent);
    
    console.log("\n===== EMAIL A ADMINISTRADORES =====");
    console.log(`Para: ${settings.contact_email || 'admin@tombola.com'}`);
    console.log(`Asunto: Nueva compra - ${requestData.buyerName}`);
    console.log(adminEmailContent);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Confirmaciones enviadas",
      emailsSent: {
        customer: requestData.buyerEmail,
        admin: settings.contact_email || 'admin@tombola.com'
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending confirmations:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Error interno del servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});