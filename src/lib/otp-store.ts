import { sendEmail } from './mailer';

interface OtpEntry {
  code: string;
  expiry: number;
  attempts: number;
  sentCount: number;
  lastSent: number;
  blockedUntil?: number;
}

// Global singleton — survives Next.js hot-reloads and cross-route module isolation in dev
const g = globalThis as typeof globalThis & { __otpStore?: Map<string, OtpEntry> };
const store: Map<string, OtpEntry> = g.__otpStore ?? (g.__otpStore = new Map());

const OTP_TTL = 10 * 60 * 1000;        // 10 minutes
const RATE_WINDOW = 60 * 60 * 1000;    // 1 hour
const MAX_SENDS = 3;
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export function canSend(email: string): { allowed: boolean; message?: string } {
  const entry = store.get(email);
  if (!entry) return { allowed: true };

  const withinWindow = Date.now() - entry.lastSent < RATE_WINDOW;
  if (withinWindow && entry.sentCount >= MAX_SENDS) {
    return { allowed: false, message: 'Too many attempts. Try again later.' };
  }
  return { allowed: true };
}

export function saveOtp(email: string, code: string): void {
  const existing = store.get(email);
  const withinWindow = existing && Date.now() - existing.lastSent < RATE_WINDOW;
  store.set(email, {
    code,
    expiry: Date.now() + OTP_TTL,
    attempts: 0,
    sentCount: withinWindow ? (existing.sentCount + 1) : 1,
    lastSent: Date.now(),
  });
}

export function verifyOtp(email: string, otp: string): { valid: boolean; message?: string } {
  const entry = store.get(email);
  if (!entry) return { valid: false, message: 'No code was sent to this email.' };

  if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
    const mins = Math.ceil((entry.blockedUntil - Date.now()) / 60000);
    return { valid: false, message: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` };
  }

  if (Date.now() > entry.expiry) {
    store.delete(email);
    return { valid: false, message: 'Code has expired. Please request a new one.' };
  }

  if (entry.code !== otp) {
    const newAttempts = entry.attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      store.set(email, { ...entry, attempts: newAttempts, blockedUntil: Date.now() + BLOCK_DURATION });
      return { valid: false, message: 'Too many failed attempts. Try again in 15 minutes.' };
    }
    store.set(email, { ...entry, attempts: newAttempts });
    return { valid: false, message: 'Invalid code. Please try again.' };
  }

  store.delete(email);
  return { valid: true };
}

export function buildOtpEmail(code: string): string {
  const siteName = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Soft Solutions Store';
  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <h2 style="margin:0 0 8px 0;font-size:20px">${siteName}</h2>
  <p style="color:#555;margin:0 0 32px 0;font-size:14px">Order Verification</p>
  <p style="margin:0 0 12px 0;font-size:15px">Your verification code is:</p>
  <p style="font-size:40px;font-weight:bold;letter-spacing:12px;margin:0 0 24px 0;color:#111">${code}</p>
  <p style="color:#555;font-size:14px;margin:0 0 8px 0">This code expires in 10 minutes.</p>
  <p style="color:#888;font-size:13px;margin:0">If you did not request this, you can safely ignore this email.</p>
</body>
</html>`;
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  try {
    await sendEmail({
      to,
      subject: 'Your verification code',
      html: buildOtpEmail(code),
    });
  } catch (err) {
    console.error('SMTP error:', err instanceof Error ? err.message : err);
    throw new Error('Failed to send verification email.');
  }
}
