export function SectionCard({
  step,
  title,
  description,
  children,
}: {
  /** Small ordinal badge, so a long form reads as a sequence rather than a wall. */
  step?: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <header className="mb-6 flex items-start gap-3.5">
        {step !== undefined && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700"
          >
            {step}
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-brand-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
