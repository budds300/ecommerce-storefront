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
    <div className="min-h-screen flex">
      <aside className="w-52 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <p className="font-bold">Soft Store</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
