import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { SITE, money } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    default: `${SITE.brand} - Personal Loans from ${money(SITE.amountMin)} to ${money(SITE.amountMax)}`,
    template: `%s | ${SITE.brand}`,
  },
  description:
    `Personal loans from ${money(SITE.amountMin)} to ${money(SITE.amountMax)} over 12 to 48 months at a flat ${SITE.apr}% APR, ` +
    'available in all 50 states. Checking your rate uses a soft credit inquiry and will not affect your credit score.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
