'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, ApiRequestError } from '@/lib/api';
import { SITE, money } from '@/lib/site';

interface StatusResult {
  applicationId: string;
  status: string;
  statusLabel?: string;
  currentStep: number;
  highestStepReached: number;
  bankVerificationStatus: string;
  /**
   * Present while verification is outstanding. `url` carries a fresh
   * single-use token, minted because the lookup already proved the reference
   * and the email together.
   */
  bankVerification?: { required: boolean; completed: boolean; url: string | null };
  submittedAt: string | null;
  lastUpdatedAt: string | null;
  actionRequired: { code: string; message: string };
  offer: { amount: number; termMonths: number; apr: number } | null;
}

const STATUS_LABELS: Record<string, string> = {
  step1_started: 'Started',
  step1_submitted: 'In progress',
  prequalified: 'Pre-qualified',
  prequal_declined: 'Not approved',
  step2_submitted: 'In underwriting',
  approved: 'Approved',
  underwriting_declined: 'Not approved',
  step3_submitted: 'Bank Verification Pending',
  bank_verification_pending: 'Bank Verification Pending',
  bank_verified: 'Bank Verification Completed',
  funded: 'Funded',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

const TONE: Record<string, string> = {
  declined: 'border-red-300 bg-red-50 text-red-900',
  verify_bank: 'border-amber-300 bg-amber-50 text-amber-900',
  expired: 'border-slate-300 bg-slate-50 text-slate-800',
};

export function LoanStatusLookup() {
  const [applicationId, setApplicationId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!applicationId.trim()) return setError('Enter your application reference.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return setError('Enter the email address you applied with.');
    }

    setBusy(true);
    try {
      setResult(
        await api.post<StatusResult>('/applications/status', {
          applicationId: applicationId.trim(),
          email: email.trim().toLowerCase(),
        }),
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.payload.message
          : 'We could not check that right now. Please try again shortly.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} noValidate className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-brand-900">Look up your application</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Enter the reference from your confirmation email and the address you applied with.
        </p>

        <div className="mt-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="applicationId" className="text-sm font-medium text-brand-900">
              Application reference
            </label>
            <input
              id="applicationId"
              name="applicationId"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
              placeholder="RYL-2026-XXXXXXXX"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[16px] uppercase tracking-wide outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="statusEmail" className="text-sm font-medium text-brand-900">
              Email address
            </label>
            <input
              id="statusEmail"
              name="statusEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[16px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Checking...' : 'Check status'}
        </button>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          For your security we show only the status here. To change any of your details, use
          the link in your email or call {SITE.supportPhone}.
        </p>
      </form>

      <div>
        {result ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {result.applicationId}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">
              {result.statusLabel ?? STATUS_LABELS[result.status] ?? result.status}
            </h2>

            <div
              className={`mt-5 rounded-lg border p-4 text-sm leading-relaxed ${
                TONE[result.actionRequired.code] ?? 'border-brand-200 bg-brand-50 text-brand-900'
              }`}
            >
              {result.actionRequired.message}
            </div>

            {/*
              Bank verification is completable from here, not only from the
              emails - an applicant who deleted them should not be stuck.
            */}
            {result.bankVerification?.required && result.bankVerification.url && (
              <Link
                href={result.bankVerification.url}
                className="mt-4 block w-full rounded-lg bg-brand-600 px-6 py-3.5 text-center text-base font-semibold text-white transition hover:bg-brand-700"
              >
                Complete Bank Verification
              </Link>
            )}

            {result.offer && (
              <dl className="mt-5 grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Amount</dt>
                  <dd className="font-semibold text-brand-900">{money(result.offer.amount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Term</dt>
                  <dd className="font-semibold text-brand-900">{result.offer.termMonths} mo</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">APR</dt>
                  <dd className="font-semibold text-brand-900">{result.offer.apr}%</dd>
                </div>
              </dl>
            )}

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">Progress</dt>
                <dd className="font-medium text-slate-800">
                  Step {result.highestStepReached} of 3
                </dd>
              </div>
              {result.submittedAt && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Submitted</dt>
                  <dd className="font-medium text-slate-800">{fmt(result.submittedAt)}</dd>
                </div>
              )}
              {result.lastUpdatedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="font-medium text-slate-800">{fmt(result.lastUpdatedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6">
            <h2 className="text-sm font-semibold text-brand-900">Where to find your reference</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              It looks like <span className="font-mono text-brand-800">RYL-2026-XXXXXXXX</span>{' '}
              and appears at the top of every email we have sent you, starting with the one
              confirming we received your application.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Cannot find it? Call {SITE.supportPhone} and we will look it up from your name and
              date of birth.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
