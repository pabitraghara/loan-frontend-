'use client';

import { Field, inputClass } from './Field';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal';
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Blocks paste - used on the confirm-email, confirm-SSN and confirm-account fields. */
  disablePaste?: boolean;
  /** Masks the value from session replay and analytics tooling. */
  sensitive?: boolean;
  suggestion?: React.ReactNode;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  placeholder,
  maxLength,
  autoComplete,
  inputMode,
  type = 'text',
  disabled,
  readOnly,
  disablePaste,
  sensitive,
  suggestion,
}: Props) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required} suggestion={suggestion}>
      <input
        id={id}
        name={id}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onPaste={disablePaste ? (e) => e.preventDefault() : undefined}
        onDrop={disablePaste ? (e) => e.preventDefault() : undefined}
        placeholder={placeholder}
        maxLength={maxLength}
        // Autofill is deliberately off for SSN and bank fields.
        autoComplete={autoComplete ?? (sensitive ? 'off' : undefined)}
        inputMode={inputMode}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass(!!error)} ${readOnly ? 'bg-slate-50 text-slate-600' : ''}`}
        // Session replay tools record keystrokes unless inputs are explicitly
        // masked. These attributes cover FullStory, Hotjar, LogRocket and
        // SessionStack respectively.
        {...(sensitive
          ? {
              'data-recording-sensitive': true,
              'data-hj-suppress': true,
              'data-private': true,
              'data-sl': 'mask',
              spellCheck: false,
              autoCorrect: 'off',
              autoCapitalize: 'off',
            }
          : {})}
      />
    </Field>
  );
}
