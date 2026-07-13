import nodemailer, { type Transporter } from 'nodemailer';

// Shared SMTP transport (Truehost). Cached on globalThis so it survives
// Next.js hot-reloads and per-route module isolation in dev.
const g = globalThis as typeof globalThis & { __mailer?: Transporter };

function getTransport(): Transporter {
  if (g.__mailer) return g.__mailer;

  const setupStart = Date.now();
  const port = Number(process.env['SMTP_PORT'] ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env['SMTP_HOST'],
    port,
    secure: port === 465, // true for 465 (implicit TLS), false for 587 (STARTTLS)
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
    // Keep the connection open and reuse it across sends instead of paying a
    // fresh TCP+TLS+AUTH handshake with Truehost on every OTP/magic-link email.
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    // Truehost's handshake is inconsistently slow (observed anywhere from ~10s
    // to 45s+) rather than actually unreachable, so timeouts need real headroom
    // — too tight and a merely-slow connection gets killed as if it were dead.
    connectionTimeout: 45_000,
    greetingTimeout: 30_000,
    socketTimeout: 45_000,
  });

  console.log(`[mailer] transport created in ${Date.now() - setupStart}ms (pooled, port ${port})`);

  g.__mailer = transport;
  return transport;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, from: fromOverride, replyTo }: SendEmailOptions): Promise<void> {
  const from = fromOverride ?? process.env['EMAIL_FROM'] ?? process.env['SMTP_USER'] ?? 'noreply@softsolutions.co.ke';
  const transport = getTransport();

  const sendStart = Date.now();
  try {
    const info = await transport.sendMail({ from, to, subject, html, text, replyTo });
    console.log(`[mailer] sendMail to ${to} took ${Date.now() - sendStart}ms (messageId: ${info.messageId})`);
  } catch (err) {
    console.error(`[mailer] sendMail to ${to} failed after ${Date.now() - sendStart}ms:`, err instanceof Error ? err.message : err);
    throw err;
  }
}
