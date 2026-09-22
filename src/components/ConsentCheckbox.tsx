'use client';

import { useState } from 'react';
import type { ConsentTemplate } from '@/lib/types';

interface Props {
  template: ConsentTemplate;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
}

/**
 * One separate, unchecked checkbox per consent.
 * No pre-ticking, no bundled "I agree to everything", and the full text is
 * expandable in place rather than buried behind a footer link.
 *
 * Kept visually compact: five stacked full-size cards read as an obstacle,
 * which is exactly when people stop reading what they are agreeing to.
 */
export function ConsentCheckbox({ template, checked, onChange, error }: Props) {
  const [expanded, setExpanded] = useState(false);
  const id = `consent-${template.type}`;

  return (
    <div
      className={[
        'rounded-lg border px-4 py-3 transition',
        error
          ? 'border-red-300 bg-red-50/50'
          : checked
            ? 'border-brand-200 bg-brand-50/40'
            : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={`${id}-text`}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-400 accent-brand-600"
        />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-slate-800">
            {template.label}
          </label>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-900"
            >
              {expanded ? 'Hide full text' : 'Full text'}
            </button>
            {template.links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 underline underline-offset-2 hover:text-brand-800"
              >
                {l.label}
              </a>
            ))}
            <span className="text-slate-400">{template.versionId}</span>
          </div>

          {expanded && (
            <div
              id={`${id}-text`}
              className="mt-2.5 max-h-48 overflow-y-auto rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-700"
            >
              <p>{template.text}</p>
              {template.namedParties && template.namedParties.length > 0 && (
                <p className="mt-2">
                  <strong>Parties named in this consent:</strong>{' '}
                  {template.namedParties.join(', ')}
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
