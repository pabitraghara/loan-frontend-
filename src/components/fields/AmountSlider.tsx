'use client';

import { SITE, money, money2, monthlyPayment } from '@/lib/site';

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  error?: string | null;
  /** Shown when the state cap is lower than the product maximum. */
  capNote?: string | null;
  /** Drives the live payment figure beside the amount. */
  termMonths?: number | '';
}

/**
 * Field 1 - slider with a numeric display, $500 increments.
 * The monthly payment sits next to the amount so the trade-off between
 * borrowing more and paying more is visible while the slider moves.
 */
export function AmountSlider({
  value,
  min,
  max,
  step,
  onChange,
  error,
  capNote,
  termMonths,
}: Props) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const term = typeof termMonths === 'number' ? termMonths : null;
  const payment = term ? monthlyPayment(value, term) : null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-50 to-sand p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="loanAmount" className="text-sm font-medium text-brand-900">
            How much do you need?<span className="ml-0.5 text-red-600">*</span>
          </label>
          <output
            htmlFor="loanAmount"
            className="mt-1 block text-4xl font-semibold tabular-nums tracking-tight text-brand-900 sm:text-5xl"
          >
            {money(value)}
          </output>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-brand-700">
            Monthly at {SITE.apr}% APR
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-900">
            {payment ? money2(payment) : <span className="text-brand-300">--</span>}
          </p>
          {!payment && <p className="text-[11px] text-brand-700">Pick a term to see this</p>}
        </div>
      </div>

      <input
        id="loanAmount"
        name="loanAmount"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={money(value)}
        className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full outline-none
                   [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
                   [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow-md
                   [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white
                   [&::-moz-range-thumb]:bg-brand-600"
        style={{
          background: `linear-gradient(to right, #2d654c 0%, #2d654c ${pct}%, #cbd5e1 ${pct}%, #cbd5e1 100%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
        <span>{money(min)}</span>
        <span>{money(max)}</span>
      </div>

      {capNote && <p className="mt-3 text-xs text-amber-700">{capNote}</p>}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
