/** Display formatting. All currency is whole dollars, no decimals. */

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(n)) return '';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function formatCurrency2(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseCurrency(value: string): number | undefined {
  const digits = String(value ?? '').replace(/[^0-9]/g, '');
  return digits === '' ? undefined : Number(digits);
}

export function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** (XXX) XXX-XXXX, applied as the user types. */
export function formatPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** XXX-XX-XXXX while typing; the value is never echoed back from the server. */
export function formatSsn(value: string): string {
  const d = digitsOnly(value).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

/** MM/DD/YYYY for display, ISO on the wire. */
export function isoToUsDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${m}/${d}/${y}` : '';
}

export function usDateToIso(us: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((us || '').trim());
  return m ? `${m[3]}-${m[1]}-${m[2]}` : '';
}

export function monthsLabel(n: number): string {
  return `${n} months`;
}
