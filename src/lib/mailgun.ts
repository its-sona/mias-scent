import { formatDate, formatNaira, orderNumber } from "@/lib/format";

export type ReceiptOrder = {
  id: string;
  created_at: Date | string;
  customer_name: string;
  phone: string;
  address: string;
  email: string;
  total: number;
  items: { product_name: string; unit_price: number; quantity: number; line_total: number }[];
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function buildReceipt(order: ReceiptOrder) {
  const number = orderNumber(order.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${siteUrl}/orders/${order.id}`;

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee4dc;">${escapeHtml(item.product_name)} × ${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee4dc;text-align:right;">${formatNaira(item.line_total)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#faf6f2;font-family:Georgia,'Times New Roman',serif;color:#2b1d17;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="margin:0;font-size:28px;font-weight:normal;">Mia's Scent</h1>
      <p style="margin:4px 0 24px;color:#8a6f5c;font-style:italic;">Elegance in every drop.</p>
      <div style="background:#ffffff;border-radius:12px;padding:24px;font-family:Arial,Helvetica,sans-serif;">
        <p style="margin:0 0 8px;font-size:18px;">Thank you, ${escapeHtml(order.customer_name)}!</p>
        <p style="margin:0 0 20px;color:#5c4a3f;">We've received your order <strong>${number}</strong> placed on ${formatDate(order.created_at)}.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${rows}
          <tr>
            <td style="padding:14px 0 0;font-weight:bold;">Total</td>
            <td style="padding:14px 0 0;text-align:right;font-weight:bold;">${formatNaira(order.total)}</td>
          </tr>
        </table>
        <h2 style="margin:24px 0 8px;font-size:15px;">Delivery details</h2>
        <p style="margin:0;color:#5c4a3f;font-size:14px;line-height:1.5;">
          ${escapeHtml(order.customer_name)}<br />
          ${escapeHtml(order.phone)}<br />
          ${escapeHtml(order.address).replace(/\n/g, "<br />")}
        </p>
        <p style="margin:24px 0 0;">
          <a href="${orderUrl}" style="display:inline-block;background:#2b1d17;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;">View your order</a>
        </p>
      </div>
      <p style="margin:20px 0 0;color:#8a6f5c;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
        This is a demo order for an HNG project. No payment was taken.
      </p>
    </div>
  </body>
</html>`;

  const text = [
    `Mia's Scent — Order ${number}`,
    "",
    `Thank you, ${order.customer_name}!`,
    "",
    ...order.items.map(
      (item) => `${item.product_name} x ${item.quantity}: ${formatNaira(item.line_total)}`,
    ),
    `Total: ${formatNaira(order.total)}`,
    "",
    "Delivery details:",
    order.customer_name,
    order.phone,
    order.address,
    "",
    `View your order: ${orderUrl}`,
  ].join("\n");

  return { subject: `Your Mia's Scent order ${number}`, html, text };
}

// Sends the order receipt through the Mailgun REST API. Returns true on success.
export async function sendOrderConfirmation(order: ReceiptOrder): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL ?? `Mia's Scent <postmaster@${domain}>`;
  // Use https://api.eu.mailgun.net if your Mailgun account is in the EU region.
  const apiBase = process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net";

  if (!apiKey || !domain) {
    console.error("Mailgun is not configured: set MAILGUN_API_KEY and MAILGUN_DOMAIN.");
    return false;
  }

  const { subject, html, text } = buildReceipt(order);
  const body = new URLSearchParams({ from, to: order.email, subject, html, text });

  try {
    const response = await fetch(`${apiBase}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      },
      body,
    });

    if (!response.ok) {
      console.error("Mailgun send failed:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Mailgun request error:", error);
    return false;
  }
}
