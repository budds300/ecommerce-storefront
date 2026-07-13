import { sendEmail } from '@/lib/mailer';

function isValidOrigin(req: Request): boolean {
  const host = req.headers.get('host');
  const reqOrigin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (reqOrigin) {
    try {
      return new URL(reqOrigin).host === host;
    } catch {
      return false;
    }
  }
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return process.env['NODE_ENV'] !== 'production';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  if (!isValidOrigin(req)) {
    return Response.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const name: string = (body?.name ?? '').trim();
    const email: string = (body?.email ?? '').trim();
    const message: string = (body?.message ?? '').trim();

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, message: 'Please fill in all fields with a valid email.' }, { status: 400 });
    }

    const supportEmail = process.env['SUPPORT_EMAIL_FROM'] ?? process.env['EMAIL_FROM'] ?? process.env['SMTP_USER'];
    if (!supportEmail) {
      throw new Error('SUPPORT_EMAIL_FROM is not configured.');
    }

    const siteName = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Soft Solutions Store';

    await sendEmail({
      to: supportEmail,
      // Deliberately not overriding `from` here: Truehost's spam filter rejects
      // mail whose From doesn't match the authenticated SMTP account (SPF/DKIM
      // mismatch reads as spoofing). Let sendEmail() default to EMAIL_FROM/SMTP_USER
      // and rely on `to`/`replyTo` to route the message and enable direct replies.
      replyTo: email,
      subject: `[${siteName}] New contact message from ${name}`,
      text: `New contact message — ${siteName}\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <h2 style="margin:0 0 8px 0;font-size:18px">New contact message</h2>
  <p style="color:#555;margin:0 0 24px 0;font-size:14px">${siteName}</p>
  <p style="margin:0 0 4px 0;font-size:14px"><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p style="margin:0 0 16px 0;font-size:14px"><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p style="margin:0 0 8px 0;font-size:14px"><strong>Message:</strong></p>
  <p style="white-space:pre-wrap;font-size:14px;color:#333;border-left:3px solid #e5e7eb;padding-left:12px">${escapeHtml(message)}</p>
</body>
</html>`,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Contact form send error:', err instanceof Error ? err.message : err);
    return Response.json({ success: false, message: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}

export function GET() {
  return new Response(null, { status: 405 });
}
