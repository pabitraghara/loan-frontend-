/** Single source of truth for brand facts used across the marketing pages. */
export const SITE = {
  brand: "New Loans",
  supportPhone: "(800) 555-0143",
  supportEmail: "support@newloans.com",
  nmls: "NMLS #0000000",
  address: "1200 Market Street, Suite 400, Wilmington, DE 19801",
  hours: "Mon-Fri 8am-8pm ET, Sat 9am-5pm ET",

  // Product envelope. Keep in step with the API:
  // loan-backend/src/common/utils/loan-rules.ts
  amountMin: 2000,
  amountMax: 50000,
  termsMonths: [12, 24, 36, 48],

  /**
   * Fixed product APR - one rate for every approved applicant, in every
   * state. Keep in step with DEFAULT_APR in the API
   * (loan-backend/src/common/utils/loan-rules.ts).
   */
  apr: 10,

  /** Available in all 50 states and the District of Columbia. */
  statesAvailable: "all 50 states and Washington, D.C.",

  /** Representative example, computed from the same amortisation formula. */
  example: {
    amount: 10000,
    termMonths: 36,
    apr: 10,
    payment: 322.67,
    total: 11616.12,
  },
} as const;

/** Monthly payment - same amortisation the API quotes with. */
export const monthlyPayment = (
  amount: number,
  months: number,
  apr: number = SITE.apr,
) => {
  const r = apr / 100 / 12;
  if (r === 0) return amount / months;
  const f = Math.pow(1 + r, months);
  return (amount * r * f) / (f - 1);
};

export const MAIN_NAV = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/rates-and-fees", label: "Rates & Fees" },
  { href: "/faq", label: "FAQ" },
  { href: "/loan-status", label: "Loan Status" },
  { href: "/contact", label: "Contact" },
] as const;

export const LEGAL_NAV = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/fair-lending", label: "Fair Lending Statement" },
  { href: "/legal/direct-lender", label: "Direct Lender Disclosure" },
] as const;

export const SECONDARY_LEGAL_NAV = [
  { href: "/legal/glba", label: "GLBA Privacy Notice" },
  { href: "/legal/partners", label: "Marketing Partners" },
  { href: "/legal/opt-out", label: "Do Not Share My Info" },
] as const;

export const money = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const money2 = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
