'use client';

/** Shared presentational pieces for the admin console. */

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
          {title && <h2 className="text-sm font-semibold text-brand-900">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const STATUS_TONE: Record<string, string> = {
  prequalified: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bank_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  funded: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  bank_verification_pending: 'bg-amber-50 text-amber-700 border-amber-200',
  step3_submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  prequal_declined: 'bg-red-50 text-red-700 border-red-200',
  underwriting_declined: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-300',
  withdrawn: 'bg-slate-100 text-slate-600 border-slate-300',
};

export const STATUS_LABELS: Record<string, string> = {
  step1_started: 'Started',
  step1_submitted: 'Step 1 submitted',
  prequalified: 'Pre-qualified',
  prequal_declined: 'Declined (pre-qual)',
  step2_submitted: 'In underwriting',
  approved: 'Approved',
  underwriting_declined: 'Declined (underwriting)',
  step3_submitted: 'Bank verification pending',
  bank_verification_pending: 'Bank verification pending',
  bank_verified: 'Bank verification completed',
  funded: 'Funded',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STATUS_TONE[status] ?? 'bg-slate-100 text-slate-700 border-slate-300'
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const FLAG_LABELS: Record<string, string> = {
  income_below_1200: 'Low income',
  income_above_20000: 'High income',
  short_address_tenure: 'New address',
  short_job_tenure: 'New job',
  no_direct_deposit: 'No direct deposit',
  voip_phone: 'VOIP phone',
  po_box_mailing_address: 'PO Box mailing',
  negative_account_status: 'Negative account',
  new_bank_account: 'New bank account',
  savings_account_funding: 'Savings account',
  routing_not_in_fedach_file: 'Routing not in FedACH',
};

export function FlagPills({ flags }: { flags: string[] }) {
  if (!flags?.length) return <span className="text-xs text-slate-400">None</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <span
          key={f}
          title={f}
          className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800"
        >
          {FLAG_LABELS[f] ?? f}
        </span>
      ))}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <dt className="shrink-0 text-xs text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">
        {value === null || value === undefined || value === '' ? (
          <span className="text-slate-300">-</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;

export const fmtMoney = (n?: number | string | null) =>
  n === null || n === undefined || n === ''
    ? null
    : `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      {message}
    </p>
  );
}
