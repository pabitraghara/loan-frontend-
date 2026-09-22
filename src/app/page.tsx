import Link from 'next/link';
import { Container, SectionHeading } from '@/components/Container';
import { CtaBand } from '@/components/CtaBand';
import { SITE, money, money2, monthlyPayment } from '@/lib/site';

const EXAMPLE_AMOUNTS = [5000, 10000, 20000, 35000];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-sand">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-800">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              Direct lender &middot; All 50 states &middot; No origination fee
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
              Personal loans from{' '}
              <span className="whitespace-nowrap">{money(SITE.amountMin)}</span> to{' '}
              <span className="whitespace-nowrap">{money(SITE.amountMax)}</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              One fixed monthly payment over 12 to 48 months, at a flat {SITE.apr}% APR for
              everyone we approve. Find out what you qualify for in about three minutes, with a
              soft credit check that will not affect your score.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="rounded-lg bg-brand-600 px-8 py-4 text-center text-base font-semibold text-white transition hover:bg-brand-700"
              >
                Check my rate
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-slate-300 bg-white px-8 py-4 text-center text-base font-semibold text-slate-700 transition hover:border-slate-400"
              >
                How it works
              </Link>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                `Flat ${SITE.apr}% APR - the same rate for every approved applicant`,
                'No origination fee and no prepayment penalty',
                'Available in all 50 states and Washington, D.C.',
                'Checking your rate does not affect your credit score',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Estimate card - concrete numbers rather than a stock photo. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Example monthly payments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              At our flat {SITE.apr}% APR. No credit-based pricing tiers.
            </p>

            <table className="mt-6 w-full text-sm">
              <caption className="sr-only">
                Example monthly payments by loan amount and term at {SITE.apr}% APR
              </caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th scope="col" className="pb-2 font-semibold">Amount</th>
                  <th scope="col" className="pb-2 text-right font-semibold">24 mo</th>
                  <th scope="col" className="pb-2 text-right font-semibold">36 mo</th>
                  <th scope="col" className="pb-2 text-right font-semibold">48 mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EXAMPLE_AMOUNTS.map((amount) => (
                  <tr key={amount}>
                    <th scope="row" className="py-3 text-left font-semibold text-brand-900">
                      {money(amount)}
                    </th>
                    {[24, 36, 48].map((months) => (
                      <td key={months} className="py-3 text-right tabular-nums text-slate-700">
                        {money2(monthlyPayment(amount, months))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-5 text-xs leading-relaxed text-slate-500">
              Illustration only, not an offer of credit. All approved loans carry the same fixed
              {' '}{SITE.apr}% APR, subject to any lower cap your state imposes.
            </p>

            <Link
              href="/apply"
              className="mt-5 block rounded-lg bg-brand-50 px-5 py-3 text-center text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
            >
              See my actual rate &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ trust bar */}
      <section className="border-b border-slate-200 bg-white">
        <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { stat: `${money(SITE.amountMin)}-${money(SITE.amountMax)}`, label: 'Loan amounts' },
            { stat: '50 states + DC', label: 'Where we lend' },
            { stat: `${SITE.apr}% APR`, label: 'Fixed, same for everyone' },
            { stat: '$0', label: 'Origination fee' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-semibold tracking-tight text-brand-900">{item.stat}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section className="bg-sand">
        <Container className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, and you keep your place at every one"
            lead="Each step saves on its own. Step away and we email you a link that picks up exactly where you stopped."
          />

          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                n: 1,
                title: 'Tell us what you need',
                body: 'Your loan amount, a few details about you, and your income. We run a soft credit check to see what you qualify for.',
                note: 'No effect on your credit score',
              },
              {
                n: 2,
                title: 'Verify who you are',
                body: 'If you pre-qualify, confirm your identity so we can make a final decision. This is the only point at which we make a hard inquiry.',
                note: 'Encrypted and never shown back to you',
              },
              {
                n: 3,
                title: 'Get funded',
                body: 'Once approved, add the account where you want the money and confirm it is yours. Most deposits land the next business day.',
                note: 'You choose the account',
              },
            ].map((step) => (
              <li key={step.n} className="rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-brand-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                <p className="mt-4 flex items-start gap-2 text-xs font-medium text-brand-700">
                  <CheckIcon />
                  {step.note}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* -------------------------------------------------------- reasons */}
      <section className="bg-white">
        <Container className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="Why borrow from us"
            title="A direct lender, not a lead broker"
            lead="We underwrite and fund the loans ourselves. Your application is not sold on to a network of lenders who will all call you."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'No fees to apply',
                body: 'No application fee, no origination fee, and no penalty for paying your loan off early.',
              },
              {
                title: `One rate: ${SITE.apr}% APR`,
                body: 'Everyone we approve gets the same fixed rate. No credit-tier pricing, and it never changes over the term.',
              },
              {
                title: 'Available nationwide',
                body: 'We lend in all 50 states and the District of Columbia, on the same terms.',
              },
              {
                title: 'Clear decisions',
                body: 'If we decline you, we tell you why in writing, as the Equal Credit Opportunity Act requires.',
              },
              {
                title: 'Your data stays protected',
                body: 'Social Security and bank details are encrypted with AES-256. Our own staff see only the last four digits.',
              },
              {
                title: 'Real people on the phone',
                body: `Call ${SITE.supportPhone} and speak to someone who can see your application and finish it with you.`,
              },
              {
                title: 'No surprise contact',
                body: 'We contact you about your application. We do not sell your details to marketing partners without your consent.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-brand-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- uses / FAQ */}
      <section className="border-y border-slate-200 bg-sand">
        <Container className="grid gap-12 py-16 lg:grid-cols-2 sm:py-20">
          <div>
            <SectionHeading eyebrow="What people borrow for" title="Common reasons" />
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                'Debt consolidation',
                'Medical or dental bills',
                'Home improvement',
                'Auto repair',
                'Moving costs',
                'Wedding expenses',
                'Major purchase',
                'Emergency expenses',
              ].map((use) => (
                <li key={use} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckIcon />
                  <span>{use}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/apply"
              className="mt-8 inline-block text-sm font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
            >
              Start your application &rarr;
            </Link>
          </div>

          <div>
            <SectionHeading eyebrow="Common questions" title="Before you apply" />
            <dl className="mt-8 space-y-5">
              {[
                {
                  q: 'Will checking my rate hurt my credit?',
                  a: 'No. Pre-qualification uses a soft inquiry, visible only to you. A hard inquiry happens only if you continue to a full application, and we tell you before it does.',
                },
                {
                  q: 'How quickly will I get the money?',
                  a: 'Most approved loans are deposited within one business day of you confirming your bank account.',
                },
                {
                  q: 'What rate will I pay?',
                  a: 'A flat 10% APR. Everyone we approve gets the same fixed rate, whatever their credit profile and whichever state they live in.',
                },
              ].map((item) => (
                <div key={item.q} className="rounded-xl border border-slate-200 bg-white p-5">
                  <dt className="text-sm font-semibold text-brand-900">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/faq"
              className="mt-6 inline-block text-sm font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
            >
              Read all questions &rarr;
            </Link>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
