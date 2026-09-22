'use client';

interface Props {
  current: 1 | 2 | 3;
  highestReached: number;
  onNavigate?: (step: 1 | 2 | 3) => void;
}

const STEPS = [
  { n: 1 as const, label: 'About you', hint: 'Loan, contact, income' },
  { n: 2 as const, label: 'Verify identity', hint: 'SSN and licence' },
  { n: 3 as const, label: 'Bank & funding', hint: 'Where to deposit' },
];

/**
 * "Step 1 of 3", with a rail that shows what is done, where you are, and what
 * is still to come. Completed steps are clickable: going back never loses
 * data, so there is no reason to trap someone on the current step.
 */
export function ProgressIndicator({ current, highestReached, onNavigate }: Props) {
  const pct = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Application progress" className="mb-8">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-sm font-semibold text-brand-900">
          Step {current} of 3
          <span className="ml-2 font-normal text-slate-500">{STEPS[current - 1].label}</span>
        </p>
        <p className="text-xs text-slate-500">About {4 - current} min left</p>
      </div>

      <div className="relative">
        {/* Rail */}
        <div aria-hidden="true" className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200" />
        <div
          aria-hidden="true"
          className="absolute left-0 top-4 h-0.5 bg-brand-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />

        <ol className="relative flex justify-between">
          {STEPS.map((s) => {
            const done = s.n < current;
            const active = s.n === current;
            const reachable = s.n <= highestReached && s.n !== current && !!onNavigate;

            return (
              <li key={s.n} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && onNavigate?.(s.n)}
                  aria-current={active ? 'step' : undefined}
                  title={reachable ? `Back to ${s.label}` : undefined}
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition',
                    active
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : done
                        ? 'border-brand-600 bg-white text-brand-700'
                        : 'border-slate-300 bg-white text-slate-400',
                    reachable ? 'cursor-pointer hover:border-brand-700' : 'cursor-default',
                  ].join(' ')}
                >
                  {done ? '✓' : s.n}
                </button>

                <span
                  className={[
                    'mt-2 hidden text-xs sm:block',
                    active ? 'font-semibold text-brand-900' : 'text-slate-500',
                  ].join(' ')}
                >
                  {s.label}
                </span>
                <span className="hidden text-[11px] text-slate-400 lg:block">{s.hint}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
