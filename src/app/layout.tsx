import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'sonner';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

const siteName = process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Soft Solutions Store';
const description =
  'Shop consumer electronics and tech in Kenya from Soft Solutions Store — fast delivery, secure checkout with M-Pesa or cash on delivery.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://store.softsolutions.co.ke'),
  title: {
    default: `${siteName} — Online Shopping in Kenya`,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: ['Soft Solutions', 'online store Kenya', 'electronics Kenya', 'M-Pesa shopping', 'buy gadgets Kenya'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: `${siteName} — Online Shopping in Kenya`,
    description,
    siteName,
    locale: 'en_KE',
    type: 'website',
    images: [{ url: '/soft-solutions-logo-light.png', width: 721, height: 240, alt: siteName }],
  },
  twitter: {
    card: 'summary',
    title: `${siteName} — Online Shopping in Kenya`,
    description,
  },
};

const GA_MEASUREMENT_ID = process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-white flex flex-col`}>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="bottom-right" richColors closeButton />
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
