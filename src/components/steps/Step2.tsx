'use client';

import { useEffect, useState } from 'react';
import { digitsOnly, formatSsn } from '@/lib/format';
import { validateFutureDate, validateSsn, required } from '@/lib/validation';
import type {
  ConsentTemplate,
  FieldErrors,
  LookupOptions,
  SubmitRequestPart,
} from '@/lib/types';
import { SectionCard } from '../SectionCard';
import { TrustMarkers } from '../TrustMarkers';
import { ConsentCheckbox } from '../ConsentCheckbox';
import { TextField } from '../fields/TextField';
import { SelectField } from '../fields/SelectField';
import { DateField } from '../fields/DateField';

/** What the wizard holds on to so Back can put this screen back as it was. */
export interface Step2Snapshot {
  ssn: string;
  confirmSsn: string;
  driversLicenseNumber: string;
  dlIssuingState: string;
  dlExpirationDate: string;
  consents: Record<string, boolean>;
}

interface Props {
  options: LookupOptions;
  consentTemplates: ConsentTemplate[];
  /** Residence state - field 36 defaults to it, override allowed. */
  residenceState?: string;
  /** Whatever was on this screen last time, so Back loses nothing. */
  initial?: Step2Snapshot;
  /** Validated - hand this screen's fields up and move to the next one. */
  onNext: (part: SubmitRequestPart) => void;
  /** Fires on every keystroke; the wizard is the one holding the answers. */
  onChange: (snapshot: Step2Snapshot) => void;
  onBack: () => void;
  /** The final submit is in flight - every screen's buttons go quiet. */
  submitting?: boolean;
  /** Field errors the server raised against this screen, after submit. */
  serverErrors?: FieldErrors;
  serverBanner?: string | null;
}

/**
 * Screen 2 - identity verification.
 *
 * Nothing here is autosaved to browser storage and no value is ever rendered
 * back from the server: an SSN and a licence number live in React state for
 * as long as the applicant is on the form and nowhere else. Back and Next
 * keep them in the wizard's memory, still in the same tab, and they leave the
 * browser once - on submit.
 *
 * Military status is not asked: the MLA covered-borrower check runs
 * server-side.
 */
export function Step2({
  options,
  consentTemplates,
  residenceState,
  initial,
  onNext,
  onChange,
  onBack,
  submitting = false,
  serverErrors,
  serverBanner,
}: Props) {
  const [ssn, setSsn] = useState(initial?.ssn ?? '');
  const [confirmSsn, setConfirmSsn] = useState(initial?.confirmSsn ?? '');
  const [dl, setDl] = useState(initial?.driversLicenseNumber ?? '');
  const [dlState, setDlState] = useState(initial?.dlIssuingState ?? residenceState ?? '');
  const [dlExpiration, setDlExpiration] = useState(initial?.dlExpirationDate ?? '');
  const [consents, setConsents] = useState<Record<string, boolean>>(initial?.consents ?? {});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);

  // The wizard holds the answers; this screen only edits them.
  useEffect(() => {
    onChange({
      ssn,
      confirmSsn,
      driversLicenseNumber: dl,
      dlIssuingState: dlState,
      dlExpirationDate: dlExpiration,
      consents,
    });
  }, [ssn, confirmSsn, dl, dlState, dlExpiration, consents, onChange]);

  // Errors raised by the server against this screen land here after submit.
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length) setErrors(serverErrors);
    setBanner(serverBanner ?? null);
  }, [serverErrors, serverBanner]);

  const setError = (key: string, message: string | null) =>
    setErrors((e) => ({ ...e, [key]: message ?? '' }));

  const validateAll = (): FieldErrors => {
    const e: FieldErrors = {};
    const ssnError = validateSsn(ssn);
    if (ssnError) e.ssn = ssnError;
    else if (digitsOnly(ssn) !== digitsOnly(confirmSsn)) {
      e.confirmSsn = 'The Social Security numbers do not match.';
    }

    if (!dl.trim()) e.driversLicenseNumber = "Enter your driver's licence number.";
    else if (!/^[A-Za-z0-9\s-]{1,20}$/.test(dl.trim())) {
      e.driversLicenseNumber = 'Use letters and numbers only (up to 20 characters).';
    }

    const stateError = required(dlState, 'Select the issuing state.');
    if (stateError) e.dlIssuingState = stateError;

    if (!dlExpiration) e.dlExpirationDate = 'Enter the expiration date.';
    else {
      const [y, m, d] = dlExpiration.split('-');
      const err = validateFutureDate(`${m}/${d}/${y}`, 'The expiration date');
      if (err) e.dlExpirationDate = err;
    }

    for (const t of consentTemplates) {
      if (!consents[t.type]) e[`consents.${t.type}`] = 'You must agree to continue.';
    }
    return e;
  };

  const goNext = (event: React.FormEvent) => {
    event.preventDefault();
    setBanner(null);

    const found = validateAll();
    if (Object.keys(found).length) {
      setErrors(found);
      document
        .querySelector('[aria-invalid="true"], [role="alert"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onNext({
      ssn: digitsOnly(ssn),
      confirmSsn: digitsOnly(confirmSsn),
      driversLicenseNumber: dl.trim().toUpperCase(),
      dlIssuingState: dlState,
      dlExpirationDate: dlExpiration,
      consents: consentTemplates.map((t) => ({
        type: t.type,
        accepted: !!consents[t.type],
        versionId: t.versionId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })),
    });
  };

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  return (
    <form onSubmit={goNext} noValidate className="space-y-6">
      {banner && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {banner}
        </div>
      )}

      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        <strong>Nearly there.</strong> Federal law requires us to confirm who you are before we
        can lend to you. You can still go back and change anything you have entered - nothing is
        sent until you submit on the last screen.
      </div>

      <SectionCard
        title="Verify your identity"
        description="This is required by federal law before we can lend to you."
      >
        <TrustMarkers variant="ssn" />

        <TextField
          id="ssn"
          label="Social Security number"
          required
          value={ssn}
          onChange={(v) => setSsn(formatSsn(v))}
          onBlur={() => setError('ssn', validateSsn(ssn))}
          inputMode="numeric"
          maxLength={11}
          placeholder="XXX-XX-XXXX"
          autoComplete="off"
          sensitive
          error={errors.ssn}
        />

        <TextField
          id="confirmSsn"
          label="Confirm Social Security number"
          required
          value={confirmSsn}
          onChange={(v) => setConfirmSsn(formatSsn(v))}
          onBlur={() =>
            setError(
              'confirmSsn',
              digitsOnly(ssn) === digitsOnly(confirmSsn)
                ? null
                : 'The Social Security numbers do not match.',
            )
          }
          disablePaste
          inputMode="numeric"
          maxLength={11}
          placeholder="XXX-XX-XXXX"
          autoComplete="off"
          sensitive
          hint="Please re-type it - paste is disabled so typos get caught."
          error={errors.confirmSsn}
        />

        <TextField
          id="driversLicenseNumber"
          label="Driver's licence number"
          required
          value={dl}
          onChange={(v) => setDl(v.toUpperCase().slice(0, 20))}
          maxLength={20}
          autoComplete="off"
          sensitive
          error={errors.driversLicenseNumber}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="dlIssuingState"
            label="Issuing state"
            required
            value={dlState}
            options={options.states}
            onChange={(v) => setDlState(String(v))}
            error={errors.dlIssuingState}
            hint={residenceState ? 'Defaulted to your home state - change it if needed.' : undefined}
          />
          <DateField
            id="dlExpirationDate"
            label="Expiration date"
            required
            value={dlExpiration}
            onChange={setDlExpiration}
            min={tomorrow}
            sensitive
            error={errors.dlExpirationDate}
          />
        </div>
      </SectionCard>

      <SectionCard title="Your agreement">
        {consentTemplates.map((t) => (
          <ConsentCheckbox
            key={t.type}
            template={t}
            checked={!!consents[t.type]}
            onChange={(v) => {
              setConsents((c) => ({ ...c, [t.type]: v }));
              setErrors((e) => ({ ...e, [`consents.${t.type}`]: '' }));
            }}
            error={errors[`consents.${t.type}`]}
          />
        ))}
      </SectionCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-6 py-4 text-base font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-brand-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </form>
  );
}
