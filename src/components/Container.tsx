export function Container({
  children,
  size = 'wide',
  className = '',
}: {
  children: React.ReactNode;
  size?: 'wide' | 'narrow';
  className?: string;
}) {
  const width = size === 'narrow' ? 'max-w-3xl' : 'max-w-6xl';
  return <div className={`mx-auto ${width} px-4 sm:px-6 ${className}`}>{children}</div>;
}

/** Standard heading block for marketing sections. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  centered?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg leading-relaxed text-slate-600">{lead}</p>}
    </div>
  );
}

/** Page header used by every interior page, for a consistent entry. */
export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <Container className="py-12 sm:py-16">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl">
          {title}
        </h1>
        {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{lead}</p>}
      </Container>
    </div>
  );
}
