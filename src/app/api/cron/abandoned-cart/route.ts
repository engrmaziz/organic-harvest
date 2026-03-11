import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createResendClient() {
  return new Resend(getRequiredEnv("RESEND_API_KEY"));
}

function createSupabaseClient() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

function buildAbandonedCartEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You left something behind – Organic Harvest</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFBF7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#2E472D;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🌿 Organic Harvest</h1>
              <p style="margin:8px 0 0;color:#a3c9a2;font-size:14px;">You left something in your cart!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#1a2e1a;">Still thinking it over?</h2>
              <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.7;">
                Hi there! We noticed you started checking out but didn't complete your order. Your healthy organic products are still waiting for you.
              </p>
              <!-- Promo Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:2px dashed #2E472D;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;color:#4b5563;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Use this code at checkout</p>
                    <p style="margin:0 0 10px;font-size:32px;font-weight:800;color:#2E472D;letter-spacing:3px;font-family:monospace;">COMEBACK5</p>
                    <p style="margin:0;font-size:14px;color:#6b7280;">Get 5% off your order when you complete your purchase today.</p>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://organic-harvest.vercel.app/checkout" style="display:inline-block;background-color:#2E472D;color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:8px;text-decoration:none;">
                      Complete My Order →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                This offer is just for you, ${email}. It expires soon!
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e8e0d0;margin:0;" />
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#888888;font-size:13px;">
                Questions? Reach us at <a href="mailto:support@organicharvest.com" style="color:#2E472D;">support@organicharvest.com</a>
                or WhatsApp <a href="https://wa.me/923000000000" style="color:#2E472D;">+92 300 0000000</a>
              </p>
              <p style="margin:0;color:#aaaaaa;font-size:12px;">© ${new Date().getFullYear()} Organic Harvest. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  // Verify the request comes from Vercel Cron
  if (
    request.headers.get("Authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  let resend: ReturnType<typeof createResendClient>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: ReturnType<typeof createSupabaseClient>;
  try {
    resend = createResendClient();
    supabase = createSupabaseClient();
  } catch (err) {
    console.error("Configuration error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: abandonedCarts, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "Draft")
    .lte("created_at", twoHoursAgo);

  if (error) {
    console.error("Supabase abandoned cart query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailsSent = 0;
  const results = await Promise.allSettled(
    (abandonedCarts ?? []).map(async (cart) => {
      const { error: emailError } = await resend.emails.send({
        from: "Organic Harvest <onboarding@resend.dev>",
        to: cart.customer_email,
        subject: "You left something behind 🛒 – Complete your Organic Harvest order",
        html: buildAbandonedCartEmailHtml(cart.customer_email),
      });

      if (emailError) {
        console.error("🔥 RESEND ERROR for cart", cart.id, ":", emailError);
        throw emailError;
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "Abandoned - Emailed" })
        .eq("id", cart.id);

      if (updateError) {
        console.error("🔥 SUPABASE UPDATE ERROR for cart", cart.id, ":", updateError);
        throw updateError;
      }

      console.log("✅ ABANDONED CART EMAIL SENT AND STATUS UPDATED for", cart.id);
      return true;
    })
  );

  results.forEach((result) => {
    if (result.status === "fulfilled") emailsSent++;
  });

  return NextResponse.json({
    success: true,
    abandonedCartsFound: (abandonedCarts ?? []).length,
    emailsSent,
  });
}
