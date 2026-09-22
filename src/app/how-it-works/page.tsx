import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader, SectionHeading } from '@/components/Container';
import { CtaBand } from '@/components/CtaBand';
import { SITE, money } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Three steps from application to funding. Checking your rate uses a soft credit inquiry and will not affect your credit score.',
};

const STEPS = [
  {
    n: 1,
    title: 'Tell us what you need',
    time: 'About 3 minutes',
    body: `Choose an amount between ${money(SITE.amountMin)} and ${money(SITE.amountMax)} and a term between 12 and 48 months, all at our flat ${SITE.apr}% APR. We ask for your contact details, where you live, and your income - enough to check your eligibility, and no more.`,
    points: [
      'We run a soft credit inquiry, which does not affect your credit score',
      'We do not ask for your Social Security number at this stage',
      'Your answers save as you go, and we email you a link to come back to',
    ],
  },
  {
    n: 2,
    title: 'Verify who you are',
    time: 'About 1 minute',
    body: 'If you pre-qualify, we confirm your identity so we can make a final decision. Federal law requires us to verify the identity of everyone we lend to.',
    points: [
      'This is the only point at which we make a hard credit inquiry, and we tell you first',
      'Your Social Security and licence numbers are encrypted the moment you submit them',
      'We never display them back to you and never send them by email',
    ],
  },
  {
    n: 3,
    title: 'Add your bank and get funded',
    time: 'About 1 minute',
    body: 'Once you are approved, tell us which account to deposit into, then complete bank verification from the link we email you or from your status page.',
    points: [
      'Your bank sign-in is only ever entered on our secure verification page - never by reply, phone or text',
      'You authorise the deposit and the repayment schedule before anything moves',
      'Most deposits arrive within one business day of verification',
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        title="How it works"
        lead="Three steps, each one saved on its own. If you stop partway, nothing is lost and we email you a link back to exactly where you were."
      />

      <Container className="py-16 sm:py-20">
        <ol className="space-y-12">
          {STEPS.map((step) => (
            <li key={step.n} className="grid gap-6 lg:grid-cols-[auto_1fr]">
              <div className="flex items-start gap-4 lg:w-48">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-900 text-lg font-bold text-white">
                  {step.n}
                </span>
                <span className="mt-2.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                  {step.time}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
                  {step.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                  {step.body}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {step.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                      </svg>
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Container>

      <section className="border-y border-slate-200 bg-sand">
        <Container className="py-16 sm:py-20">
          <SectionHeading
            title="What you will need"
            lead="Have these to hand and the whole thing takes about five minutes."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { h: 'Step 1', items: ['Your address and how long you have lived there', 'Your employment status and take-home pay', 'How often you are paid'] },
              { h: 'Step 2', items: ['Your Social Security number', "Your driver's licence number", 'The issuing state and expiry date'] },
              { h: 'Step 3', items: ['Your bank routing number', 'Your account number', 'Whether it is checking or savings'] },
            ].map((group) => (
              <div key={group.h} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  {group.h}
                </h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
                  {group.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-slate-500">
            You will only be asked for Step 2 details if you pre-qualify, and only for Step 3
            details if you are approved. If we cannot help you, we never collect them.{' '}
            <Link href="/faq" className="underline hover:text-brand-800">
              More questions
            </Link>
            .
          </p>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
