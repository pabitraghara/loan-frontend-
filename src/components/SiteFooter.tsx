import Link from 'next/link';
import { LEGAL_NAV, MAIN_NAV, SECONDARY_LEGAL_NAV, SITE, money, money2 } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-white"
              >
                R
              </span>
              <span className="text-lg font-bold tracking-tight text-brand-900">{SITE.brand}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Personal loans from {money(SITE.amountMin)} to {money(SITE.amountMax)} at a flat
              {' '}{SITE.apr}% APR, made directly by us. No origination fee, no prepayment penalty.
            </p>
            <p className="text-xs text-slate-500">{SITE.nmls}</p>
          </div>

          <nav aria-label="Company">
            <h2 className="text-sm font-semibold text-brand-900">Company</h2>
            <ul className="mt-3 space-y-2">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-slate-600 hover:text-brand-800">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="text-sm font-semibold text-brand-900">Legal</h2>
            <ul className="mt-3 space-y-2">
              {LEGAL_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-slate-600 hover:text-brand-800">
                    {item.label}
                  </Link>
                </li>
              ))}
              {SECONDARY_LEGAL_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-slate-600 hover:text-brand-800">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-brand-900">Contact</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href={`tel:${SITE.supportPhone.replace(/\D/g, '')}`}
                  className="font-semibold text-brand-800 hover:text-brand-900"
                >
                  {SITE.supportPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.supportEmail}`} className="hover:text-brand-800">
                  {SITE.supportEmail}
                </a>
              </li>
              <li className="text-xs leading-relaxed text-slate-500">{SITE.hours}</li>
              <li className="text-xs leading-relaxed text-slate-500">{SITE.address}</li>
            </ul>
          </div>
        </div>

        {/* Required disclosures. Keep the representative example in step with
            the amortisation the API actually quotes. */}
        <div className="mt-10 space-y-3 border-t border-slate-200 pt-8 text-xs leading-relaxed text-slate-500">
          <p>
            <strong className="text-slate-600">Representative example:</strong> a{' '}
            {money(SITE.example.amount)} loan over {SITE.example.termMonths} months at{' '}
            {SITE.example.apr}% APR has {SITE.example.termMonths} monthly payments of{' '}
            {money2(SITE.example.payment)} and a total amount repayable of{' '}
            {money2(SITE.example.total)}. All approved loans carry the same fixed {SITE.apr}%
            APR, whatever your credit profile, subject to any lower cap your state imposes.
          </p>
          <p>
            Checking whether you pre-qualify uses a soft credit inquiry, which does not affect
            your credit score. If you continue to a full application, we make a hard inquiry,
            which may affect your score. All loans are subject to credit approval, identity and
            income verification. We lend in {SITE.statesAvailable}.
          </p>
          <p>
            {SITE.brand}, LLC is a direct lender. We do not sell your application to a network
            of lenders. See our{' '}
            <Link href="/legal/direct-lender" className="underline hover:text-brand-800">
              Direct Lender Disclosure
            </Link>{' '}
            and{' '}
            <Link href="/legal/fair-lending" className="underline hover:text-brand-800">
              Fair Lending Statement
            </Link>
            .
          </p>
          <p className="pt-2">
            &copy; {new Date().getFullYear()} {SITE.brand}, LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
