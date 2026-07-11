'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useCustomer } from '@/store/customer';
import { isPasswordValid } from '@/lib/password';
import PasswordStrength from '@/components/shared/PasswordStrength';

type Step = 'form' | 'verify-email';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useCustomer();
  const [step, setStep] = useState<Step>('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  function startCountdown(seconds = 60) {
    setResendCountdown(seconds);
    let count = seconds;
    const id = setInterval(() => {
      count -= 1;
      setResendCountdown(count);
      if (count <= 0) clearInterval(id);
    }, 1000);
  }

  async function sendOtp(email: string) {
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json() as { success: boolean; message?: string };
    if (!data.success) throw new Error(data.message ?? 'Failed to send code.');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!isPasswordValid(form.password)) {
      setError('Password does not meet all requirements.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(form.email);
      setRegisteredEmail(form.email);
      setOtpCode('');
      setOtpError(null);
      startCountdown(60);
      setStep('verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  async function handleResend() {
    setResending(true);
    try {
      await sendOtp(registeredEmail);
      startCountdown(60);
    } catch {
      // silently ignore — user can try again
    } finally {
      setResending(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    setOtpError(null);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, otp: otpCode }),
      });
      const data = await res.json() as { success: boolean; verified?: boolean; message?: string };
      if (!data.success || !data.verified) {
        setOtpError(data.message ?? 'Invalid or expired code.');
        return;
      }

      setVerifying(false);
      setCreating(true);
      try {
        await register({
          email: registeredEmail,
          first_name: form.first_name,
          last_name: form.last_name,
          password: form.password,
        });
        router.push('/account');
      } catch (err) {
        const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
        const isDuplicate =
          msg.includes('exist') ||
          msg.includes('already') ||
          msg.includes('duplicate') ||
          msg.includes('taken') ||
          msg.includes('conflict') ||
          msg.includes('409');
        setOtpError(
          isDuplicate
            ? 'An account with this email already exists. Please sign in instead.'
            : 'Could not create your account. Please try again.',
        );
        setCreating(false);
      }
    } catch {
      setOtpError('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  }

  if (step === 'verify-email') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold mb-2">Check your inbox</h1>
          <p className="text-gray-500 text-sm mb-1">We sent a 6-digit code to</p>
          <p className="font-semibold text-sm mb-6">{registeredEmail}</p>

          <input
            value={otpCode}
            onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(null); }}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="w-full text-center tracking-[0.5em] text-lg border rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          {otpError && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {otpError}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying || creating || otpCode.length !== 6}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors mb-4"
          >
            {creating ? 'Creating your account…' : verifying ? 'Verifying…' : 'Verify & Create Account'}
          </button>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending || resendCountdown > 0}
              className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : resending
                ? 'Sending…'
                : "Didn't receive it? Resend"}
            </button>

            <div>
              <Link
                href="/account/login"
                className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-500 text-sm mb-8">Join Soft Solutions Store today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                autoComplete="given-name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Mwangi"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password && <PasswordStrength password={form.password} />}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirm_password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Repeat your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isPasswordValid(form.password)}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending verification code…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/account/login" className="text-gray-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
