'use client';

import { useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { getTracking } from '@/lib/tracking';
import { digitsOnly, formatSsn } from '@/lib/format';
import { validateFutureDate, validateSsn, required } from '@/lib/validation';
import type { ConsentTemplate, FieldErrors, LookupOptions, Step2Response } from '@/lib/types';
import { SectionCard } from '../SectionCard';
import { TrustMarkers } from '../TrustMarkers';
import { ConsentCheckbox } from '../ConsentCheckbox';
import { TextField } from '../fields/TextField';
import { SelectField } from '../fields/SelectField';
import { DateField } from '../fields/DateField';

interface Props {
  applicationId: string;
  options: LookupOptions;
  consentTemplates: ConsentTemplate[];
  /** Residence state - field 36 defaults to it, override allowed. */
  residenceState?: string;
  onComplete: (result: Step2Response) => void;
  onBack: () => void;
}

/**
 * Step 2 - identity verification.
 *
 * Nothing on this step is autosaved to browser storage, and no value here is
 * ever rendered back from the server. Military status is not asked: the MLA
 * covered-borrower check runs server-side.
 */
export function Step2({
  applicationId,
  options,
  consentTemplates,
  residenceState,
  onComplete,
  onBack,
}: Props) {
  const [ssn, setSsn] = useState('');
  const [confirmSsn, setConfirmSsn] = useState('');
  const [dl, setDl] = useState('');
  const [dlState, setDlState] = useState(residenceState ?? '');
  const [dlExpiration, setDlExpiration] = useState('');
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const submit = async (event: React.FormEvent) => {
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

    setSubmitting(true);
    try {
      const result = await api.post<Step2Response>('/applications/step2', {
        applicationId,
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
        tracking: getTracking(),
      });

      // Clear the sensitive values from component state the moment we are done.
      setSsn('');
      setConfirmSsn('');
      onComplete(result);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.fieldErrors);
        setBanner(err.payload.message);
      } else {
        setBanner('Something went wrong. Please try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {banner}
        </div>
      )}

      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        <strong>Good news - you pre-qualify.</strong> We just need to confirm who you are before
        we can make a final decision.
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
          className="rounded-lg border border-slate-300 px-6 py-4 text-base font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-brand-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Verifying...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
