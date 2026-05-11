import { canVerifyByIp, verifyToken } from '@/lib/magic-link-store';

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!canVerifyByIp(ip)) {
    return Response.json({ valid: false, message: 'Too many attempts. Try again shortly.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const token: string = body?.token ?? '';
    if (!token) {
      return Response.json({ valid: false, message: 'Token is required.' }, { status: 400 });
    }

    const result = verifyToken(token);
    if (!result.valid) {
      return Response.json({ valid: false, message: result.message }, { status: 400 });
    }

    return Response.json({
      valid: true,
      email: result.email,
      context: result.context,
      redirectTo: result.redirectTo,
      registerData: result.registerData,
    });
  } catch (err) {
    console.error('[magic-link] Verify error:', err instanceof Error ? err.message : err);
    return Response.json({ valid: false, message: 'Verification failed.' }, { status: 500 });
  }
}

export function GET() {
  return new Response(null, { status: 405 });
}
