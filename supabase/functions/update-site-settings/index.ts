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
    // Use service role for privileged writes (RLS bypass) but enforce admin check
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr) throw userErr;
    const user = userData?.user;
    if (!user) throw new Error("User not authenticated");

    // Enforce admin role
    const { data: roles, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .limit(1);
    if (roleErr) throw roleErr;
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const requestData = await req.json();

    // Upsert single row of site_settings
    const { data, error } = await supabaseAdmin
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
        price_per_number: requestData.price_per_number,
        terms_and_conditions: requestData.terms_and_conditions,
        activity_title: requestData.activity_title,
        purchase_rules: requestData.purchase_rules,
        raffle_rules: requestData.raffle_rules,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});