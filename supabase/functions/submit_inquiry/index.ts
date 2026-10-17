// Supabase Edge Function: submit_inquiry
// Deno TypeScript runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InquiryPayload {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_name?: string;
  category: string;
  title?: string;
  description: string;
  turnstile_token?: string;
  honeypot?: string; // Anti-spam bot trap
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: InquiryPayload = await req.json();

    // 1. Honeypot check (if filled, reject silently to trick bots)
    if (payload.honeypot) {
      console.warn("Spam bot detected via honeypot field");
      return new Response(JSON.stringify({ success: true, message: "Inquiry received" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. Input validation & sanitization
    if (!payload.contact_name || !payload.contact_email || !payload.contact_phone || !payload.description) {
      return new Response(
        JSON.stringify({ error: "Nama, email, nomor telepon/WhatsApp, dan deskripsi kebutuhan wajib diisi." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.contact_email)) {
      return new Response(
        JSON.stringify({ error: "Format email tidak valid." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 3. Cloudflare Turnstile CAPTCHA verification (if secret configured)
    const turnstileSecret = Deno.env.get("CLOUDFLARE_TURNSTILE_SECRET_KEY");
    if (turnstileSecret && payload.turnstile_token) {
      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: payload.turnstile_token,
        }),
      });

      const outcome = await turnstileRes.json();
      if (!outcome.success) {
        return new Response(
          JSON.stringify({ error: "Verifikasi keamanan CAPTCHA gagal. Silakan coba lagi." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    // 4. Connect to Supabase using SERVER SERVICE ROLE (Not exposed to client)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Generate document sequence number: INQ/YYYY/MM/XXXX
    const { data: seqNumber, error: seqError } = await supabase.rpc("next_document_number", {
      p_code: "INQ",
    });

    const inquiryNumber = seqError
      ? `INQ/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(Math.random() * 9000 + 1000)}`
      : seqNumber;

    // 6. Check or auto-link existing Customer
    let customerId: string | null = null;
    if (payload.company_name) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .ilike("name", payload.company_name.trim())
        .is("deleted_at", null)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Auto create prospect customer
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            name: payload.company_name.trim(),
            pic_name: payload.contact_name.trim(),
            pic_email: payload.contact_email.trim(),
            pic_phone: payload.contact_phone.trim(),
            notes: "Dibuat otomatis dari form inquiry website publik",
          })
          .select("id")
          .maybeSingle();

        if (newCustomer) customerId = newCustomer.id;
      }
    }

    // 7. Insert inquiry with source = 'website'
    const title = payload.title || `Inquiry ${payload.category || "Otomasi"}: ${payload.company_name || payload.contact_name}`;

    const { data: insertedInquiry, error: insertError } = await supabase
      .from("inquiries")
      .insert({
        inquiry_number: inquiryNumber,
        customer_id: customerId,
        title,
        description: payload.description,
        source: "website",
        contact_name: payload.contact_name.trim(),
        contact_email: payload.contact_email.trim(),
        contact_phone: payload.contact_phone.trim(),
        consent_at: new Date().toISOString(),
        status: "inquiry",
        priority: "high", // Website inquiries marked high for prompt sales response
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting inquiry:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // 8. Success Response
    return new Response(
      JSON.stringify({
        success: true,
        reference_number: inquiryNumber,
        message: "Permintaan penawaran Anda telah berhasil dikirim. Tim sales kami akan segera menghubungi Anda.",
        data: insertedInquiry,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Unexpected error in submit_inquiry:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
