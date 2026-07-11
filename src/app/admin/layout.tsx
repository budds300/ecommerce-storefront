'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearAdminToken } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/products', label: 'Products' },
  ];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <aside className="bg-gray-900 text-white flex flex-col sm:w-52 sm:flex-shrink-0">
        <div className="flex items-center justify-between p-4 sm:border-b sm:border-gray-700">
          <div>
            <p className="font-bold">Soft Store</p>
            <p className="text-xs text-gray-400 hidden sm:block">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors sm:hidden"
          >
            Sign out
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 sm:flex-1 sm:flex-col sm:gap-1 sm:p-4 sm:pb-4 sm:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 whitespace-nowrap block px-3 py-2 rounded text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
