'use client';

import { SITE, money, money2, monthlyPayment } from '@/lib/site';

interface Props {
  amount: number;
  termMonths: number | '';
  /** Set once underwriting has priced the loan. */
  approved?: boolean;
  step: 1 | 2 | 3;
}

/**
 * Live quote rail.
 *
 * A loan application that never shows the monthly payment makes the applicant
 * guess at the only number they actually care about. This recomputes on every
 * amount/term change using the same amortisation the API quotes with.
 */
export function QuoteSummary({ amount, termMonths, approved, step }: Props) {
  const term = typeof termMonths === 'number' ? termMonths : null;
  const payment = term ? monthlyPayment(amount, term) : null;
  const totalRepayable = payment && term ? payment * term : null;

  return (
    <aside className="lg:sticky lg:top-24" aria-label="Your loan summary">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-brand-900 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">
            {approved ? 'Your approved loan' : 'Your selection'}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {money(amount)}
          </p>
        </div>

        <dl className="divide-y divide-slate-100 px-5">
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-slate-500">Monthly payment</dt>
            <dd className="text-xl font-semibold tabular-nums text-brand-900">
              {payment ? money2(payment) : <span className="text-slate-300">-</span>}
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-slate-500">Term</dt>
            <dd className="text-sm font-medium text-slate-800">
              {term ? `${term} months` : <span className="text-slate-300">Not chosen yet</span>}
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-slate-500">APR</dt>
            <dd className="text-sm font-medium text-slate-800">{SITE.apr}% fixed</dd>
          </div>
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-slate-500">Total repayable</dt>
            <dd className="text-sm font-medium text-slate-800">
              {totalRepayable ? money2(totalRepayable) : <span className="text-slate-300">-</span>}
            </dd>
          </div>
        </dl>

        <p className="border-t border-slate-100 px-5 py-3 text-xs leading-relaxed text-slate-500">
          {approved
            ? 'These are your final approved terms.'
            : 'An estimate, not an offer of credit. Your final terms are confirmed after review.'}
        </p>
      </div>

      <ul className="mt-4 space-y-2.5 rounded-2xl border border-slate-200 bg-white p-5">
        {[
          step === 1
            ? 'Checking your rate uses a soft inquiry - no effect on your score'
            : 'Your details are encrypted with AES-256 the moment you submit them',
          'No origination fee and no prepayment penalty',
          'Your progress saves at every step - you can finish later',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
            </svg>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 px-1 text-xs leading-relaxed text-slate-500">
        Stuck? Call{' '}
        <a
          href={`tel:${SITE.supportPhone.replace(/\D/g, '')}`}
          className="font-semibold text-brand-700 hover:text-brand-900"
        >
          {SITE.supportPhone}
        </a>{' '}
        and we will finish it with you.
      </p>
    </aside>
  );
}

/** Compact version pinned to the bottom of the viewport on small screens. */
export function QuoteBar({ amount, termMonths }: { amount: number; termMonths: number | '' }) {
  const term = typeof termMonths === 'number' ? termMonths : null;
  const payment = term ? monthlyPayment(amount, term) : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Borrowing</p>
          <p className="text-base font-semibold text-brand-900">{money(amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Monthly at {SITE.apr}%
          </p>
          <p className="text-base font-semibold text-brand-900">
            {payment ? money2(payment) : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
