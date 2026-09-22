'use client';

import { useState } from 'react';
import { adminApi, AdminApiError, canReveal, RevealField as Field } from '@/lib/admin-api';
import { useAdminAuth } from './AdminAuth';

interface Props {
  applicationId: string;
  field: Field;
  label: string;
  masked: string | null;
  onRevealed?: () => void;
}

/**
 * Masked by default, everywhere.
 *
 * Revealing requires a reason, is refused by the API unless the role permits
 * it, and is written to the access log - who, when, which application, from
 * which IP - before any cleartext is returned. The revealed value is held in
 * component state only and is cleared on hide or navigation.
 */
export function RevealFieldRow({ applicationId, field, label, masked, onRevealed }: Props) {
  const { user } = useAdminAuth();
  const [value, setValue] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const permitted = canReveal(user?.role, field);

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await adminApi.reveal(applicationId, field, reason.trim());
      setValue(res.value);
      setAsking(false);
      setReason('');
      onRevealed?.();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Could not reveal this value.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="text-right">
          <span className="font-mono text-sm font-medium text-slate-800">
            {value ?? masked ?? <span className="text-slate-300">-</span>}
          </span>

          {masked && (
            <div className="mt-1">
              {value ? (
                <button
                  type="button"
                  onClick={() => setValue(null)}
                  className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
                >
                  Hide
                </button>
              ) : permitted ? (
                <button
                  type="button"
                  onClick={() => setAsking((v) => !v)}
                  className="text-xs font-medium text-brand-700 underline hover:text-brand-900"
                >
                  {asking ? 'Cancel' : 'Reveal'}
                </button>
              ) : (
                <span className="text-xs text-slate-400" title="Your role sees last 4 only">
                  Last 4 only
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {asking && (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <label htmlFor={`reason-${field}`} className="text-xs font-medium text-amber-900">
            Why do you need to see this? Recorded against the applicant&apos;s file.
          </label>
          <input
            id={`reason-${field}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
            placeholder="e.g. identity verification call"
            className="mt-1.5 w-full rounded-md border border-amber-300 px-2.5 py-1.5 text-sm outline-none focus:border-amber-500"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={reveal}
              disabled={busy || reason.trim().length < 3}
              className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {busy ? 'Revealing...' : 'Reveal and log'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
