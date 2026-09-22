"use client";

interface Props {
  variant: "ssn" | "bank";
}

/**
 * Trust markers rendered beside the SSN and bank sections:
 * encryption statement, licensing statement, security badge.
 */
export function TrustMarkers({ variant }: Props) {
  const encryption =
    variant === "ssn"
      ? "Your Social Security number is encrypted with AES-256 the moment you submit it, and stored separately from its encryption key."
      : "Your account and routing numbers are encrypted with AES-256 and tokenised. Staff see only the last 4 digits.";

  return (
    <aside
      aria-label="Security information"
      className="rounded-xl border border-brand-200 bg-brand-50/60 p-4"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 text-xl">
          {variant === "ssn" ? "🔒" : "🏦"}
        </span>
        <div className="space-y-2 text-xs leading-relaxed text-brand-900">
          <p className="font-semibold">
            {variant === "ssn"
              ? "This information is encrypted"
              : "Your bank details are protected"}
          </p>
          <p>{encryption}</p>
          <p>
            New Loans, LLC is a licensed consumer lender (NMLS #0000000). We are
            examined by state banking regulators and follow the GLBA Safeguards
            Rule.
          </p>
          <p>
            {variant === "bank"
              ? "Your bank sign-in is only ever entered on our secure verification page, which our emails and your status page link to. We never ask for it by reply, over the phone or by text."
              : "We never display your full Social Security number back to you, and we never send it by email."}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge>256-bit TLS</Badge>
            <Badge>AES-256 at rest</Badge>
            <Badge>SOC 2 controls</Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-brand-300 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-800">
      {children}
    </span>
  );
}
