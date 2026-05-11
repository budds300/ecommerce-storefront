'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '@/store/customer';

type State = 'loading' | 'registering' | 'success' | 'error';

interface VerifyResponse {
  valid: boolean;
  email?: string;
  context?: string;
  redirectTo?: string;
  message?: string;
  registerData?: { first_name: string; last_name: string; password: string };
}

function MagicVerifier() {
  const params = useSearchParams();
  const router = useRouter();
  const { register } = useCustomer();
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState('/');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setState('error');
      setMessage('No verification token found in this link.');
      return;
    }

    fetch('/api/magic/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then(async (data: VerifyResponse) => {
        if (!data.valid || !data.email) {
          setState('error');
          setMessage(data.message ?? 'Verification failed.');
          return;
        }

        const dest = data.redirectTo ?? '/account';
        setRedirectTo(dest);

        // Registration context — create the Medusa account now
        if (data.context === 'register' && data.registerData) {
          setState('registering');
          try {
            await register({
              email: data.email,
              first_name: data.registerData.first_name,
              last_name: data.registerData.last_name,
              password: data.registerData.password,
            });
            setState('success');
            setTimeout(() => router.push(dest), 1200);
          } catch (err) {
            const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
            const isDuplicate =
              msg.includes('exist') ||
              msg.includes('already') ||
              msg.includes('duplicate') ||
              msg.includes('taken') ||
              msg.includes('conflict') ||
              msg.includes('409');
            setState('error');
            setMessage(
              isDuplicate
                ? 'An account with this email already exists. Please sign in instead.'
                : 'Could not create your account. Please try registering again.',
            );
          }
          return;
        }

        // Checkout or other contexts — store verified state and redirect
        localStorage.setItem(
          'ml_verified',
          JSON.stringify({ email: data.email, ts: Date.now() }),
        );
        setState('success');
        setTimeout(() => router.push(dest), 1200);
      })
      .catch(() => {
        setState('error');
        setMessage('Could not connect. Please try again.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'loading' || state === 'registering') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {state === 'registering' ? 'Creating your account…' : 'Verifying your email…'}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    const isExistingAccount = message.toLowerCase().includes('already exists');
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-6">{message}</p>
          <div className="space-y-2">
            {isExistingAccount ? (
              <Link
                href="/account/login"
                className="block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/account/register"
                className="block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Try Again
              </Link>
            )}
            <Link href="/" className="block text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-1">All done!</h1>
        <p className="text-gray-500 text-sm mb-5">Taking you there now…</p>
        <Link href={redirectTo} className="text-sm text-gray-400 hover:text-gray-700 underline underline-offset-2">
          Continue manually
        </Link>
      </div>
    </div>
  );
}

export default function MagicPage() {
  return (
    <Suspense>
      <MagicVerifier />
    </Suspense>
  );
}
