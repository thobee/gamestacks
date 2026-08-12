type AdminCommentAlertPayload = {
  gameTitle: string;
  gameSlug: string;
  authorName: string;
  content: string;
  adminEmails: string[];
  adminWhatsappNumbers: string[];
};

type ResendBody = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

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

async function sendWhatsappWebhook(
  url: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp webhook error (${res.status}): ${text}`);
  }
}

export async function notifyAdminsOfComment(
  payload: AdminCommentAlertPayload,
): Promise<void> {
  const contentPreview =
    payload.content.length > 220
      ? `${payload.content.slice(0, 220)}...`
      : payload.content;

  const subject = `New comment on ${payload.gameTitle}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const gamePath = payload.gameSlug
    ? `/games/${payload.gameSlug}`
    : "/admin/notifications";
  const gameUrl = appUrl ? `${appUrl}${gamePath}` : gamePath;

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom =
    process.env.RESEND_FROM_EMAIL ||
    "Gamestacks Alerts <alerts@gamestacks.app>";
  const webhookUrl = process.env.ADMIN_WHATSAPP_WEBHOOK_URL;

  const adminEmails = unique(payload.adminEmails);
  const adminWhatsappNumbers = unique(payload.adminWhatsappNumbers);

  const tasks: Promise<void>[] = [];

  if (resendApiKey && adminEmails.length > 0) {
    tasks.push(
      sendEmailViaResend(resendApiKey, {
        from: resendFrom,
        to: adminEmails,
        subject,
        html: [
          '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">',
          `<h2 style=\"margin:0 0 12px\">${subject}</h2>`,
          `<p style=\"margin:0 0 8px\"><strong>Author:</strong> ${payload.authorName}</p>`,
          `<p style=\"margin:0 0 8px\"><strong>Game:</strong> ${payload.gameTitle}</p>`,
          `<p style=\"margin:0 0 16px\"><strong>Comment:</strong> ${contentPreview}</p>`,
          `<p style=\"margin:0\"><a href=\"${gameUrl}\">Open comment thread</a></p>`,
          "</div>",
        ].join(""),
      }),
    );
  }

  if (webhookUrl && adminWhatsappNumbers.length > 0) {
    tasks.push(
      sendWhatsappWebhook(webhookUrl, {
        type: "new_review_comment",
        gameTitle: payload.gameTitle,
        gameSlug: payload.gameSlug,
        authorName: payload.authorName,
        comment: contentPreview,
        recipients: adminWhatsappNumbers,
        url: gameUrl,
      }),
    );
  }

  if (tasks.length === 0) {
    return;
  }

  const results = await Promise.allSettled(tasks);
  const failures = results.filter((r) => r.status === "rejected");

  if (failures.length > 0) {
    const reasons = failures
      .map((f) => (f.status === "rejected" ? String(f.reason) : ""))
      .join("; ");
    throw new Error(reasons || "Admin notification dispatch failed");
  }
}
