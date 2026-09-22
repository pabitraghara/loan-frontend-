import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/Container";
import { LEGAL_NAV, SECONDARY_LEGAL_NAV, SITE, money } from "@/lib/site";

/**
 * Legal pages referenced from the consent checkboxes and the footer.
 *
 * The bodies below describe what each document must cover and are written to
 * be accurate about how this system actually behaves. Replace them with
 * counsel-approved text before go-live - and when you do, bump the matching
 * consent version id in the API
 * (loan-backend/src/modules/consents/consent-templates.ts) so existing consent
 * evidence stays tied to the wording it was given against.
 */
interface LegalPage {
  title: string;
  lead: string;
  sections: Array<{ h: string; p: string }>;
}

const PAGES: Record<string, LegalPage> = {
  privacy: {
    title: "Privacy Policy",
    lead: "What we collect, why we collect it, who sees it, and how you control it.",
    sections: [
      {
        h: "What we collect",
        p: `${SITE.brand} collects the information you give us on this application, information from consumer reporting agencies and identity verification services, and technical information about your visit such as your IP address, device, referring page and campaign parameters.`,
      },
      {
        h: "How we use it",
        p: "To verify your identity, assess your application, service any loan you take, prevent fraud, meet our legal obligations, and - where you have separately consented - to contact you about our products.",
      },
      {
        h: "Who we share it with",
        p: "Our servicers, consumer reporting agencies, identity verification providers, payment processors, and regulators where required by law. We do not sell your Social Security number or your bank details.",
      },
      {
        h: "Your rights",
        p:
          "You may request a copy of the information we hold, ask us to correct it, and opt out of certain sharing. Residents of some states have additional rights, including deletion. Email privacy@newloans.com or call " +
          SITE.supportPhone +
          ".",
      },
      {
        h: "How we protect it",
        p: "Your Social Security number, driver’s licence number, routing number and account number are encrypted at the field level with AES-256-GCM. Encryption keys are managed separately from the application database. Staff see only the last four digits by default; revealing a full value requires a specific role and is logged with the user, the time, the application and the IP address.",
      },
      {
        h: "Retention and deletion",
        p: "We retain application records for as long as our legal and record-keeping obligations require. Sensitive identifiers on declined and abandoned applications are destroyed automatically on a defined schedule, while the non-sensitive record is kept for audit and for the reapplication waiting period.",
      },
      {
        h: "Cookies and analytics",
        p: "We use strictly necessary cookies to run the application, and analytics to understand how the site performs. Analytics and session-recording tools are configured to mask sensitive form fields so they never capture a Social Security number or an account number.",
      },
    ],
  },

  terms: {
    title: "Terms of Service",
    lead: "The terms you agree to when you use this site and apply for a loan.",
    sections: [
      {
        h: "Using this site",
        p: "By using this site you agree to these terms. You may use it only for lawful purposes and only to apply on your own behalf. You may not attempt to access another person’s application, probe or scan our systems, or use automated tools to submit applications.",
      },
      {
        h: "Accuracy of your information",
        p: "You certify that the information you submit is true, accurate and complete. Submitting information you know to be false may result in your application being declined, your loan being called due, and referral to the authorities.",
      },
      {
        h: "Electronic signatures and records",
        p: "Checking a consent box and submitting a step constitutes your electronic signature, with the same legal effect as a handwritten one. You consent separately under the E-SIGN Act to receive disclosures electronically, and you may withdraw that consent at any time.",
      },
      {
        h: "No guarantee of credit",
        p: "Pre-qualification is not an offer of credit and does not bind us to lend. All loans are subject to underwriting, identity and income verification, and state availability. We may decline any application.",
      },
      {
        h: "Communications",
        p: "We will contact you about your application at the email address and phone number you provide. Marketing calls and texts require your separate express written consent, which you may revoke at any time without affecting your application or your loan.",
      },
      {
        h: "Availability and changes",
        p: "We may change these terms, our rates, or the products we offer at any time. Changes do not affect the terms of a loan agreement you have already signed. We may suspend the site for maintenance without notice.",
      },
      {
        h: "Limitation of liability and disputes",
        p: "To the fullest extent permitted by law, our liability arising from your use of this site is limited. Disputes relating to a loan are resolved as set out in your loan agreement, which governs over these terms where they conflict.",
      },
    ],
  },

  "fair-lending": {
    title: "Fair Lending Statement",
    lead: "We lend on the merits of the application, and nothing else.",
    sections: [
      {
        h: "Our commitment",
        p: `${SITE.brand}, LLC is committed to fair and responsible lending. We extend credit on the basis of an applicant’s ability and willingness to repay, and on no other basis.`,
      },
      {
        h: "Equal Credit Opportunity Act",
        p: "It is illegal, and it is against our policy, to discriminate against any applicant on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to contract), because all or part of the applicant’s income derives from a public assistance program, or because the applicant has in good faith exercised any right under the Consumer Credit Protection Act.",
      },
      {
        h: "Income you do not have to disclose",
        p: "Alimony, child support and separate maintenance income need not be revealed if you do not wish to have it considered as a basis for repaying this obligation. Our application states this immediately above the income questions, and the fields for that income are optional.",
      },
      {
        h: "How we decide",
        p: "Decisions are driven by documented, consistently applied criteria: verified income, existing obligations, credit history, and the affordability of the requested payment. The same rules are applied to every applicant in the same state.",
      },
      {
        h: "If we decline you",
        p: "You will receive a written adverse action notice stating the specific principal reasons for the decision, and, where a consumer report was used, the name and contact details of the consumer reporting agency along with your right to a free copy of your report and to dispute its accuracy.",
      },
      {
        h: "Servicemembers",
        p: "We comply with the Military Lending Act and the Servicemembers Civil Relief Act. Where a product could price above 36% MAPR we check the covered-borrower database ourselves rather than asking you, and covered borrowers are never charged above the statutory cap.",
      },
      {
        h: "Raising a concern",
        p: `If you believe you have been treated unfairly, contact us at fairlending@newloans.com or call ${SITE.supportPhone}. You may also contact the Consumer Financial Protection Bureau at consumerfinance.gov/complaint or the federal agency identified in your adverse action notice.`,
      },
    ],
  },

  "direct-lender": {
    title: "Direct Lender Disclosure",
    lead: "We make the loans ourselves. Your application is not sold to a network of lenders.",
    sections: [
      {
        h: "We are the lender",
        p: `${SITE.brand}, LLC is a direct lender. We underwrite, approve and fund the loans we offer using our own capital, and we service them ourselves or through a named servicing affiliate. We are not a lead generator, a marketplace, or a matching service.`,
      },
      {
        h: "What that means for you",
        p: "When you apply, your application is reviewed by us. It is not distributed to a panel of third-party lenders, and you will not receive calls from a series of companies you did not contact. You deal with one lender from application to payoff.",
      },
      {
        h: "Who may contact you",
        p: "We, and the affiliates named in the consent you give at the first step, may contact you about your application. Marketing contact requires your separate express written consent, which is never a condition of obtaining a loan and which you may revoke at any time.",
      },
      {
        h: "Licensing",
        p: `${SITE.brand}, LLC holds consumer lending licences in the states where it lends and is examined by those states’ banking regulators. ${SITE.nmls}. We do not lend in every state, and amounts, rates and terms vary by state.`,
      },
      {
        h: "Our product",
        p: `Unsecured personal instalment loans from ${money(SITE.amountMin)} to ${money(SITE.amountMax)}, repayable over 12 to 48 months at a flat ${SITE.apr}% APR, with no application fee, no origination fee and no prepayment penalty. These are not payday loans, title loans, or open-ended lines of credit.`,
      },
      {
        h: "Third parties we do use",
        p: "We use consumer reporting agencies, identity verification services, payment processors and email delivery providers to operate the service. They act on our instructions and are not permitted to use your information for their own marketing.",
      },
    ],
  },

  glba: {
    title: "GLBA Privacy Notice",
    lead: "What we do with your personal financial information, and how to limit some of it.",
    sections: [
      {
        h: "Why we can share",
        p: "Financial companies choose how they share your personal information. Federal law gives consumers the right to limit some but not all sharing. Federal law also requires us to tell you how we collect, share and protect your personal information.",
      },
      {
        h: "What we collect and share",
        p: "Social Security number and income; account balances and payment history; credit history and credit scores; employment information and transaction history.",
      },
      {
        h: "Reasons we share",
        p: "For our everyday business purposes - processing your application, servicing your loan, reporting to credit bureaus, and responding to court orders and legal investigations; for our own marketing; for joint marketing with other financial companies; and with affiliates and non-affiliates for their own marketing. You can limit the last two.",
      },
      {
        h: "To limit our sharing",
        p: `Call ${SITE.supportPhone}, email privacy@newloans.com, or use the opt-out form. If you are a new customer, we may share your information for 30 days from the date we sent this notice while your request is processed. Your choice stays in effect until you change it.`,
      },
      {
        h: "How we protect your information",
        p: "We maintain physical, electronic and procedural safeguards that comply with federal law, including field-level encryption of sensitive identifiers, role-based access control, logging of every access to unmasked data, and an automated retention and purge schedule.",
      },
    ],
  },

  partners: {
    title: "Marketing Partners",
    lead: "The parties named in the consent you give at the first step.",
    sections: [
      {
        h: "Parties named in your TCPA consent",
        p: `${SITE.brand}, LLC; NewLending Partners Network; and NewFinancial Servicing, LLC. These are the only parties that may contact you at the number you provide on the strength of that consent.`,
      },
      {
        h: "What the consent covers",
        p: "Calls and text messages to the number you gave us, including by automatic telephone dialing system and by artificial or prerecorded voice, for marketing, servicing and application purposes. Message frequency varies and message and data rates may apply.",
      },
      {
        h: "It is never a condition",
        p:
          "Your consent is not a condition of purchasing any property, goods or services. You can apply without it by calling " +
          SITE.supportPhone +
          " instead.",
      },
      {
        h: "Revoking consent",
        p:
          "Reply STOP to any text message, call " +
          SITE.supportPhone +
          ", or email optout@newloans.com. Revoking marketing consent does not affect your application or any loan you already hold.",
      },
    ],
  },

  "opt-out": {
    title: "Do Not Share My Information",
    lead: "How to limit the sharing of your information, and what that does and does not stop.",
    sections: [
      {
        h: "How to opt out",
        p: `Call ${SITE.supportPhone} or email privacy@newloans.com with your name, your application reference, and the last four digits of your Social Security number. Never send your full Social Security number by email.`,
      },
      {
        h: "What opting out does",
        p: "It stops us sharing your information with affiliates and non-affiliated third parties for their own marketing purposes, and stops our own marketing contact.",
      },
      {
        h: "What it does not do",
        p: "It does not stop the sharing needed to process your application, service your loan, report to credit bureaus, prevent fraud, or meet our legal and regulatory obligations. We will still contact you about an application or a loan you hold.",
      },
      {
        h: "How long it takes",
        p: "We action requests within 30 days. Your choice stays in effect until you tell us otherwise, and applies to everyone on a joint account unless you tell us to treat you separately.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const page = PAGES[params.slug];
  return page
    ? { title: page.title, description: page.lead }
    : { title: "Not found" };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const page = PAGES[params.slug];
  if (!page) notFound();

  const allLinks = [...LEGAL_NAV, ...SECONDARY_LEGAL_NAV];

  return (
    <>
      <PageHeader title={page.title} lead={page.lead} />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_16rem]">
          <article className="max-w-3xl">
            <p className="text-sm text-slate-500">
              Last updated{" "}
              {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>

            <div className="mt-8 space-y-8">
              {page.sections.map((s) => (
                <section key={s.h}>
                  <h2 className="text-lg font-semibold text-brand-900">
                    {s.h}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {s.p}
                  </p>
                </section>
              ))}
            </div>

            <p className="mt-12 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              This page is written to describe how the application actually
              behaves. Replace it with your counsel-approved text before launch,
              and bump the matching consent version id in the API so existing
              consent evidence stays tied to the wording it was given against.
            </p>
          </article>

          <nav
            aria-label="Other legal documents"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Other documents
            </h2>
            <ul className="mt-3 space-y-2">
              {allLinks
                .filter((l) => l.href !== `/legal/${params.slug}`)
                .map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-600 hover:text-brand-800"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </Container>
    </>
  );
}
