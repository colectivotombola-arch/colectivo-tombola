import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log('DataFast status check request received');
    
    const url = new URL(req.url);
    const resourcePath = url.searchParams.get('resourcePath');

    if (!resourcePath) {
      return new Response(
        JSON.stringify({ error: 'Missing resourcePath parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment settings from database
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('payment_settings')
      .single();

    if (settingsError || !settings) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Could not load payment settings' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentSettings = typeof settings.payment_settings === 'string' 
      ? JSON.parse(settings.payment_settings) 
      : settings.payment_settings;

    if (!paymentSettings.datafast_enabled) {
      return new Response(
        JSON.stringify({ error: 'DataFast payment method is disabled' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine host based on mode
    const host = paymentSettings.datafast_mode === 'PROD' 
      ? 'eu-prod.oppwa.com' 
      : 'eu-test.oppwa.com';

    console.log('Checking payment status:', {
      host,
      resourcePath,
      entityId: paymentSettings.datafast_entity_id
    });

    // Make request to DataFast status endpoint
    const statusUrl = `https://${host}${resourcePath}?entityId=${paymentSettings.datafast_entity_id}`;
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paymentSettings.datafast_auth_bearer}`
      }
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('DataFast status API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'DataFast status API error', details: responseData }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('DataFast status retrieved:', responseData.result?.code);

    return new Response(
      JSON.stringify(responseData), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DataFast status error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})