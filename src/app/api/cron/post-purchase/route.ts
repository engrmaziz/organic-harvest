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

function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function buildReviewEmailHtml(customerName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Share Your Experience – Organic Harvest</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFBF7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#2E472D;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:700;letter-spacing:1px;">Organic Harvest</h1>
              <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Pure &amp; Natural from Farm to Table</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#2E472D;font-size:22px;">How did we do, ${customerName}? 🌿</h2>
              <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
                It's been a week since your Organic Harvest order arrived, and we'd love to hear what you think! Your honest feedback helps us grow and helps other customers make the best choices.
              </p>
              <p style="margin:0 0 24px;color:#555555;font-size:16px;line-height:1.6;">
                Just a minute of your time makes a world of difference for our small, passionate team.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://organic-harvest.vercel.app/products"
                       style="display:inline-block;background-color:#2E472D;color:#D4AF37;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
                      ✍️ Write a Review
                    </a>
                  </td>
                </tr>
              </table>
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

function buildPromoEmailHtml(customerName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A Special Thank-You Offer – Organic Harvest</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFBF7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#2E472D;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:700;letter-spacing:1px;">Organic Harvest</h1>
              <p style="margin:8px 0 0;color:#c8e6c9;font-size:14px;">Pure &amp; Natural from Farm to Table</p>
            </td>
          </tr>
          <!-- Promo Banner -->
          <tr>
            <td style="background-color:#D4AF37;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#2E472D;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Exclusive Returning Customer Offer</p>
              <p style="margin:8px 0 0;color:#2E472D;font-size:36px;font-weight:800;">10% OFF</p>
              <p style="margin:4px 0 0;color:#2E472D;font-size:14px;">your next order</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#2E472D;font-size:22px;">We've missed you, ${customerName}! 🌾</h2>
              <p style="margin:0 0 16px;color:#555555;font-size:16px;line-height:1.6;">
                It's been two weeks since your last Organic Harvest order. As a thank-you for being a valued customer, we're offering you an exclusive <strong>10% discount</strong> on your next purchase.
              </p>
              <p style="margin:0 0 8px;color:#555555;font-size:15px;">Use code at checkout:</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 24px;">
                    <div style="display:inline-block;background-color:#FDFBF7;border:2px dashed #D4AF37;border-radius:8px;padding:12px 32px;">
                      <span style="font-size:24px;font-weight:800;color:#2E472D;letter-spacing:4px;">HARVEST10</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://organic-harvest.vercel.app/products"
                       style="display:inline-block;background-color:#2E472D;color:#D4AF37;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">
                      🛒 Shop Now &amp; Save 10%
                    </a>
                  </td>
                </tr>
              </table>
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

  const sevenDaysAgo = getDateString(7);
  const fourteenDaysAgo = getDateString(14);
  const sixDaysAgo = getDateString(6);
  const thirteenDaysAgo = getDateString(13);

  // Query 1: orders placed exactly 7 days ago → send review request emails
  const { data: reviewOrders, error: reviewError } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email")
    .gte("created_at", `${sevenDaysAgo}T00:00:00.000Z`)
    .lt("created_at", `${sixDaysAgo}T00:00:00.000Z`);

  if (reviewError) {
    console.error("Supabase review orders error:", reviewError);
  }

  // Query 2: orders placed exactly 14 days ago → send promo emails
  const { data: promoOrders, error: promoError } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email")
    .gte("created_at", `${fourteenDaysAgo}T00:00:00.000Z`)
    .lt("created_at", `${thirteenDaysAgo}T00:00:00.000Z`);

  if (promoError) {
    console.error("Supabase promo orders error:", promoError);
  }

  // Send review emails
  let reviewSent = 0;
  for (const order of reviewOrders ?? []) {
    const { error } = await resend.emails.send({
      from: "Organic Harvest <onboarding@resend.dev>",
      to: order.customer_email,
      subject: "How was your Organic Harvest order? 🌿 Leave a Review",
      html: buildReviewEmailHtml(order.customer_name),
    });
    if (error) console.error("🔥 RESEND ERROR:", error);
    else { console.log("✅ EMAIL SENT SUCCESSFULLY"); reviewSent++; }
  }

  // Send promo emails
  let promoSent = 0;
  for (const order of promoOrders ?? []) {
    const { error } = await resend.emails.send({
      from: "Organic Harvest <onboarding@resend.dev>",
      to: order.customer_email,
      subject: "A special thank-you gift for you 🎁 – 10% off your next order",
      html: buildPromoEmailHtml(order.customer_name),
    });
    if (error) console.error("🔥 RESEND ERROR:", error);
    else { console.log("✅ EMAIL SENT SUCCESSFULLY"); promoSent++; }
  }

  return NextResponse.json({
    success: true,
    reviewEmailsSent: reviewSent,
    promoEmailsSent: promoSent,
    sevenDaysAgo,
    fourteenDaysAgo,
  });
}
