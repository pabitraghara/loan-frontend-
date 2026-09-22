'use client';

import { useEffect, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import type { ResumeState } from '@/lib/types';
import { ApplyWizard } from './ApplyWizard';

/**
 * Rehydrates a saved application from an emailed resume link.
 * Step 1 comes back in full; Steps 2 and 3 come back masked only - an SSN or
 * account number is never sent to the browser.
 */
export function ResumeLoader({ token }: { token: string }) {
  const [state, setState] = useState<ResumeState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ResumeState>(`/applications/resume/${encodeURIComponent(token)}`)
      .then(setState)
      .catch((err) => {
        setError(
          err instanceof ApiRequestError
            ? err.payload.message
            : 'We could not open that link. Please start a new application.',
        );
      });
  }, [token]);

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-brand-900">We could not open that link</h1>
        <p className="text-sm leading-relaxed text-slate-600">{error}</p>
        <a
          href="/apply"
          className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Start a new application
        </a>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        Welcome back{state.step1?.firstName ? `, ${state.step1.firstName}` : ''}. Everything you
        entered is still here - pick up where you left off.
      </div>
      <ApplyWizard resumed={state} resumeToken={token} />
    </>
  );
}
