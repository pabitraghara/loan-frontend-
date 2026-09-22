import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader, SectionHeading } from '@/components/Container';
import { CtaBand } from '@/components/CtaBand';
import { SITE, money, money2, monthlyPayment } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Rates & Fees',
  description:
    `One flat ${SITE.apr}% APR for every approved applicant. No application fee, no origination fee and no prepayment penalty.`,
};

const EXAMPLE_AMOUNTS = [2000, 5000, 10000, 20000, 35000, 50000];

const FEES = [
  { fee: 'Application fee', amount: 'None', note: 'Checking your rate and applying are free.' },
  { fee: 'Origination fee', amount: 'None', note: 'We do not deduct anything from your loan proceeds.' },
  { fee: 'Prepayment penalty', amount: 'None', note: 'Pay off early at any time and save the remaining interest.' },
  { fee: 'Late payment fee', amount: 'Up to $15', note: 'Charged after a 10-day grace period. Lower where state law requires.' },
  { fee: 'Returned payment fee', amount: 'Up to $15', note: 'If a scheduled ACH debit is returned unpaid. Lower where state law requires.' },
];

export default function RatesAndFeesPage() {
  return (
    <>
      <PageHeader
        title="Rates & fees"
        lead={`One flat ${SITE.apr}% APR for everyone we approve, set at signing and unchanged for the life of the loan. No application fee, no origination fee, no prepayment penalty.`}
      />

      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Rates"
          title={`One rate: ${SITE.apr}% APR, fixed`}
          lead="We do not price by credit tier. Every approved applicant pays the same fixed rate, in every state we lend in, and it never changes over the life of the loan."
        />

        <div className="mt-10 rounded-xl border border-brand-300 bg-brand-50 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
            Annual Percentage Rate
          </p>
          <p className="mt-2 text-6xl font-semibold tracking-tight text-brand-900">
            {SITE.apr}%
          </p>
          <p className="mt-3 text-sm text-brand-900">
            Fixed for the whole term &middot; Same rate in {SITE.statesAvailable}
          </p>
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">
              Monthly payment by loan amount and term at {SITE.apr}% APR
            </caption>
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wider text-slate-500">
                <th scope="col" className="pb-3 font-semibold">Loan amount</th>
                <th scope="col" className="pb-3 text-right font-semibold">12 months</th>
                <th scope="col" className="pb-3 text-right font-semibold">24 months</th>
                <th scope="col" className="pb-3 text-right font-semibold">36 months</th>
                <th scope="col" className="pb-3 text-right font-semibold">48 months</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {EXAMPLE_AMOUNTS.map((amount) => (
                <tr key={amount}>
                  <th scope="row" className="py-4 text-left font-semibold text-brand-900">
                    {money(amount)}
                  </th>
                  {[12, 24, 36, 48].map((months) => (
                    <td key={months} className="py-4 text-right tabular-nums text-slate-700">
                      {/* The 48-month term is not offered below $5,000. */}
                      {months === 48 && amount < 5000
                        ? <span className="text-slate-300">-</span>
                        : money2(monthlyPayment(amount, months))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-500">
          These are illustrations, not an offer of credit. Approval, the amount and the term are
          still subject to underwriting and affordability. A small number of states cap consumer
          loan APRs below {SITE.apr}%; where that applies, your rate is the lower state cap.
        </p>
      </Container>

      <section className="border-y border-slate-200 bg-sand">
        <Container className="py-16 sm:py-20">
          <SectionHeading eyebrow="Fees" title="Every fee we charge" lead="This is the complete list. There are no others." />

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">Complete schedule of fees</caption>
              <thead>
                <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th scope="col" className="pb-3 font-semibold">Fee</th>
                  <th scope="col" className="pb-3 font-semibold">Amount</th>
                  <th scope="col" className="pb-3 font-semibold">When it applies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {FEES.map((f) => (
                  <tr key={f.fee}>
                    <th scope="row" className="py-4 text-left font-semibold text-brand-900">
                      {f.fee}
                    </th>
                    <td className="py-4 font-medium text-slate-800">{f.amount}</td>
                    <td className="py-4 leading-relaxed text-slate-600">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <SectionHeading eyebrow="Terms" title="Amounts and terms available" />

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { label: 'Loan amount', value: `${money(SITE.amountMin)} - ${money(SITE.amountMax)}`, note: 'In $500 increments, on the same terms in every state we lend in.' },
            { label: 'Repayment term', value: '12 - 48 months', note: 'The 48-month term is available on loans of $5,000 and above.' },
            { label: 'Payment schedule', value: 'Monthly', note: 'Collected by ACH from the account you nominate, on the same date each month.' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-brand-900">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border-l-4 border-brand-500 bg-brand-50 p-6">
          <h3 className="text-sm font-semibold text-brand-900">Representative example</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-900">
            A {money(SITE.example.amount)} loan over {SITE.example.termMonths} months at{' '}
            {SITE.example.apr}% APR has {SITE.example.termMonths} monthly payments of{' '}
            {money2(SITE.example.payment)} and a total amount repayable of{' '}
            {money2(SITE.example.total)}.
          </p>
        </div>

        <p className="mt-8 text-sm text-slate-600">
          Want the rate that actually applies to you?{' '}
          <Link href="/apply" className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900">
            Check your rate
          </Link>{' '}
          - it uses a soft credit inquiry and will not affect your score.
        </p>
      </Container>

      <CtaBand />
    </>
  );
}
