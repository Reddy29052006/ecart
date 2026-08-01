import type { Metadata } from 'next';
import { DM_Serif_Display, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ECART — Digital Garden Marketplace',
    template: '%s | ECART',
  },
  description:
    'A curated marketplace for organic, artisanal, and sustainably crafted goods. Discover unique products from independent vendors.',
  keywords: ['organic', 'artisan', 'sustainable', 'marketplace', 'handcrafted'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${manrope.variable}`}>
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AuthProvider>
          {/* Skip-to-content accessibility link — CSS-only (no JS handlers) */}
          <a
            href="#main-content"
            className="skip-link"
          >
            Skip to main content
          </a>

          <Header />

          <main
            id="main-content"
            style={{ flex: 1, minHeight: 0 }}
            tabIndex={-1}
          >
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
