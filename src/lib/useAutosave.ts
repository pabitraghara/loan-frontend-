'use client';

import { useEffect, useRef } from 'react';

/**
 * Local autosave so a refresh mid-step does not lose typing.
 *
 * Only ever used for Step 1. Step 2 and Step 3 carry SSN, DL and bank
 * credentials, which must never be written to browser storage - those steps
 * rely on server-side per-step saves instead.
 */
export function useAutosave<T extends object>(key: string, value: T, enabled = true) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* private mode - autosave degrades, the form still works */
      }
    }, 600);
    return () => clearTimeout(timer.current);
  }, [key, value, enabled]);
}

export function readAutosave<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

export function clearAutosave(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
