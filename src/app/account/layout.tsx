'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCustomer } from '@/store/customer';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, isLoading, fetchCustomer } = useCustomer();

  const isAuthPage =
    pathname === '/account/login' || pathname === '/account/register';

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // While loading, don't redirect yet
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated and trying to access a protected account page, redirect
  if (!customer && !isAuthPage) {
    router.replace('/account/login');
    return null;
  }

  // If authenticated and on login/register, redirect to account
  if (customer && isAuthPage) {
    router.replace('/account');
    return null;
  }

  return <>{children}</>;
}
