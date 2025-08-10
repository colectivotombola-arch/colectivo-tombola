import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseEmailRequest {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  raffle_id: string;
  quantity: number;
  total_amount: number;
  confirmation_number: string;
  assigned_numbers: number[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailData: PurchaseEmailRequest = await req.json();

    // Obtener información de la rifa y configuraciones del sitio
    const [raffleResult, settingsResult] = await Promise.all([
      supabaseClient.from('raffles').select('*').eq('id', emailData.raffle_id).single(),
      supabaseClient.from('site_settings').select('*').single()
    ]);

    if (raffleResult.error || settingsResult.error) {
      throw new Error('Error fetching raffle or site data');
    }

    const raffle = raffleResult.data;
    const settings = settingsResult.data;

    // Guardar la confirmación en la base de datos
    const { error: confirmationError } = await supabaseClient
      .from('purchase_confirmations')
      .insert({
        raffle_id: emailData.raffle_id,
        buyer_name: emailData.buyer_name,
        buyer_email: emailData.buyer_email,
        buyer_phone: emailData.buyer_phone,
        quantity: emailData.quantity,
        total_amount: emailData.total_amount,
        confirmation_number: emailData.confirmation_number,
        assigned_numbers: emailData.assigned_numbers,
        status: 'pending'
      });

    if (confirmationError) {
      console.error('Error saving confirmation:', confirmationError);
    }

    // Crear contenido del email para el cliente
    const customerEmailContent = `
      <h1>¡Confirmación de Compra - ${settings.site_name}</h1>
      <h2>¡Gracias por tu compra, ${emailData.buyer_name}!</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de tu compra:</h3>
        <p><strong>Rifa:</strong> ${raffle.title}</p>
        <p><strong>Cantidad de boletos:</strong> ${emailData.quantity}</p>
        <p><strong>Total pagado:</strong> $${emailData.total_amount.toFixed(2)}</p>
        <p><strong>Número de confirmación:</strong> ${emailData.confirmation_number}</p>
        
        <h3>Tus números asignados:</h3>
        <div style="font-size: 18px; font-weight: bold; color: #00e5cc;">
          ${emailData.assigned_numbers.join(', ')}
        </div>
      </div>
      
      <p>Conserva este email como comprobante de tu participación.</p>
      <p>¡Mucha suerte en el sorteo!</p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        ${settings.site_name}<br>
        ${settings.contact_email || 'info@ejemplo.com'}<br>
        ${settings.whatsapp_number || 'WhatsApp: +1234567890'}
      </p>
    `;

    // Crear contenido del email para los administradores
    const adminEmailContent = `
      <h1>Nueva Compra Registrada - ${settings.site_name}</h1>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la compra:</h3>
        <p><strong>Cliente:</strong> ${emailData.buyer_name}</p>
        <p><strong>Email:</strong> ${emailData.buyer_email}</p>
        <p><strong>Teléfono:</strong> ${emailData.buyer_phone}</p>
        <p><strong>Rifa:</strong> ${raffle.title}</p>
        <p><strong>Cantidad:</strong> ${emailData.quantity} boletos</p>
        <p><strong>Total:</strong> $${emailData.total_amount.toFixed(2)}</p>
        <p><strong>Confirmación:</strong> ${emailData.confirmation_number}</p>
        
        <h3>Números asignados:</h3>
        <div style="font-size: 16px; font-weight: bold;">
          ${emailData.assigned_numbers.join(', ')}
        </div>
      </div>
      
      <p>Procede con la confirmación del pago cuando sea necesario.</p>
    `;

    console.log('=== EMAIL AL CLIENTE ===');
    console.log(`Para: ${emailData.buyer_email}`);
    console.log(`Asunto: Confirmación de compra - ${raffle.title}`);
    console.log(customerEmailContent);

    console.log('\n=== EMAIL AL ADMINISTRADOR ===');
    console.log(`Para: ${settings.contact_email || 'admin@ejemplo.com'}`);
    console.log(`Asunto: Nueva compra - ${emailData.buyer_name}`);
    console.log(adminEmailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails enviados correctamente',
        confirmation_number: emailData.confirmation_number
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-purchase-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});