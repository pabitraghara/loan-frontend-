'use client';

import { useEffect, useState } from 'react';
import { Field, inputClass } from './Field';
import { formatCurrency, parseCurrency } from '@/lib/format';

interface Props {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
}

/**
 * Whole dollars, no decimals. The thousands separator is applied on blur, so
 * typing stays unobstructed. inputmode="numeric" gives the numeric keypad.
 */
export function CurrencyField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  placeholder = '0',
}: Props) {
  const [display, setDisplay] = useState(value === undefined ? '' : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(value === undefined ? '' : formatCurrency(value).replace('$', ''));
  }, [value, focused]);

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          $
        </span>
        <input
          id={id}
          name={id}
          type="text"
          inputMode="numeric"
          value={display}
          placeholder={placeholder}
          onFocus={() => {
            setFocused(true);
            setDisplay(value === undefined ? '' : String(value));
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            setDisplay(raw);
            onChange(raw === '' ? undefined : Number(raw));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseCurrency(display);
            setDisplay(parsed === undefined ? '' : formatCurrency(parsed).replace('$', ''));
            onBlur?.();
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass(!!error)} pl-7`}
        />
      </div>
    </Field>
  );
}
