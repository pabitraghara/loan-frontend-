'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { getTracking } from '@/lib/tracking';
import { TextField } from '@/components/fields/TextField';
import { SITE } from '@/lib/site';

interface VerificationDetails {
  applicationId: string;
  status: string;
  alreadyVerified: boolean;
  fullName: string;
  email: string;
  bankName: string | null;
  accountNumberMasked: string | null;
  expiresAt?: string | null;
}

interface VerifyResult {
  applicationId: string;
  alreadyVerified: boolean;
  status: string;
  statusLabel?: string;
  bankName?: string | null;
  accountNumberMasked?: string | null;
  cancelledDripEmails?: number;
}

/**
 * Bank verification.
 *
 * Reached from the emailed link or from the Status Panel; both carry the
 * same single-use token. Loading the page resolves the token but does not
 * consume it - an email client prefetching the link must not be able to
 * complete anything on the applicant's behalf.
 */
export function BankVerification({ token }: { token: string }) {
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bankUsername, setBankUsername] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setDetails(
        await api.get<VerificationDetails>(
          `/applications/verify-bank/${encodeURIComponent(token)}`,
        ),
      );
    } catch (err) {
      setLoadError(
        err instanceof ApiRequestError
          ? err.payload.message
          : 'We could not open this verification page. Please try again or call us.',
      );
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (bankUsername.trim().length < 2) errors.bankUsername = 'Enter your bank username.';
    if (bankPassword.length < 4) errors.bankPassword = 'Enter your bank password.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    setError(null);
    try {
      const res = await api.post<VerifyResult>(
        `/applications/verify-bank/${encodeURIComponent(token)}`,
        { bankUsername: bankUsername.trim(), bankPassword, tracking: getTracking() },
      );
      // Do not leave the credentials sitting in component state afterwards.
      setBankUsername('');
      setBankPassword('');
      setResult(res);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFieldErrors(err.fieldErrors as Record<string, string>);
        setError(err.payload.message);
      } else {
        setError('We could not verify your account. Please try again or call us.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="space-y-4 rounded-xl border border-red-300 bg-red-50 p-6">
        <h1 className="text-2xl font-semibold text-red-900">We cannot open this page</h1>
        <p className="text-sm leading-relaxed text-red-800">{loadError}</p>
        <p className="text-sm text-red-800">
          Call {SITE.supportPhone} and we will finish your verification with you.
        </p>
      </div>
    );
  }

  if (result || details?.alreadyVerified) {
    const alreadyVerified = result ? result.alreadyVerified : true;
    const applicationId = result?.applicationId ?? details?.applicationId;

    return (
      <div className="space-y-4 rounded-xl border border-brand-300 bg-white p-6">
        <div className="text-4xl" aria-hidden="true">✅</div>
        <h1 className="text-2xl font-semibold text-brand-900">
          {alreadyVerified ? 'Already verified' : 'Bank verification completed'}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {alreadyVerified
            ? 'This account was already confirmed. Nothing more is needed from you, and we have stopped the reminder emails.'
            : 'Thanks. Your bank verification is complete, we have stopped the remaining reminder emails, and we are scheduling your deposit now - most arrive within one business day.'}
        </p>
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Your reference: <strong>{applicationId}</strong>
        </p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Loading your details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-brand-900">Complete bank verification</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Confirm the account we will deposit your funds into. This is the last step before
          funding.
        </p>
      </div>

      <dl className="space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Reference</dt>
          <dd className="font-mono font-medium text-brand-900">{details.applicationId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Full name</dt>
          <dd className="font-medium text-slate-800">{details.fullName || '-'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Email address</dt>
          <dd className="break-all font-medium text-slate-800">{details.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Banking institution</dt>
          <dd className="font-medium text-slate-800">{details.bankName || '-'}</dd>
        </div>
        {details.accountNumberMasked && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Account</dt>
            <dd className="font-medium text-slate-800">{details.accountNumberMasked}</dd>
          </div>
        )}
      </dl>

      <div className="space-y-5">
        <TextField
          id="bankUsername"
          label="Bank username"
          value={bankUsername}
          onChange={setBankUsername}
          error={fieldErrors.bankUsername}
          required
          maxLength={100}
          autoComplete="off"
          sensitive
          hint={`Your online banking username for ${details.bankName || 'your bank'}.`}
        />
        <TextField
          id="bankPassword"
          label="Bank password"
          type="password"
          value={bankPassword}
          onChange={setBankPassword}
          error={fieldErrors.bankPassword}
          required
          maxLength={200}
          autoComplete="off"
          sensitive
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Verifying...' : 'Complete bank verification'}
      </button>

      <p className="text-xs leading-relaxed text-slate-500">
        Only ever enter these details on this page, which you reached from an email we sent
        you or from your status page. We will never ask for them by reply, over the phone or
        by text. If anything looks wrong, stop and call {SITE.supportPhone}.
      </p>
    </form>
  );
}
