'use client';

import { Field } from './Field';
import type { Option } from '@/lib/types';

interface Props<T extends string> {
  id: string;
  label: string;
  value: T | '';
  options: Option<T>[];
  onChange: (value: T) => void;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  /** Renders side by side rather than stacked. */
  inline?: boolean;
}

export function RadioGroup<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
  hint,
  required,
  inline = true,
}: Props<T>) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className={inline ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2'}
      >
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={String(o.value)}
              className={[
                'flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm transition',
                selected
                  ? 'border-brand-500 bg-brand-50 font-medium text-brand-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
                inline ? 'flex-1 min-w-[140px]' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name={id}
                value={String(o.value)}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="h-4 w-4 accent-brand-600"
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </Field>
  );
}
