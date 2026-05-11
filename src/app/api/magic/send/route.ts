import { canSendByEmail, canSendByIp, createToken, isSafeRedirect, sendMagicLinkEmail } from '@/lib/magic-link-store';

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

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
  // No origin/referer — allow only outside production (e.g. server-side calls, curl)
  return process.env['NODE_ENV'] !== 'production';
}

export async function POST(req: Request) {
  if (!isValidOrigin(req)) {
    return Response.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!canSendByIp(ip)) {
    return Response.json({ success: false, message: 'Too many requests. Try again shortly.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();
    const context: string = body?.context === 'register' ? 'register' : 'checkout';
    const rawRedirect: string = body?.redirectTo ?? '/checkout';
    const redirectTo = isSafeRedirect(rawRedirect) ? rawRedirect : '/checkout';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, message: 'Invalid email address.' }, { status: 400 });
    }

    // Validate registration data when context is register
    let registerData: { first_name: string; last_name: string; password: string } | undefined;
    if (context === 'register') {
      const rd = body?.registerData;
      if (!rd?.first_name?.trim() || !rd?.last_name?.trim() || !rd?.password) {
        return Response.json({ success: false, message: 'Missing registration details.' }, { status: 400 });
      }
      if (typeof rd.password !== 'string' || rd.password.length < 8) {
        return Response.json({ success: false, message: 'Password must be at least 8 characters.' }, { status: 400 });
      }
      registerData = {
        first_name: String(rd.first_name).trim(),
        last_name: String(rd.last_name).trim(),
        password: String(rd.password),
      };
    }

    const emailCheck = canSendByEmail(email);
    if (!emailCheck.allowed) {
      return Response.json({ success: false, message: emailCheck.message }, { status: 429 });
    }

    const host = req.headers.get('host') ?? 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') ??
      (process.env['NODE_ENV'] === 'production' ? 'https' : 'http');
    const origin = `${proto}://${host}`;

    const token = createToken(email, context, redirectTo, registerData);
    await sendMagicLinkEmail(email, token, context, origin);

    console.log(`[magic-link] Sent to ${email} (context: ${context}, ip: ${ip})`);
    return Response.json({ success: true });
  } catch (err) {
    console.error('[magic-link] Send error:', err instanceof Error ? err.message : err);
    return Response.json({ success: false, message: 'Failed to send link. Please try again.' }, { status: 500 });
  }
}

export function GET() {
  return new Response(null, { status: 405 });
}
