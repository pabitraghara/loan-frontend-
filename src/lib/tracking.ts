'use client';

import type { TrackingPayload } from './types';

/**
 * HIDDEN / SYSTEM FIELDS captured silently on every step submission.
 * First-touch attribution and the form timer survive a reload via
 * sessionStorage/localStorage so a resumed application keeps its provenance.
 */

const FIRST_TOUCH_KEY = 'ryer.firstTouch';
const SESSION_KEY = 'ryer.sessionId';
const TIMER_KEY = 'ryer.formStartedAt';
const UTM_KEY = 'ryer.utm';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

function safeGet(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    /* private mode - tracking degrades, the form still works */
  }
}

/** Call once on first paint of the application page. */
export function initTracking() {
  if (typeof window === 'undefined') return;

  if (!safeGet(localStorage, FIRST_TOUCH_KEY)) {
    safeSet(localStorage, FIRST_TOUCH_KEY, window.location.href);
  }

  // UTMs are captured on the landing hit and reused for later steps, so a
  // direct navigation to /apply does not wipe the attribution.
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value) found[key] = value.slice(0, 120);
  }
  if (Object.keys(found).length) {
    safeSet(localStorage, UTM_KEY, JSON.stringify(found));
  }

  if (!safeGet(sessionStorage, SESSION_KEY)) {
    safeSet(sessionStorage, SESSION_KEY, cryptoRandomId());
  }
  if (!safeGet(sessionStorage, TIMER_KEY)) {
    safeSet(sessionStorage, TIMER_KEY, String(Date.now()));
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * A stable, non-PII device signal. Deliberately coarse - this is a fraud
 * heuristic, not an identifier, and it never leaves the application payload.
 */
function deviceFingerprint(): string {
  if (typeof window === 'undefined') return '';
  const parts = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency ?? ''),
    String((navigator as any).deviceMemory ?? ''),
  ].join('|');

  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = (hash << 5) - hash + parts.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

/** Jornaya writes its token into a hidden input named leadid_token. */
function jornayaLeadId(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const el = document.getElementById('leadid_token') as HTMLInputElement | null;
  return el?.value || undefined;
}

/** TrustedForm writes the certificate URL into xxTrustedFormCertUrl. */
function trustedFormCertUrl(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const el = document.querySelector<HTMLInputElement>('input[name="xxTrustedFormCertUrl"]');
  return el?.value || undefined;
}

export function getTracking(): TrackingPayload {
  if (typeof window === 'undefined') return {};

  let utm: Record<string, string> = {};
  try {
    utm = JSON.parse(safeGet(localStorage, UTM_KEY) || '{}');
  } catch {
    utm = {};
  }

  const startedAt = Number(safeGet(sessionStorage, TIMER_KEY) || Date.now());

  return {
    deviceFingerprint: deviceFingerprint(),
    pageUrl: window.location.href,
    referrerUrl: document.referrer || undefined,
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
    utmContent: utm.utm_content,
    utmTerm: utm.utm_term,
    landingPageFirstTouch: safeGet(localStorage, FIRST_TOUCH_KEY) || undefined,
    jornayaLeadid: jornayaLeadId(),
    trustedformCertUrl: trustedFormCertUrl(),
    sessionId: safeGet(sessionStorage, SESSION_KEY) || undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeOnForm: Math.min(86_400, Math.round((Date.now() - startedAt) / 1000)),
  };
}
