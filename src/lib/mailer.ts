import nodemailer, { type Transporter } from 'nodemailer';

// Shared SMTP transport (Truehost). Cached on globalThis so it survives
// Next.js hot-reloads and per-route module isolation in dev.
const g = globalThis as typeof globalThis & { __mailer?: Transporter };

function getTransport(): Transporter {
  if (g.__mailer) return g.__mailer;

  const port = Number(process.env['SMTP_PORT'] ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env['SMTP_HOST'],
    port,
    secure: port === 465, // true for 465 (implicit TLS), false for 587 (STARTTLS)
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });

  g.__mailer = transport;
  return transport;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const from = process.env['EMAIL_FROM'] ?? process.env['SMTP_USER'] ?? 'noreply@softsolutions.co.ke';
  await getTransport().sendMail({ from, to, subject, html });
}
