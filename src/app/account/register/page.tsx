'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'form' | 'verify-email';

export default function RegisterPage() {
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

  async function sendLink(email: string, registerData: { first_name: string; last_name: string; password: string }) {
    const res = await fetch('/api/magic/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        context: 'register',
        redirectTo: '/account',
        registerData,
      }),
    });
    const data = await res.json() as { success: boolean; message?: string };
    if (!data.success) throw new Error(data.message ?? 'Failed to send link.');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await sendLink(form.email, {
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      });
      setRegisteredEmail(form.email);
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
      await sendLink(registeredEmail, {
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      });
      startCountdown(60);
    } catch {
      // silently ignore — user can try again
    } finally {
      setResending(false);
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
          <p className="text-gray-500 text-sm mb-1">We sent a verification link to</p>
          <p className="font-semibold text-sm mb-6">{registeredEmail}</p>

          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            Click the link in that email to create your account. It expires in 15&nbsp;minutes.
          </p>

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
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Repeat your password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending verification link…' : 'Create Account'}
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
