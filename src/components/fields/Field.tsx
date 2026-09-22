'use client';

import { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  /** Rendered under the input as a non-blocking prompt ("Did you mean ...?"). */
  suggestion?: ReactNode;
}

/**
 * Shared field shell: label, control, inline error, hint.
 * The error renders beneath the control and never causes the value to clear.
 */
export function Field({ id, label, error, hint, required, children, suggestion }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-brand-900">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
        {!required && <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>}
      </label>
      {children}
      {suggestion}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (hasError?: boolean) =>
  [
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[16px] text-slate-900',
    'placeholder:text-slate-400 outline-none transition',
    'focus:ring-2 focus:ring-brand-500/30',
    hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-300 focus:border-brand-500',
  ].join(' ');
