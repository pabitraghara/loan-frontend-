import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { CtaBand } from "@/components/CtaBand";
import { SITE, money } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about eligibility, rates, credit checks, funding times, repayment and how we protect your information.",
};

const GROUPS = [
  {
    heading: "Applying",
    items: [
      {
        q: "Will checking my rate affect my credit score?",
        a: "No. Pre-qualification uses a soft credit inquiry, which is visible only to you on your credit file and has no effect on your score. A hard inquiry is made only if you pre-qualify and choose to continue to a full application, and we ask for your authorisation before it happens.",
      },
      {
        q: "How long does the application take?",
        a: "About three minutes for the first step, and roughly five minutes end to end if you have your details to hand. Each step saves independently, so you can stop and come back.",
      },
      {
        q: "What if I close the page partway through?",
        a: "Nothing is lost. We email you a link after the first step that returns you to exactly where you stopped, on any device. Going back to an earlier step never erases what you have already entered.",
      },
      {
        q: "Do I need to give my Social Security number to see my rate?",
        a: "No. We do not ask for it in the first step. It is requested only after you pre-qualify, so if we cannot help you, we never collect it.",
      },
      {
        q: "Can I apply with someone else?",
        a: "Not at present. Every application is for a single borrower applying on their own behalf.",
      },
    ],
  },
  {
    heading: "Eligibility",
    items: [
      {
        q: "What are the basic requirements?",
        a: "You must be at least 18, a US resident in a state where we are licensed, have a verifiable source of income, an active checking or savings account, and a valid email address and US mobile number.",
      },
      {
        q: "Do you lend in my state?",
        a: "Yes. We lend in all 50 states and the District of Columbia, on the same terms and at the same rate. A small number of states cap consumer loan APRs below ours; where that applies you get the lower state cap.",
      },
      {
        q: "Can I apply if I am not employed?",
        a: "Yes. Retirement income, Social Security, disability, and other benefits all count. What matters is a verifiable source of repayment, not a job.",
      },
      {
        q: "Do you have a minimum credit score?",
        a: "We do not publish a cut-off. We look at your income, your existing obligations and your credit history together. Because our rate is flat, a thinner credit file affects whether we can approve you, not what you would pay.",
      },
      {
        q: "I was declined. When can I apply again?",
        a: "We ask that you wait 90 days from your original application date before reapplying. Your decline notice states the date you can apply again.",
      },
    ],
  },
  {
    heading: "Rates, fees and repayment",
    items: [
      {
        q: "How much can I borrow?",
        a: `Between ${money(SITE.amountMin)} and ${money(SITE.amountMax)}, in $500 increments, over 12 to 48 months. The 48-month term is available on loans of $5,000 and above.`,
      },
      {
        q: "What will my rate be?",
        a: `A flat ${SITE.apr}% APR. We do not price by credit tier - everyone we approve gets the same fixed rate, in every state, and it does not change over the life of the loan.`,
      },
      {
        q: "What fees do you charge?",
        a: "No application fee, no origination fee and no prepayment penalty. The only possible charges are a late payment fee and a returned payment fee, both capped at $15 and lower where state law requires.",
      },
      {
        q: "Can I pay my loan off early?",
        a: "Yes, at any time, with no penalty. You only pay the interest accrued up to the day you settle.",
      },
      {
        q: "How are payments collected?",
        a: "By ACH debit from the account you nominate, on the same date each month, under the authorisation you sign at the final step. You can change the account or revoke the authorisation by calling us.",
      },
    ],
  },
  {
    heading: "Funding and your account",
    items: [
      {
        q: "How soon will I get the money?",
        a: "Most approved loans are deposited within one business day of you confirming your bank account. Your own bank may take a little longer to make the funds available.",
      },
      {
        q: "Why do I have to verify my bank account?",
        a: "To confirm the account belongs to you before we send money to it. You will get an email with a verification link straight after the final step, and reminders over the following three days if you have not used it.",
      },
      {
        q: "Do you connect to my online banking?",
        a: "No. We do not use instant account verification - you enter your routing and account numbers directly. To complete bank verification we ask you to confirm your bank sign-in on our secure verification page, which you reach from an email we sent you or from your status page. We never ask for it by reply, over the phone or by text.",
      },
      {
        q: "Can I use a savings account?",
        a: "Yes, checking or savings, as long as it accepts ACH deposits and debits and you are an authorised signer.",
      },
    ],
  },
  {
    heading: "Security and privacy",
    items: [
      {
        q: "How do you protect my information?",
        a: "Your Social Security number, licence number and bank details are encrypted with AES-256 at the field level, with keys managed separately from the application database. Our own staff see only the last four digits, and every time anyone reveals a full value it is logged with their name, the time and their IP address.",
      },
      {
        q: "Will you sell my details to other lenders?",
        a: "No. We are a direct lender, not a lead broker. We do not sell your application to a network of lenders. We share information only as described in our Privacy Policy and GLBA Privacy Notice.",
      },
      {
        q: "How do I stop marketing calls and texts?",
        a: "Reply STOP to any text, call us, or email optout@newloans.com. Consent to be contacted is never a condition of getting a loan.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="Frequently asked questions"
        lead="If your question is not here, call us and a person will answer."
      />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[14rem_1fr]">
          <nav
            aria-label="FAQ sections"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              On this page
            </p>
            <ul className="mt-3 space-y-2">
              {GROUPS.map((g) => (
                <li key={g.heading}>
                  <a
                    href={`#${slug(g.heading)}`}
                    className="text-sm text-slate-600 hover:text-brand-800"
                  >
                    {g.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            {GROUPS.map((group) => (
              <section
                key={group.heading}
                id={slug(group.heading)}
                className="scroll-mt-24"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
                  {group.heading}
                </h2>
                <dl className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                  {group.items.map((item) => (
                    <div key={item.q} className="py-5">
                      <dt className="text-base font-semibold text-brand-900">
                        {item.q}
                      </dt>
                      <dd className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                        {item.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <p className="text-sm text-slate-600">
              Still stuck?{" "}
              <Link
                href="/contact"
                className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
              >
                Get in touch
              </Link>{" "}
              or call {SITE.supportPhone}.
            </p>
          </div>
        </div>
      </Container>

      <CtaBand />
    </>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
