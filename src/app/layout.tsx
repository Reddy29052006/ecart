import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-Cart Platform Engine',
  description: 'Modular Monolith Multi-Vendor E-Commerce Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
