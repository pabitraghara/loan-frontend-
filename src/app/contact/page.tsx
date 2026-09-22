import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call ${SITE.supportPhone}, email us, or write to us. ${SITE.hours}.`,
};

const CHANNELS = [
  {
    title: "Applications and general questions",
    phone: SITE.supportPhone,
    email: SITE.supportEmail,
    note: "Questions about applying, your rate, or an application already in progress.",
  },
  {
    title: "Existing loans and payments",
    phone: SITE.supportPhone,
    email: "servicing@newloans.com",
    note: "Payment dates, payoff quotes, changing the account we debit, or hardship.",
  },
  {
    title: "Privacy and data requests",
    phone: SITE.supportPhone,
    email: "privacy@newloans.com",
    note: "Access, correction or deletion requests, and opting out of information sharing.",
  },
  {
    title: "Report a suspicious message",
    phone: SITE.supportPhone,
    email: "security@newloans.com",
    note: "Forward anything claiming to be from us that asks for a password or a full account number.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact us"
        lead="A person answers the phone during opening hours, and they can see your application while you talk."
      />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="rounded-xl border border-brand-300 bg-brand-50 p-6">
              <p className="text-sm font-semibold text-brand-800">Call us</p>
              <a
                href={`tel:${SITE.supportPhone.replace(/\D/g, "")}`}
                className="mt-1 block text-3xl font-semibold tracking-tight text-brand-900 hover:underline"
              >
                {SITE.supportPhone}
              </a>
              <p className="mt-2 text-sm text-brand-900">{SITE.hours}</p>
            </div>

            <dl className="mt-10 divide-y divide-slate-200 border-t border-slate-200">
              {CHANNELS.map((c) => (
                <div
                  key={c.title}
                  className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <dt className="text-base font-semibold text-brand-900">
                      {c.title}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                      {c.note}
                    </dd>
                  </div>
                  <dd className="text-sm sm:text-right">
                    <a
                      href={`mailto:${c.email}`}
                      className="font-medium text-brand-700 hover:text-brand-900"
                    >
                      {c.email}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-5">
              <h2 className="text-sm font-semibold text-amber-900">
                Never send sensitive details by email
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-amber-900">
                Do not email your full Social Security number, your full bank
                account number, or any password - not to us, and not to anyone
                claiming to be us. If you need to give us those details, call
                the number above or use the secure link in your application
                email.
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-brand-900">
                Postal address
              </h2>
              <address className="mt-2 text-sm not-italic leading-relaxed text-slate-600">
                {SITE.brand}, LLC
                <br />
                1200 Market Street, Suite 400
                <br />
                Wilmington, DE 19801
              </address>
              <p className="mt-3 text-xs text-slate-500">{SITE.nmls}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-brand-900">
                Quicker than calling
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/loan-status"
                    className="text-brand-700 hover:text-brand-900"
                  >
                    Check your loan status &rarr;
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-brand-700 hover:text-brand-900"
                  >
                    Read the FAQ &rarr;
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rates-and-fees"
                    className="text-brand-700 hover:text-brand-900"
                  >
                    See rates and fees &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-brand-900">
                Stop marketing contact
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Reply STOP to any text, call us, or email{" "}
                <a
                  href="mailto:optout@newloans.com"
                  className="text-brand-700 hover:text-brand-900"
                >
                  optout@newloans.com
                </a>
                . Consent is never a condition of getting a loan.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
