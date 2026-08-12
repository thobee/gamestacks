type PurchasedKeyItem = {
  gameTitle: string;
  gameKey: string;
};

type PurchaseKeyAlertPayload = {
  customerEmail: string;
  customerName?: string | null;
  orderNumber: string;
  keyItems: PurchasedKeyItem[];
};

type ResendBody = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendEmailViaResend(
  apiKey: string,
  body: ResendBody,
): Promise<void> {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error (${res.status}): ${text}`);
  }
}

export async function notifyCustomerOfKeyDelivery(
  payload: PurchaseKeyAlertPayload,
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || payload.keyItems.length === 0) {
    return;
  }

  const resendFrom =
    process.env.RESEND_FROM_EMAIL || "Gamestacks <alerts@gamestacks.app>";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const libraryUrl = appUrl ? `${appUrl}/library` : "/library";
  const greetingName = payload.customerName?.trim() || "there";

  const keysHtml = payload.keyItems
    .map(
      (item) =>
        `<li style="margin:0 0 12px"><p style="margin:0 0 4px;font-weight:700">${item.gameTitle}</p><code style="display:inline-block;padding:6px 8px;background:#f5f5f5;border:1px solid #e5e5e5;border-radius:6px">${item.gameKey}</code></li>`,
    )
    .join("");

  await sendEmailViaResend(resendApiKey, {
    from: resendFrom,
    to: [payload.customerEmail],
    subject: "Your game key is now available",
    html: [
      '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">',
      `<h2 style="margin:0 0 12px">Hi ${greetingName}, your game key is ready</h2>`,
      `<p style="margin:0 0 8px">Order: <strong>${payload.orderNumber}</strong></p>`,
      '<p style="margin:0 0 16px">Use the key below in your launcher/store. You can always find it again in your library.</p>',
      `<ul style="padding-left:18px;margin:0 0 16px">${keysHtml}</ul>`,
      `<p style="margin:0"><a href="${libraryUrl}">Open My Library</a></p>`,
      "</div>",
    ].join(""),
  });
}
