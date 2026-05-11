import { verifyOtp } from '@/lib/otp-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string = body?.email ?? '';
    const otp: string = body?.otp ?? '';

    if (!email || !otp) {
      return Response.json({ success: false, message: 'Email and code are required.' }, { status: 400 });
    }

    const result = verifyOtp(email, otp);
    if (result.valid) {
      return Response.json({ success: true, verified: true });
    }
    return Response.json({ success: false, message: result.message }, { status: 400 });
  } catch (err) {
    console.error('OTP verify error:', err instanceof Error ? err.message : err);
    return Response.json({ success: false, message: 'Verification failed. Please try again.' }, { status: 500 });
  }
}

export function GET() {
  return new Response(null, { status: 405 });
}
