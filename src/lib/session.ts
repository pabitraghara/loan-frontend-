'use client';

/**
 * Cross-reload pointer to an application in progress.
 *
 * Only the reference and the resume token are stored - never the applicant's
 * answers. Step 1 answers are autosaved separately (useAutosave) while that
 * step is being filled in; Steps 2 and 3 carry an SSN and bank credentials
 * and are never written to browser storage at all. On reload we hand the
 * token back to the API and let the server return the saved state, masked.
 *
 * The token is the same credential that goes out in the resume email, so it
 * is treated the same way: short-lived, single-purpose, and cleared as soon
 * as the application reaches a terminal state.
 */
const KEY = 'ryer.session';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface ApplySession {
  applicationId: string;
  resumeToken: string;
  step: 1 | 2 | 3;
  highestStepReached: number;
  savedAt: number;
}

export function saveSession(s: Omit<ApplySession, 'savedAt'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
  } catch {
    /* private mode - the emailed resume link is still the fallback */
  }
}

export function readSession(): ApplySession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ApplySession;
    if (!parsed.applicationId || !parsed.resumeToken) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
