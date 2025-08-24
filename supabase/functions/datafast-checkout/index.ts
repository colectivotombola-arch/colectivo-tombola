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

    console.log('DataFast checkout request received');
    
    const { 
      amount, 
      orderId,
      customer,
      billing,
      shipping 
    } = await req.json();

    // Validate required fields
    if (!amount || !orderId || !customer) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
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

    // Calculate taxes
    const ivaRate = paymentSettings.datafast_iva_rate || 0.12;
    const totalAmount = parseFloat(amount);
    const ivaAmount = totalAmount * ivaRate;
    const baseAmount = totalAmount - ivaAmount;

    // Prepare form data
    const formData = new URLSearchParams({
      entityId: paymentSettings.datafast_entity_id,
      amount: totalAmount.toFixed(2),
      currency: paymentSettings.datafast_currency || 'USD',
      paymentType: 'DB',
      'customer.givenName': customer.givenName || '',
      'customer.middleName': customer.middleName || '',
      'customer.surname': customer.surname || '',
      'customer.merchantCustomerId': '000000000001',
      merchantTransactionId: orderId,
      'customer.email': customer.email,
      'customer.identificationDocType': 'IDCARD',
      'customer.identificationDocId': customer.identificationDocId?.substring(0, 10) || '',
      'customer.phone': customer.phone || '',
      'billing.street1': billing?.street1 || 'No address',
      'billing.country': 'EC',
      'shipping.street1': shipping?.street1 || 'No address',
      'shipping.country': 'EC',
      [`customParameters[SHOPPER_MID]`]: paymentSettings.datafast_shopper_mid,
      [`customParameters[SHOPPER_TID]`]: paymentSettings.datafast_shopper_tid,
      [`customParameters[SHOPPER_ECI]`]: '0103910',
      [`customParameters[SHOPPER_PSERV]`]: paymentSettings.datafast_shopper_pserv || '17913101',
      [`customParameters[SHOPPER_VERSIONDF]`]: '2',
      [`customParameters[SHOPPER_VAL_BASE0]`]: baseAmount.toFixed(2),
      [`customParameters[SHOPPER_VAL_BASEIMP]`]: '0.00',
      [`customParameters[SHOPPER_VAL_IVA]`]: ivaAmount.toFixed(2),
      [`risk.parameters[USER_DATA2]`]: paymentSettings.datafast_risk_user_data2 || 'MiComercio'
    });

    // Add test mode parameter if in sandbox
    if (paymentSettings.datafast_mode === 'SANDBOX') {
      formData.append('testMode', 'EXTERNAL');
    }

    console.log('Sending request to DataFast:', {
      host,
      amount: totalAmount.toFixed(2),
      orderId,
      mode: paymentSettings.datafast_mode
    });

    // Make request to DataFast
    const response = await fetch(`https://${host}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paymentSettings.datafast_auth_bearer}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('DataFast API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'DataFast API error', details: responseData }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('DataFast checkout created successfully:', responseData.id);

    return new Response(
      JSON.stringify({ 
        checkoutId: responseData.id,
        host: host
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DataFast checkout error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})