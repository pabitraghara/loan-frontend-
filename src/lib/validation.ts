import { digitsOnly, usDateToIso } from './format';

/**
 * Client-side mirrors of the server rules, used for inline validation on blur.
 * The server remains authoritative - this exists so the applicant learns about
 * a problem at the field, not after a submit.
 *
 * Every validator returns a message or null. Nothing here ever clears a field.
 */

const NAME_RE = /^[A-Za-z][A-Za-zÀ-ɏ' .-]*$/;

export function validateName(value: string, label: string): string | null {
  const v = (value || '').trim();
  if (!v) return `Enter your ${label.toLowerCase()}.`;
  if (v.length < 2 || v.length > 40) return `${label} must be 2-40 characters.`;
  if (/\d/.test(v)) return `${label} cannot contain numbers.`;
  if (!NAME_RE.test(v)) return 'Use letters, spaces, hyphens, apostrophes and periods only.';
  return null;
}

export function validateEmail(value: string): string | null {
  const v = (value || '').trim();
  if (!v) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
  return null;
}

/** Local typo table; the server runs the authoritative MX and blocklist checks. */
const TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com', 'gnail.com': 'gmail.com', 'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'hotmai.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com', 'outlok.com': 'outlook.com', 'iclod.com': 'icloud.com',
};

export function suggestEmail(value: string): string | null {
  const [local, domain] = (value || '').toLowerCase().split('@');
  if (!local || !domain) return null;
  const fixed = TYPOS[domain];
  return fixed ? `${local}@${fixed}` : null;
}

export function validatePhone(value: string): string | null {
  const d = digitsOnly(value);
  if (!d) return 'Enter your mobile number.';
  if (d.length !== 10) return 'Enter a 10-digit US phone number.';
  const npa = d.slice(0, 3);
  const nxx = d.slice(3, 6);
  if (['000', '555', '900'].includes(npa)) return 'That area code is not valid.';
  if (npa[0] === '0' || npa[0] === '1') return 'That area code is not valid.';
  if (npa[1] === '1' && npa[2] === '1') return 'That area code is not valid.';
  if (nxx[0] === '0' || nxx[0] === '1') return 'That phone number is not valid.';
  return null;
}

/** MM/DD/YYYY, 18-100 years old, never in the future. */
export function validateDob(usDate: string): string | null {
  if (!usDate) return 'Enter your date of birth.';
  const iso = usDateToIso(usDate);
  if (!iso) return 'Enter your date of birth as MM/DD/YYYY.';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date.';
  if (d.getTime() > Date.now()) return 'Date of birth cannot be in the future.';

  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;

  if (age < 18) return 'You must be at least 18 years old to apply.';
  if (age > 100) return 'Please check your date of birth.';
  return null;
}

const PO_BOX_RE = /\b(p\.?\s*o\.?\s*box|post\s+office\s+box|postal\s+box|po\s*bin)\b/i;

export function validateStreetAddress(value: string): string | null {
  const v = (value || '').trim();
  if (v.length < 5) return 'Enter your street address.';
  if (v.length > 100) return 'Address must be 100 characters or fewer.';
  if (PO_BOX_RE.test(v)) {
    return 'A PO Box cannot be used as your home address. Add it as a mailing address instead.';
  }
  return null;
}

export function validateZip(value: string): string | null {
  if (!/^\d{5}$/.test(value || '')) return 'Enter a 5-digit ZIP code.';
  return null;
}

export function validateCurrency(
  value: number | undefined,
  min: number,
  max: number,
  label: string,
): string | null {
  if (value === undefined || value === null || Number.isNaN(value)) return `Enter ${label}.`;
  if (value < min) return `${label} must be at least $${min.toLocaleString()}.`;
  if (value > max) return `${label} must be $${max.toLocaleString()} or less.`;
  return null;
}

/** Field 33 - the same rules the server applies, so the error arrives at the field. */
export function validateSsn(value: string): string | null {
  const d = digitsOnly(value);
  if (d.length !== 9) return 'Enter your 9-digit Social Security number.';
  const area = d.slice(0, 3);
  const group = d.slice(3, 5);
  const serial = d.slice(5);
  if (area === '000' || area === '666' || Number(area) >= 900) {
    return 'That Social Security number is not valid.';
  }
  if (group === '00' || serial === '0000') return 'That Social Security number is not valid.';
  if (d === '078051120') return 'That Social Security number is not valid.';
  return null;
}

/** Field 43 - ABA checksum, so a typo is caught before a submit. */
export function validateRoutingNumber(value: string): string | null {
  const d = digitsOnly(value);
  if (d.length !== 9) return 'Enter the 9-digit routing number.';
  const n = d.split('').map(Number);
  const sum =
    3 * (n[0] + n[3] + n[6]) + 7 * (n[1] + n[4] + n[7]) + 1 * (n[2] + n[5] + n[8]);
  if (sum % 10 !== 0) return 'That routing number is not valid. Please check the 9 digits.';
  return null;
}

export function validateAccountNumber(value: string): string | null {
  const d = digitsOnly(value);
  if (d.length < 4 || d.length > 17) return 'Enter your account number (4-17 digits).';
  return null;
}

export function validateFutureDate(usDate: string, label: string): string | null {
  if (!usDate) return `Enter ${label}.`;
  const iso = usDateToIso(usDate);
  if (!iso) return 'Enter the date as MM/DD/YYYY.';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date.';
  if (d.getTime() <= Date.now()) return `${label} must be in the future.`;
  return null;
}

/** Field 29 - future, and within 35 days. */
export function validateNextPayDate(usDate: string): string | null {
  const base = validateFutureDate(usDate, 'your next pay date');
  if (base) return base;
  const d = new Date(`${usDateToIso(usDate)}T00:00:00Z`);
  if (d.getTime() > Date.now() + 35 * 24 * 60 * 60 * 1000) {
    return 'Your next pay date must be within the next 35 days.';
  }
  return null;
}

export function required(value: unknown, message: string): string | null {
  if (value === undefined || value === null || value === '') return message;
  return null;
}
