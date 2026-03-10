"use server";

import { Resend } from "resend";

export async function sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    grandTotal: number
): Promise<{ success: boolean; error?: string }> {
    console.log("📨 ATTEMPTING TO SEND EMAIL TO:", email);
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY environment variable is not configured.");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const shortOrderId = orderId.split("-")[0].toUpperCase();
        const formattedTotal = new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: 0,
        }).format(grandTotal).replace("PKR", "Rs.");

        await resend.emails.send({
            from: "Organic Harvest <onboarding@resend.dev>",
            to: email,
            subject: `Order Confirmed – #${shortOrderId} | Organic Harvest`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color:#16a34a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🌿 Organic Harvest</h1>
              <p style="margin:8px 0 0;color:#bbf7d0;font-size:14px;">Your order has been confirmed!</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Thank you for your order!</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                We've received your order and our team will get it ready for dispatch. We'll contact you on WhatsApp shortly to confirm delivery.
              </p>

              <!-- Order Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Order Reference</p>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#16a34a;font-family:monospace;">#${shortOrderId}</p>
                        </td>
                        <td style="padding-bottom:12px;text-align:right;">
                          <p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Grand Total</p>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#111827;">${formattedTotal}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <h3 style="margin:0 0 12px;font-size:16px;color:#111827;">What happens next?</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:14px;">✅ &nbsp; Order received &amp; being prepared</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:14px;">📦 &nbsp; Packed and dispatched within 1–2 business days</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#374151;font-size:14px;">🚚 &nbsp; Delivered to your doorstep</td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                If you have any questions, please reply to this email or reach out to us on WhatsApp.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Organic Harvest. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
            `.trim(),
        });

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send confirmation email.";
        console.error("📧 Email send error:", message);
        return { success: false, error: message };
    }
}
