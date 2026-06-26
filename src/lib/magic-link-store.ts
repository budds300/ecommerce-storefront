import crypto from 'crypto';
import { sendEmail } from './mailer';

interface RegisterData {
  first_name: string;
  last_name: string;
  password: string;
}

interface Entry {
  email: string;
  context: string;
  redirectTo: string;
  expiry: number;
  used: boolean;
  sentCount: number;
  lastSent: number;
  registerData?: RegisterData;
}

interface IpWindow {
  count: number;
  windowStart: number;
}

const g = globalThis as typeof globalThis & {
  __mlStore?: Map<string, Entry>;
  __mlIpSend?: Map<string, IpWindow>;
  __mlIpVerify?: Map<string, IpWindow>;
};

const store: Map<string, Entry>       = g.__mlStore    ?? (g.__mlStore    = new Map());
const ipSend: Map<string, IpWindow>   = g.__mlIpSend   ?? (g.__mlIpSend   = new Map());
const ipVerify: Map<string, IpWindow> = g.__mlIpVerify ?? (g.__mlIpVerify = new Map());

const TOKEN_TTL         = 15 * 60 * 1000;
const EMAIL_RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const EMAIL_MAX_SENDS   = 3;
const IP_SEND_WINDOW    = 15 * 60 * 1000; // 15 minutes
const IP_SEND_MAX       = 5;
const IP_VERIFY_WINDOW  = 5 * 60 * 1000;  // 5 minutes
const IP_VERIFY_MAX     = 20;
const MAX_STORE_SIZE    = 5000;

// Allowed safe redirect destinations (relative paths only)
const SAFE_REDIRECTS = new Set(['/checkout', '/account', '/']);

export function isSafeRedirect(path: string): boolean {
  // Must be a relative path starting with /
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  // Strip query string for comparison
  const base = path.split('?')[0];
  return SAFE_REDIRECTS.has(base ?? path);
}

// Purge expired and used entries to keep memory bounded
function purgeExpired(): void {
  const now = Date.now();
  store.forEach((entry, token) => {
    if (entry.used || now > entry.expiry) store.delete(token);
  });
  ipSend.forEach((w, ip) => {
    if (now - w.windowStart > IP_SEND_WINDOW * 2) ipSend.delete(ip);
  });
  ipVerify.forEach((w, ip) => {
    if (now - w.windowStart > IP_VERIFY_WINDOW * 2) ipVerify.delete(ip);
  });
}

let lastPurge = 0;
function maybePurge(): void {
  const PURGE_INTERVAL = 5 * 60 * 1000; // every 5 minutes
  if (Date.now() - lastPurge > PURGE_INTERVAL) {
    lastPurge = Date.now();
    purgeExpired();
  }
}

function checkIpWindow(
  map: Map<string, IpWindow>,
  ip: string,
  windowMs: number,
  max: number,
): boolean {
  const now = Date.now();
  const w = map.get(ip);
  if (!w || now - w.windowStart > windowMs) {
    map.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (w.count >= max) return false;
  map.set(ip, { ...w, count: w.count + 1 });
  return true;
}

export function canSendByEmail(email: string): { allowed: boolean; message?: string } {
  let count = 0;
  const now = Date.now();
  store.forEach((e) => {
    if (e.email === email && now - e.lastSent < EMAIL_RATE_WINDOW) count++;
  });
  if (count >= EMAIL_MAX_SENDS) {
    return { allowed: false, message: 'Too many requests. Try again in an hour.' };
  }
  return { allowed: true };
}

export function canSendByIp(ip: string): boolean {
  return checkIpWindow(ipSend, ip, IP_SEND_WINDOW, IP_SEND_MAX);
}

export function canVerifyByIp(ip: string): boolean {
  return checkIpWindow(ipVerify, ip, IP_VERIFY_WINDOW, IP_VERIFY_MAX);
}

export function createToken(
  email: string,
  context: string,
  redirectTo: string,
  registerData?: RegisterData,
): string {
  maybePurge();

  if (store.size >= MAX_STORE_SIZE) {
    // Force purge before refusing
    purgeExpired();
    if (store.size >= MAX_STORE_SIZE) throw new Error('Service temporarily unavailable.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  store.set(token, {
    email,
    context,
    redirectTo,
    expiry: Date.now() + TOKEN_TTL,
    used: false,
    sentCount: 1,
    lastSent: Date.now(),
    registerData,
  });
  return token;
}

export function verifyToken(token: string): {
  valid: boolean;
  email?: string;
  context?: string;
  redirectTo?: string;
  registerData?: RegisterData;
  message?: string;
} {
  // Reject obviously malformed tokens immediately (don't even hit the map)
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return { valid: false, message: 'Invalid or expired link.' };
  }

  const entry = store.get(token);
  // Always return the same generic message to prevent oracle attacks
  if (!entry || entry.used || Date.now() > entry.expiry) {
    if (entry && Date.now() > entry.expiry) store.delete(token);
    return { valid: false, message: 'Invalid or expired link.' };
  }

  store.set(token, { ...entry, used: true });
  return {
    valid: true,
    email: entry.email,
    context: entry.context,
    redirectTo: entry.redirectTo,
    registerData: entry.registerData,
  };
}

function buildEmail(link: string, context: string): string {
  const site = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Soft Solutions Store';
  const isCheckout = context === 'checkout';
  const subject = isCheckout ? 'Verify your email to complete your order' : 'Verify your email address';
  const body = isCheckout
    ? 'Click the button below to verify your email and complete your Cash on Delivery order.'
    : 'Click the button below to verify your email and activate your account.';
  const cta = isCheckout ? 'Verify &amp; Complete Order' : 'Verify Email Address';

  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <h2 style="margin:0 0 4px 0;font-size:18px">${site}</h2>
  <p style="color:#888;font-size:13px;margin:0 0 32px 0">${subject}</p>
  <p style="font-size:15px;margin:0 0 8px 0;font-weight:600">One click to continue</p>
  <p style="color:#555;font-size:14px;margin:0 0 28px 0">${body}</p>
  <a href="${link}"
     style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600">
    ${cta}
  </a>
  <p style="color:#aaa;font-size:12px;margin:28px 0 0 0">
    This link expires in 15&nbsp;minutes. If you did not request this, ignore this email.
  </p>
</body>
</html>`;
}

export async function sendMagicLinkEmail(
  to: string,
  token: string,
  context: string,
  origin: string,
): Promise<void> {
  const link = `${origin}/auth/magic?token=${token}`;
  const site = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Soft Solutions Store';
  const isCheckout = context === 'checkout';

  try {
    await sendEmail({
      to,
      subject: isCheckout
        ? `[${site}] Verify your email to complete your order`
        : `[${site}] Verify your email address`,
      html: buildEmail(link, context),
    });
  } catch (err) {
    // Log the error message but never log the token itself
    console.error('[magic-link] Email send failed:', err instanceof Error ? err.message : err);
    throw new Error('Failed to send verification email.');
  }
}
