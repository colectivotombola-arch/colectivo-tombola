import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import React from 'npm:react@18.3.1';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { PurchaseConfirmationEmail } from './_templates/purchase-confirmation.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
};

interface HotmartWebhookEvent {
  id: string;
  event: string;
  version: string;
  data: {
    buyer: {
      email: string;
      name: string;
    };
    product: {
      id: number;
      name: string;
    };
    purchase: {
      transaction: string;
      status: string;
      order_date: number;
      price: {
        value: number;
        currency_code: string;
      };
    };
    subscription?: {
      subscriber_code: string;
    };
  };
}

function generateRandomNumbers(quantity: number, total: number, excluded: Set<number>): number[] {
  const available = [];
  for (let i = 1; i <= total; i++) {
    if (!excluded.has(i)) {
      available.push(i);
    }
  }
  
  if (available.length < quantity) {
    throw new Error('Not enough available numbers');
  }
  
  const selected = [];
  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return selected.sort((a, b) => a - b);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify Hotmart webhook token
    const hottok = req.headers.get('x-hotmart-hottok');
    const expectedToken = Deno.env.get('HOTMART_WEBHOOK_TOKEN');
    
    if (expectedToken && hottok !== expectedToken) {
      console.error('Invalid Hotmart webhook token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookEvent: HotmartWebhookEvent = await req.json();
    console.log('Hotmart webhook received:', JSON.stringify(webhookEvent, null, 2));

    // Only process approved payments
    if (webhookEvent.event !== 'PURCHASE_APPROVED' && 
        webhookEvent.data.purchase.status !== 'approved') {
      console.log('Ignoring non-approved payment event');
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transaction = webhookEvent.data.purchase.transaction;
    const buyerEmail = webhookEvent.data.buyer.email;
    const buyerName = webhookEvent.data.buyer.name;

    // Find pending purchase confirmation by transaction ID or buyer email
    const { data: confirmations, error: confirmationError } = await supabase
      .from('purchase_confirmations')
      .select('*')
      .eq('buyer_email', buyerEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (confirmationError) {
      console.error('Error fetching confirmation:', confirmationError);
      throw confirmationError;
    }

    if (!confirmations || confirmations.length === 0) {
      console.error('No pending confirmation found for email:', buyerEmail);
      return new Response(JSON.stringify({ error: 'No pending purchase found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const confirmation = confirmations[0];

    // Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', confirmation.raffle_id)
      .single();

    if (raffleError || !raffle) {
      console.error('Error fetching raffle:', raffleError);
      throw raffleError || new Error('Raffle not found');
    }

    // Get already sold numbers
    const { data: soldNumbers, error: soldError } = await supabase
      .from('raffle_numbers')
      .select('number_value')
      .eq('raffle_id', confirmation.raffle_id);

    if (soldError) {
      console.error('Error fetching sold numbers:', soldError);
      throw soldError;
    }

    const excludedNumbers = new Set(soldNumbers?.map(n => n.number_value) || []);

    // Generate random numbers
    const assignedNumbers = generateRandomNumbers(
      confirmation.quantity,
      raffle.total_numbers,
      excludedNumbers
    );

    console.log('Assigning numbers:', assignedNumbers);

    // Update confirmation with assigned numbers and mark as paid
    const { error: updateError } = await supabase
      .from('purchase_confirmations')
      .update({
        assigned_numbers: assignedNumbers,
        status: 'paid',
        payment_method: 'hotmart',
        updated_at: new Date().toISOString(),
      })
      .eq('id', confirmation.id);

    if (updateError) {
      console.error('Error updating confirmation:', updateError);
      throw updateError;
    }

    // Insert raffle numbers
    const raffleNumbersData = assignedNumbers.map(number => ({
      raffle_id: confirmation.raffle_id,
      number_value: number,
      buyer_name: buyerName,
      buyer_phone: confirmation.buyer_phone,
      buyer_email: buyerEmail,
      payment_method: 'hotmart',
      payment_status: 'paid',
    }));

    const { error: insertError } = await supabase
      .from('raffle_numbers')
      .insert(raffleNumbersData);

    if (insertError) {
      console.error('Error inserting raffle numbers:', insertError);
      throw insertError;
    }

    // Update raffle stats
    const newNumbersSold = (raffle.numbers_sold || 0) + confirmation.quantity;
    const newSoldPercentage = (newNumbersSold / raffle.total_numbers) * 100;
    const isSoldOut = newNumbersSold >= raffle.total_numbers;

    const { error: raffleUpdateError } = await supabase
      .from('raffles')
      .update({
        numbers_sold: newNumbersSold,
        sold_percentage: newSoldPercentage,
        is_sold_out: isSoldOut,
      })
      .eq('id', confirmation.raffle_id);

    if (raffleUpdateError) {
      console.error('Error updating raffle:', raffleUpdateError);
    }

    console.log('Hotmart payment processed successfully:', {
      transaction,
      confirmationId: confirmation.id,
      assignedNumbers,
    });

    // Send confirmation email
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        
        const html = await renderAsync(
          React.createElement(PurchaseConfirmationEmail, {
            buyerName,
            raffleTitle: raffle.title,
            assignedNumbers,
            confirmationNumber: confirmation.confirmation_number,
            quantity: confirmation.quantity,
            totalAmount: confirmation.total_amount,
          })
        );

        const { error: emailError } = await resend.emails.send({
          from: 'Rifas <onboarding@resend.dev>',
          to: [buyerEmail],
          subject: `¡Pago Confirmado! Tus números para ${raffle.title}`,
          html,
        });

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
        } else {
          console.log('Confirmation email sent successfully to:', buyerEmail);
        }
      } else {
        console.warn('RESEND_API_KEY not configured, skipping email notification');
      }
    } catch (emailError) {
      console.error('Error in email sending process:', emailError);
      // Don't fail the webhook if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        confirmation_id: confirmation.id,
        assigned_numbers: assignedNumbers,
        transaction,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing Hotmart webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
