"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiRequestError, API_BASE } from "@/lib/api";
import { getTracking, initTracking } from "@/lib/tracking";
import { formatCurrency, formatCurrency2 } from "@/lib/format";
import type {
  ConsentTemplate,
  LookupOptions,
  Offer,
  ResumeState,
  Step1Response,
  Step2Response,
  Step3Response,
} from "@/lib/types";
import { clearSession, readSession, saveSession } from "@/lib/session";
import { ProgressIndicator } from "./ProgressIndicator";
import { QuoteBar, QuoteSummary } from "./QuoteSummary";
import { LeadCertificationScripts } from "./LeadCertificationScripts";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";

type Outcome =
  | { kind: "none" }
  | { kind: "prequal_declined"; message?: string }
  | { kind: "underwriting_declined" }
  | { kind: "submitted"; result: Step3Response }
  | { kind: "locked_out"; until?: string };

interface Props {
  /** Present when arriving from a resume link. */
  resumed?: ResumeState;
  resumeToken?: string;
}

export function ApplyWizard({ resumed, resumeToken }: Props) {
  const [options, setOptions] = useState<LookupOptions | null>(null);
  const [templates, setTemplates] = useState<ConsentTemplate[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [state, setState] = useState<ResumeState | undefined>(resumed);
  const [token, setToken] = useState<string | undefined>(resumeToken);
  const [step, setStep] = useState<1 | 2 | 3>(
    (resumed?.currentStep as 1 | 2 | 3) ?? 1,
  );
  const [highest, setHighest] = useState(resumed?.highestStepReached ?? 1);
  const [applicationId, setApplicationId] = useState<string | undefined>(
    resumed?.applicationId,
  );
  const [offer, setOffer] = useState<Offer | null>(resumed?.offer ?? null);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "none" });
  const [notice, setNotice] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(!resumed);

  /** Drives the quote rail. Step 1 pushes changes up as the slider moves. */
  const [quote, setQuote] = useState<{
    amount: number;
    termMonths: number | "";
  }>({
    amount: resumed?.step1?.loanAmount ?? 10000,
    termMonths: resumed?.step1?.loanTermMonths ?? "",
  });

  const onQuoteChange = useCallback(
    (amount: number, termMonths: number | "") =>
      setQuote({ amount, termMonths }),
    [],
  );

  const loadForm = useCallback(() => {
    setLoadError(null);
    Promise.all([
      api.get<LookupOptions>("/lookup/options"),
      api.get<ConsentTemplate[]>("/consents/templates"),
    ])
      .then(([o, t]) => {
        setOptions(o);
        setTemplates(t);
      })
      .catch((err) => {
        // A dead end here is the worst possible failure - the applicant sees
        // nothing and we learn nothing. Say what broke and offer a retry.
        const reachable =
          !(err instanceof ApiRequestError) || err.payload.statusCode !== 0;
        setLoadError(
          reachable
            ? "We could not load the application form. Please try again in a moment."
            : "We could not reach our servers. Check your connection and try again.",
        );
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.error(
            `[apply] Failed to load form data from ${API_BASE}. ` +
              "Is the API running, and does NEXT_PUBLIC_API_URL point at it?",
            err,
          );
        }
      });
  }, []);

  useEffect(() => {
    initTracking();
    api
      .post("/applications/session", { tracking: getTracking() })
      .catch(() => undefined);
    loadForm();
  }, [loadForm]);

  /**
   * Restore an application in progress after a reload.
   *
   * Step 1 issues an application id and a resume token; without this the
   * whole thing would be held in React state and a refresh would drop the
   * applicant back to an empty Step 1. The saved answers come from the
   * server, not from browser storage, so Steps 2 and 3 come back masked.
   */
  useEffect(() => {
    if (resumed) return;
    const saved = readSession();
    if (!saved) {
      setRestoring(false);
      return;
    }

    api
      .get<ResumeState>(
        `/applications/resume/${encodeURIComponent(saved.resumeToken)}`,
      )
      .then((s) => {
        setState(s);
        setToken(saved.resumeToken);
        setApplicationId(s.applicationId);
        setHighest(s.highestStepReached);
        setOffer(s.offer);
        setQuote({
          amount: s.offer?.amount ?? s.step1?.loanAmount ?? 10000,
          termMonths: s.offer?.termMonths ?? s.step1?.loanTermMonths ?? "",
        });
        // Land them on the furthest step they can actually act on.
        const target = Math.min(
          Math.max(s.currentStep || 1, 1),
          Math.max(s.highestStepReached || 1, 1),
        ) as 1 | 2 | 3;
        setStep(target);
        if (target > 1) {
          setNotice("Welcome back - we picked up where you left off.");
        }
      })
      .catch(() => {
        // Expired, purged or withdrawn: start clean rather than dead-end.
        clearSession();
      })
      .finally(() => setRestoring(false));
    // Runs once on mount. It must NOT depend on `state`, which it sets -
    // that loops, hammers the resume endpoint until the rate limiter trips,
    // and the failure path then wipes the saved session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const templatesForStep = useCallback(
    (n: 1 | 2 | 3) => templates.filter((t) => t.step === n),
    [templates],
  );

  // ---------------- step transitions

  const onStep1Complete = (result: Step1Response) => {
    setApplicationId(result.applicationId);
    setOffer(result.offer);
    setToken(result.resumeToken);
    if (result.offer) {
      setQuote({
        amount: result.offer.amount,
        termMonths: result.offer.termMonths,
      });
    }

    if (result.prequalified) {
      setHighest((h) => Math.max(h, 2));
      setStep(2);
      saveSession({
        applicationId: result.applicationId,
        resumeToken: result.resumeToken,
        step: 2,
        highestStepReached: 2,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      clearSession();
      setOutcome({ kind: "prequal_declined" });
    }
  };

  const onStep2Complete = (result: Step2Response) => {
    if (result.approved) {
      setOffer(result.offer ?? offer);
      setHighest((h) => Math.max(h, 3));
      setStep(3);
      const nextToken = result.resumeToken ?? token;
      if (nextToken) setToken(nextToken);
      if (result.applicationId && nextToken) {
        saveSession({
          applicationId: result.applicationId,
          resumeToken: nextToken,
          step: 3,
          highestStepReached: 3,
        });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      clearSession();
      setOutcome({ kind: "underwriting_declined" });
    }
  };

  const onStep3Complete = (result: Step3Response) => {
    // Nothing left to resume - verification continues by email.
    clearSession();
    setOutcome({ kind: "submitted", result });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Back-navigation.
   *
   * Everything already entered stays saved server-side, including for someone
   * who reached Step 3 and came back to Step 1. The server also emails a fresh
   * resume link so they can return from anywhere.
   */
  const goToStep = async (target: 1 | 2 | 3) => {
    if (!applicationId) {
      setStep(target);
      return;
    }
    try {
      const res = await api.post<{
        currentStep: number;
        resumeEmailSent: boolean;
        resumeToken?: string;
      }>(`/applications/${applicationId}/go-to-step/${target}`, {
        tracking: getTracking(),
      });
      setStep(target);
      if (res.resumeToken) setToken(res.resumeToken);
      saveSession({
        applicationId,
        resumeToken: res.resumeToken ?? token ?? "",
        step: target,
        highestStepReached: highest,
      });
      setNotice(
        res.resumeEmailSent
          ? "Your progress is saved. We have emailed you a link so you can come back any time."
          : "Your progress is saved.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      // Navigation must not be blocked by a failed nudge email.
      setStep(target);
      if (
        err instanceof ApiRequestError &&
        err.payload.code !== "STEP_NOT_REACHED"
      ) {
        setNotice("Your progress is saved.");
      }
    }
  };

  const step1Initial = useMemo(() => {
    if (!state?.step1) return undefined;
    const s = state.step1;
    return {
      ...s,
      directDeposit:
        s.directDeposit === true
          ? "yes"
          : s.directDeposit === false
            ? "no"
            : "",
      monthlyHousingPayment:
        s.monthlyHousingPayment == null
          ? undefined
          : Number(s.monthlyHousingPayment),
      netMonthlyIncome:
        s.netMonthlyIncome == null ? undefined : Number(s.netMonthlyIncome),
      additionalMonthlyIncome:
        s.additionalMonthlyIncome == null
          ? undefined
          : Number(s.additionalMonthlyIncome),
      loanAmount: Number(s.loanAmount) || undefined,
      loanTermMonths: s.loanTermMonths ?? "",
    } as any;
  }, [state]);

  // ---------------- render

  if (loadError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-300 bg-red-50 p-6"
      >
        <h1 className="text-lg font-semibold text-red-900">
          We could not start your application
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-red-800">{loadError}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadForm}
            className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Try again
          </button>
          <a
            href={`tel:${(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "(800) 555-0143").replace(/\D/g, "")}`}
            className="rounded-lg border border-red-300 bg-white px-6 py-3 text-center text-sm font-semibold text-red-800 transition hover:bg-red-50"
          >
            Apply by phone:{" "}
            {process.env.NEXT_PUBLIC_SUPPORT_PHONE || "(800) 555-0143"}
          </a>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-5 rounded-md bg-red-100 p-3 font-mono text-xs text-red-900">
            dev hint: the form loads from {API_BASE}/api - start the API (npm
            run start:dev in loan-backend) or set NEXT_PUBLIC_API_URL in
            loan-frontend/.env.local
          </p>
        )}
      </div>
    );
  }

  if (!options || restoring) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (
    outcome.kind === "prequal_declined" ||
    outcome.kind === "underwriting_declined"
  ) {
    return <DeclineScreen applicationId={applicationId} />;
  }

  if (outcome.kind === "submitted") {
    return (
      <SubmittedScreen result={outcome.result} applicationId={applicationId!} />
    );
  }

  const railAmount = offer?.amount ?? quote.amount;
  const railTerm = offer?.termMonths ?? quote.termMonths;

  return (
    <>
      <LeadCertificationScripts />

      <ProgressIndicator
        current={step}
        highestReached={highest}
        onNavigate={goToStep}
      />

      {notice && (
        <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          {notice}
        </div>
      )}

      {/* Form on the left, live quote on the right. On narrow screens the
          quote collapses to a pinned bar so the payment is never off-screen. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="min-w-0">
          {step === 1 && (
            <Step1
              options={options}
              consentTemplates={templatesForStep(1)}
              initial={step1Initial}
              applicationId={applicationId}
              onComplete={onStep1Complete}
              onQuoteChange={onQuoteChange}
            />
          )}

          {step === 2 && applicationId && (
            <Step2
              applicationId={applicationId}
              options={options}
              consentTemplates={templatesForStep(2)}
              residenceState={state?.step1?.state}
              onComplete={onStep2Complete}
              onBack={() => goToStep(1)}
            />
          )}

          {step === 3 && applicationId && (
            <Step3
              applicationId={applicationId}
              options={options}
              consentTemplates={templatesForStep(3)}
              offer={offer}
              onComplete={onStep3Complete}
              onBack={() => goToStep(2)}
            />
          )}
        </div>

        <div className="hidden lg:block">
          <QuoteSummary
            amount={railAmount}
            termMonths={railTerm}
            approved={!!offer && step === 3}
            step={step}
          />
        </div>
      </div>

      <QuoteBar amount={railAmount} termMonths={railTerm} />
    </>
  );
}

function DeclineScreen({ applicationId }: { applicationId?: string }) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-brand-900">
        We are not able to move forward right now
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">
        Thank you for considering us. After reviewing the information you
        provided, we cannot offer you a loan at this time.
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        You will receive a written statement of the specific reasons by email,
        as required by the Equal Credit Opportunity Act. If you believe
        something was entered incorrectly, call us on{" "}
        {process.env.NEXT_PUBLIC_SUPPORT_PHONE || "(800) 555-0143"}.
      </p>
      {applicationId && (
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Your reference: <strong>{applicationId}</strong>
        </p>
      )}
    </div>
  );
}

function SubmittedScreen({
  result,
  applicationId,
}: {
  result: Step3Response;
  applicationId: string;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-brand-300 bg-white p-6">
      <div className="text-4xl" aria-hidden="true">
        ✅
      </div>
      <h1 className="text-2xl font-semibold text-brand-900">
        That&apos;s everything we need
      </h1>

      <p className="text-sm leading-relaxed text-slate-600">
        We have your funding details for{" "}
        <strong>{result.bankName || "your bank"}</strong>, account ending{" "}
        <strong>{result.accountNumberMasked}</strong>.
      </p>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <strong>One last step:</strong> check your email and click the
        verification link to confirm this account belongs to you. We have just
        sent it, and we will send reminders over the next three days if we do
        not hear from you.
      </div>

      <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Your reference: <strong>{applicationId}</strong>
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

export { formatCurrency, formatCurrency2 };
