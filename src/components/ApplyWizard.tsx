"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initTracking } from "@/lib/tracking";
import {
  APPLY_CONSENT_TEMPLATES,
  APPLY_FORM_OPTIONS,
} from "@/lib/apply-form-data";
import { formatCurrency } from "@/lib/format";
import type {
  ConsentTemplate,
  FieldErrors,
  LookupOptions,
  SubmitRequest,
  SubmitRequestPart,
  SubmitResponse,
} from "@/lib/types";
import { ProgressIndicator } from "./ProgressIndicator";
import { QuoteBar, QuoteSummary } from "./QuoteSummary";
import { LeadCertificationScripts } from "./LeadCertificationScripts";
import { Step1, type Step1Snapshot } from "./steps/Step1";
import { Step2, type Step2Snapshot } from "./steps/Step2";
import { Step3, type Step3Snapshot } from "./steps/Step3";

type Outcome =
  | { kind: "none" }
  | { kind: "submitted"; result: SubmitResponse }
  | { kind: "duplicate"; message: string; applicationId?: string };

/** What each screen has contributed to the one request body. */
interface Parts {
  1?: SubmitRequestPart;
  2?: SubmitRequestPart;
  3?: SubmitRequestPart;
}

/** What each screen last looked like, so Back puts it back untouched. */
interface Snapshots {
  1?: Step1Snapshot;
  2?: Step2Snapshot;
  3?: Step3Snapshot;
}

/**
 * The application form: three screens, one submission.
 *
 * Next and Back move between the screens and nothing is posted on the way -
 * the answers live here, in this component, until the applicant presses
 * submit on the last screen.
 *
 * The form is not connected to the API: the options and consent wording are
 * local copies (lib/apply-form-data.ts) and submitting sends nothing anywhere.
 *
 * Nothing is written to browser storage either, so a reload starts a clean
 * form. That is the deliberate trade: no half-finished application anywhere,
 * on the server or in the browser, and nothing to resume.
 *
 * The wizard rather than a screen owns the request, because a field error can
 * come back against any of the three and the form has to be able to reopen
 * the screen the error belongs to with the message on the right field.
 */
export function ApplyWizard() {
  const options = APPLY_FORM_OPTIONS;
  const templates = APPLY_CONSENT_TEMPLATES;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  /**
   * The answers, and what each screen looked like when it was left.
   *
   * Refs rather than state on purpose: these change on every keystroke, and
   * nothing on the page is derived from them while a screen is open. Holding
   * them in state would re-render the whole wizard on each character typed,
   * and would hand each screen a fresh `initial` object as it went.
   */
  const parts = useRef<Parts>({});
  const snapshots = useRef<Snapshots>({});

  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "none" });

  /**
   * Where a failed submit put its errors. Held per screen so the applicant
   * can be sent back to screen 2 with the SSN field marked, rather than left
   * on screen 3 with a message about a field they cannot see.
   */
  const [serverErrors, setServerErrors] = useState<{
    step: 1 | 2 | 3;
    message: string;
    errors: FieldErrors;
  } | null>(null);

  /** Drives the quote rail. Screen 1 pushes changes up as the slider moves. */
  const [quote, setQuote] = useState<{
    amount: number;
    termMonths: number | "";
  }>({ amount: 10000, termMonths: "" });

  const onQuoteChange = useCallback(
    (amount: number, termMonths: number | "") =>
      setQuote({ amount, termMonths }),
    [],
  );

  useEffect(() => {
    initTracking();
  }, []);

  const templatesForStep = useCallback(
    (n: 1 | 2 | 3) => templates.filter((t) => t.step === n),
    [templates],
  );

  // ---------------- the answers live here

  const onStep1Change = useCallback((s: Step1Snapshot) => {
    snapshots.current[1] = s;
  }, []);
  const onStep2Change = useCallback((s: Step2Snapshot) => {
    snapshots.current[2] = s;
  }, []);
  const onStep3Change = useCallback((s: Step3Snapshot) => {
    snapshots.current[3] = s;
  }, []);

  /**
   * Deliberate navigation, which also drops a stale error from an earlier
   * submit - the applicant has just been through the screen it was raised on.
   */
  const goTo = useCallback((target: 1 | 2 | 3) => {
    setStep(target);
    setServerErrors(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onStep1Next = useCallback(
    (part: SubmitRequestPart) => {
      parts.current[1] = part;
      goTo(2);
    },
    [goTo],
  );

  const onStep2Next = useCallback(
    (part: SubmitRequestPart) => {
      parts.current[2] = part;
      goTo(3);
    },
    [goTo],
  );

  // ---------------- the one submit

  /** Everything the applicant entered - kept in the browser, never posted. */
  const onSubmitAll = useCallback(
    async (step3Part: SubmitRequestPart) => {
      parts.current[3] = step3Part;
      setServerErrors(null);

      const answers = {
        ...parts.current[1],
        ...parts.current[2],
        ...step3Part,
      } as SubmitRequest;

      // Not sent to the API - the applicant just sees the confirmation.
      const account = String(answers.accountNumber ?? "");
      setOutcome({
        kind: "submitted",
        result: {
          applicationId: `APP-${Date.now().toString(36).toUpperCase()}`,
          status: "submitted",
          statusLabel: "Application Received",
          loanAmount: answers.loanAmount,
          loanTermMonths: answers.loanTermMonths,
          bankName: answers.bankName ?? null,
          accountNumberMasked: account.slice(-4),
        },
      });
    },
    [],
  );

  const errorsFor = (n: 1 | 2 | 3) =>
    serverErrors?.step === n ? serverErrors.errors : undefined;
  const bannerFor = (n: 1 | 2 | 3) =>
    serverErrors?.step === n ? serverErrors.message : null;

  // ---------------- render

  if (outcome.kind === "duplicate") {
    return (
      <DuplicateScreen
        message={outcome.message}
        applicationId={outcome.applicationId}
      />
    );
  }

  if (outcome.kind === "submitted") {
    return <SubmittedScreen result={outcome.result} />;
  }

  return (
    <>
      <LeadCertificationScripts />

      <ProgressIndicator current={step} onNavigate={goTo} />

      {/* Form on the left, live quote on the right. On narrow screens the
          quote collapses to a pinned bar so the payment is never off-screen. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="min-w-0">
          {step === 1 && (
            <Step1
              options={options}
              consentTemplates={templatesForStep(1)}
              initial={snapshots.current[1]}
              onNext={onStep1Next}
              onChange={onStep1Change}
              submitting={submitting}
              serverErrors={errorsFor(1)}
              serverBanner={bannerFor(1)}
              onQuoteChange={onQuoteChange}
            />
          )}

          {step === 2 && (
            <Step2
              options={options}
              consentTemplates={templatesForStep(2)}
              residenceState={snapshots.current[1]?.state}
              initial={snapshots.current[2]}
              onNext={onStep2Next}
              onChange={onStep2Change}
              onBack={() => goTo(1)}
              submitting={submitting}
              serverErrors={errorsFor(2)}
              serverBanner={bannerFor(2)}
            />
          )}

          {step === 3 && (
            <Step3
              options={options}
              consentTemplates={templatesForStep(3)}
              requestedAmount={quote.amount}
              initial={snapshots.current[3]}
              onSubmit={onSubmitAll}
              onChange={onStep3Change}
              onBack={() => goTo(2)}
              submitting={submitting}
              serverErrors={errorsFor(3)}
              serverBanner={bannerFor(3)}
            />
          )}
        </div>

        <div className="hidden lg:block">
          <QuoteSummary
            amount={quote.amount}
            termMonths={quote.termMonths}
            step={step}
          />
        </div>
      </div>

      <QuoteBar amount={quote.amount} termMonths={quote.termMonths} />
    </>
  );
}

/**
 * One application per applicant. The reference is shown so they can look it
 * up rather than be left wondering which one we already hold.
 */
function DuplicateScreen({
  message,
  applicationId,
}: {
  message: string;
  applicationId?: string;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-brand-900">
        We already have an application for you
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      {applicationId && (
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Your reference: <strong>{applicationId}</strong>
        </p>
      )}
      <a
        href="/loan-status"
        className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Check my application status
      </a>
    </div>
  );
}

/**
 * The end of the form.
 *
 * No decision is made here and none is implied - the application is in, and
 * the one thing still outstanding is the applicant confirming their bank
 * account from the email we have just sent.
 */
function SubmittedScreen({ result }: { result: SubmitResponse }) {
  return (
    <div className="space-y-5 rounded-xl border border-brand-300 bg-white p-6">
      <div className="text-4xl" aria-hidden="true">
        ✅
      </div>
      <h1 className="text-2xl font-semibold text-brand-900">
        Application received
      </h1>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
          Status
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-amber-900">
          {result.statusLabel || "Bank Verification Pending"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          <strong>One last step:</strong> check your email and click the
          verification link to confirm your bank account belongs to you. We
          have just sent it, and we will send reminders over the next three
          days if we do not hear from you.
        </p>
      </div>

      <dl className="divide-y divide-slate-100 rounded-lg bg-slate-50 px-4">
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-sm text-slate-500">Your reference</dt>
          <dd className="text-sm font-semibold text-brand-900">
            {result.applicationId}
          </dd>
        </div>
        {result.loanAmount != null && (
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-slate-500">Amount requested</dt>
            <dd className="text-sm font-medium text-slate-800">
              {formatCurrency(result.loanAmount)}
              {result.loanTermMonths
                ? ` over ${result.loanTermMonths} months`
                : ""}
            </dd>
          </div>
        )}
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-sm text-slate-500">Deposit account</dt>
          <dd className="text-sm font-medium text-slate-800">
            {result.bankName || "Your bank"}, ending{" "}
            {result.accountNumberMasked}
          </dd>
        </div>
      </dl>

      <p className="text-sm leading-relaxed text-slate-600">
        Keep your reference safe - you can check your application on our{" "}
        <a href="/loan-status" className="font-medium text-brand-700 underline">
          Loan Status
        </a>{" "}
        page at any time.
      </p>

      <p className="text-xs leading-relaxed text-slate-500">
        Complete your bank verification only on the page our email link or your
        status page opens. We never ask for your bank sign-in by reply, over the
        phone or by text - if a message does, forward it to
        security@newloans.com.
      </p>
    </div>
  );
}

export { formatCurrency };
