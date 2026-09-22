'use client';

import { Field, inputClass } from './Field';
import { isoToUsDate, usDateToIso } from '@/lib/format';

interface Props {
  id: string;
  label: string;
  /** ISO (YYYY-MM-DD) on the wire; MM/DD/YYYY on screen. */
  value: string;
  onChange: (iso: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  min?: string;
  max?: string;
  autoComplete?: string;
  sensitive?: boolean;
}

/**
 * Uses the native date input, which gives the OS date picker on mobile and
 * renders as MM/DD/YYYY under an en-US locale.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  min,
  max,
  autoComplete,
  sensitive,
}: Props) {
  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint ?? 'MM/DD/YYYY'}
      required={required}
    >
      <input
        id={id}
        name={id}
        type="date"
        lang="en-US"
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete ?? (sensitive ? 'off' : undefined)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(!!error)}
        {...(sensitive ? { 'data-hj-suppress': true, 'data-private': true, 'data-sl': 'mask' } : {})}
      />
    </Field>
  );
}

export { isoToUsDate, usDateToIso };
