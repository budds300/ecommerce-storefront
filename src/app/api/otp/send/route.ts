import { canSend, saveOtp, sendOtpEmail } from '@/lib/otp-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string = body?.email ?? '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, message: 'Invalid email address.' }, { status: 400 });
    }

    const check = canSend(email);
    if (!check.allowed) {
      return Response.json({ success: false, message: check.message }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(email, code);

    if (process.env['NODE_ENV'] !== 'production') {
      console.log(`[dev] OTP for ${email}: ${code}`);
    }

    await sendOtpEmail(email, code);
    console.log(`OTP sent to ${email}`);

    return Response.json({ success: true, message: 'Verification code sent.' });
  } catch (err) {
    console.error('OTP send error:', err instanceof Error ? err.message : err);
    return Response.json({ success: false, message: 'Failed to send code. Please try again.' }, { status: 500 });
  }
}

export function GET() {
  return new Response(null, { status: 405 });
}
