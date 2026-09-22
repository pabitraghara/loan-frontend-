import Link from 'next/link';
import { Container } from './Container';
import { SITE, money } from '@/lib/site';

export function CtaBand() {
  return (
    <section className="bg-brand-900">
      <Container className="py-14 text-center sm:py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          See your rate in about three minutes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-100">
          Borrow {money(SITE.amountMin)} to {money(SITE.amountMax)} at a flat {SITE.apr}% APR,
          in {SITE.statesAvailable}. Checking your rate uses a soft credit inquiry, so it will
          not affect your credit score.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="w-full rounded-lg bg-white px-8 py-4 text-base font-semibold text-brand-900 transition hover:bg-brand-50 sm:w-auto"
          >
            Check my rate
          </Link>
          <a
            href={`tel:${SITE.supportPhone.replace(/\D/g, '')}`}
            className="w-full rounded-lg border border-brand-400/60 px-8 py-4 text-base font-semibold text-white transition hover:bg-brand-800 sm:w-auto"
          >
            Call {SITE.supportPhone}
          </a>
        </div>
      </Container>
    </section>
  );
}
