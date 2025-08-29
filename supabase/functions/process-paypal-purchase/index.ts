import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseRequest {
  raffle_id: string;
  quantity: number;
  total_amount: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  paypal_order_id: string;
}

function generateRandomNumbers(quantity: number, total: number, excluded: Set<number>): number[] {
  const available: number[] = [];
  for (let i = 1; i <= total; i++) if (!excluded.has(i)) available.push(i);
  if (available.length < quantity) throw new Error("No hay suficientes números disponibles");
  const selected: number[] = [];
  for (let i = 0; i < quantity; i++) {
    const idx = Math.floor(Math.random() * available.length);
    selected.push(available[idx]);
    available.splice(idx, 1);
  }
  return selected;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: PurchaseRequest = await req.json();
    const { raffle_id, quantity, total_amount, buyer_name, buyer_email, buyer_phone, paypal_order_id } = body || {} as any;

    if (!raffle_id || !quantity || !buyer_email || !buyer_name || !buyer_phone || !paypal_order_id) {
      throw new Error("Faltan datos de la compra");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // Obtener rifa
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('id, total_numbers, price_per_number, title')
      .eq('id', raffle_id)
      .maybeSingle();
    if (raffleError || !raffle) throw new Error(`Rifa no encontrada`);

    // Obtener números ya vendidos
    const { data: rn, error: rnError } = await supabase
      .from('raffle_numbers')
      .select('number_value')
      .eq('raffle_id', raffle_id);
    if (rnError) throw rnError;

    const sold = new Set<number>((rn || []).map((r: any) => r.number_value));
    const assigned = generateRandomNumbers(quantity, raffle.total_numbers, sold);

    // Insertar confirmación de compra (paid)
    const { data: confirmation, error: confErr } = await supabase
      .from('purchase_confirmations')
      .insert({
        raffle_id,
        quantity,
        total_amount,
        assigned_numbers: assigned,
        payment_method: 'paypal',
        confirmation_number: paypal_order_id,
        status: 'paid',
        buyer_name,
        buyer_email,
        buyer_phone,
      })
      .select()
      .maybeSingle();
    if (confErr) throw confErr;

    // Insertar números asignados
    const toInsert = assigned.map((num) => ({
      raffle_id,
      number_value: num,
      buyer_name,
      buyer_phone,
      buyer_email,
      payment_method: 'paypal',
      payment_status: 'paid',
    }));
    const { error: numsErr } = await supabase.from('raffle_numbers').insert(toInsert);
    if (numsErr) throw numsErr;

    // Actualizar progreso de la rifa
    const { count } = await supabase
      .from('raffle_numbers')
      .select('*', { count: 'exact', head: true })
      .eq('raffle_id', raffle_id);
    const numbersSold = count || 0;
    const soldPercentage = raffle.total_numbers > 0 ? (numbersSold / raffle.total_numbers) * 100 : 0;
    const isSoldOut = soldPercentage >= 100;

    const { error: updErr } = await supabase
      .from('raffles')
      .update({ numbers_sold: numbersSold, sold_percentage: soldPercentage, is_sold_out: isSoldOut })
      .eq('id', raffle_id);
    if (updErr) throw updErr;

    // Enviar email si hay API key
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        const list = assigned.sort((a, b) => a - b).join(', ');
        const html = `
          <h2>¡Gracias por tu compra!</h2>
          <p>Rifa: ${raffle.title}</p>
          <p>Cantidad: ${quantity}</p>
          <p>Total: $${total_amount.toFixed(2)}</p>
          <p><strong>Números asignados:</strong> ${list}</p>
          <p>Confirmación: ${paypal_order_id}</p>
        `;
        await resend.emails.send({
          from: 'Colectivo Tómbola <no-reply@resend.dev>',
          to: [buyer_email],
          subject: 'Confirmación de compra y números asignados',
          html,
        });
      } catch (e) {
        console.log('Error enviando email (continuando de todos modos):', e);
      }
    } else {
      console.log('RESEND_API_KEY no configurado, omitiendo envío de email');
    }

    return new Response(JSON.stringify({ assigned_numbers: assigned, confirmation_id: confirmation?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('process-paypal-purchase error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});