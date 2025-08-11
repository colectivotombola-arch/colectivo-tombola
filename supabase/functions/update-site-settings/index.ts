import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the request body
    const requestData = await req.json();

    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    
    if (!userData.user) throw new Error("User not authenticated");

    // Update site settings with all fields
    const { data, error } = await supabaseClient
      .from("site_settings")
      .upsert({
        site_name: requestData.site_name,
        site_tagline: requestData.site_tagline,
        primary_color: requestData.primary_color,
        secondary_color: requestData.secondary_color,
        contact_email: requestData.contact_email,
        contact_phone: requestData.contact_phone,
        logo_url: requestData.logo_url,
        whatsapp_number: requestData.whatsapp_number,
        instagram_video_url: requestData.instagram_video_url,
        hero_title: requestData.hero_title,
        hero_subtitle: requestData.hero_subtitle,
        social_media: requestData.social_media,
        payment_settings: requestData.payment_settings,
        email_settings: requestData.email_settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});