import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import HeaderFooterWrapper from '@/components/layout/HeaderFooterWrapper';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | DEXON International',
    default: 'DEXON International | Premium B2B Hardware & Kitchen Accessories',
  },
  description: 'Premium soft-close telescopic slides, concealed hinges, modular kitchen corner solutions, and profile handles by DEXON International. Wholesale architectural hardware supplies.',
  keywords: ['kitchen hardware', 'drawer slides', 'telescopic channels', 'soft close hinges', 'modular kitchen accessories', 'architectural fittings', 'profile handles', 'DEXON'],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'DEXON International | B2B Kitchen Accessories & Hardware',
    description: 'Premium hardware fittings and organizers for modular kitchens and furniture designers.',
    url: '/',
    siteName: 'DEXON International',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900 font-outfit">
        <AuthProvider>
          <CartProvider>
            <HeaderFooterWrapper>
              {children}
            </HeaderFooterWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
