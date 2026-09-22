'use client';

import { Field, inputClass } from './Field';
import type { Option } from '@/lib/types';

interface Props<T extends string | number> {
  id: string;
  label: string;
  value: T | '';
  options: Option<T>[];
  onChange: (value: T | '') => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function SelectField<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
  onBlur,
  error,
  hint,
  required,
  placeholder = 'Select...',
  disabled,
  autoComplete,
}: Props<T>) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        name={id}
        value={value === undefined || value === null ? '' : String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return onChange('');
          const match = options.find((o) => String(o.value) === raw);
          onChange((match ? match.value : (raw as unknown as T)) as T);
        }}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass(!!error)} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%2364748b"><path d="M5.2 7.5 10 12.3l4.8-4.8"/></svg>')] bg-[length:18px] bg-[right_0.85rem_center] bg-no-repeat pr-10`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
