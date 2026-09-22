'use client';

import { useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { getTracking } from '@/lib/tracking';
import { digitsOnly, formatCurrency, formatCurrency2 } from '@/lib/format';
import { validateAccountNumber, validateRoutingNumber, required } from '@/lib/validation';
import type {
  ConsentTemplate,
  FieldErrors,
  LookupOptions,
  Offer,
  Step3Response,
} from '@/lib/types';
import { SectionCard } from '../SectionCard';
import { TrustMarkers } from '../TrustMarkers';
import { ConsentCheckbox } from '../ConsentCheckbox';
import { TextField } from '../fields/TextField';
import { SelectField } from '../fields/SelectField';
import { RadioGroup } from '../fields/RadioGroup';

interface Props {
  applicationId: string;
  options: LookupOptions;
  consentTemplates: ConsentTemplate[];
  offer: Offer | null;
  onComplete: (result: Step3Response) => void;
  onBack: () => void;
}

/**
 * Step 3 - bank & funding.
 *
 * Instant Account Verification (Plaid / MX / Finicity) is not used on this
 * build; these manual fields are the only path. The bank name is looked up
 * from the routing number and rendered read-only - we never ask the applicant
 * to type it.
 */
export function Step3({
  applicationId,
  options,
  consentTemplates,
  offer,
  onComplete,
  onBack,
}: Props) {
  const [routing, setRouting] = useState('');
  const [bankName, setBankName] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [account, setAccount] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [accountType, setAccountType] = useState<'' | 'checking' | 'savings'>('');
  const [accountStatus, setAccountStatus] = useState('');
  const [accountAge, setAccountAge] = useState('');
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setError = (key: string, message: string | null) =>
    setErrors((e) => ({ ...e, [key]: message ?? '' }));

  /** Field 44 - populated from the FedACH lookup, never typed. */
  const lookupRouting = async () => {
    const local = validateRoutingNumber(routing);
    setError('routingNumber', local);
    setBankName('');
    if (local) return;

    setLookingUp(true);
    try {
      const res = await api.get<{ valid: boolean; bankName: string | null; inFedachFile?: boolean }>(
        `/lookup/routing?value=${digitsOnly(routing)}`,
      );
      if (!res.valid) {
        setError('routingNumber', 'That routing number is not valid. Please check the 9 digits.');
      } else if (res.bankName) {
        setBankName(res.bankName);
      } else {
        // Not in the participant file - a soft signal, so we let it through
        // and flag it for verification rather than blocking.
        setBankName('Bank not recognised - we will verify this manually');
      }
    } catch {
      /* a lookup outage must not block funding */
    } finally {
      setLookingUp(false);
    }
  };

  const validateAll = (): FieldErrors => {
    const e: FieldErrors = {};
    const routingError = validateRoutingNumber(routing);
    if (routingError) e.routingNumber = routingError;

    const accountError = validateAccountNumber(account);
    if (accountError) e.accountNumber = accountError;
    else if (digitsOnly(account) !== digitsOnly(confirmAccount)) {
      e.confirmAccountNumber = 'The account numbers do not match.';
    }

    const typeError = required(accountType, 'Select your account type.');
    if (typeError) e.accountType = typeError;

    const statusError = required(accountStatus, 'Select your account status.');
    if (statusError) e.accountStatusSelfReported = statusError;

    const ageError = required(accountAge, 'Select how long you have had this account.');
    if (ageError) e.accountAge = ageError;

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
      const result = await api.post<Step3Response>('/applications/step3', {
        applicationId,
        routingNumber: digitsOnly(routing),
        bankName: bankName || undefined,
        accountNumber: digitsOnly(account),
        confirmAccountNumber: digitsOnly(confirmAccount),
        accountType,
        accountStatusSelfReported: accountStatus,
        accountAge,
        consents: consentTemplates.map((t) => ({
          type: t.type,
          accepted: !!consents[t.type],
          versionId: t.versionId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })),
        tracking: getTracking(),
      });

      setAccount('');
      setConfirmAccount('');
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

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {banner}
        </div>
      )}

      {offer && (
        <div className="rounded-xl border border-brand-300 bg-brand-50 p-5">
          <p className="text-sm font-semibold text-brand-900">You&apos;re approved</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            {formatCurrency(offer.amount)}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm text-brand-900">
            <div>
              <dt className="text-xs text-brand-700">Term</dt>
              <dd className="font-medium">{offer.termMonths} months</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-700">APR</dt>
              <dd className="font-medium">{offer.apr}%</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-700">Payment</dt>
              <dd className="font-medium">{formatCurrency2(offer.installment)}</dd>
            </div>
          </dl>
        </div>
      )}

      <SectionCard
        title="Where should we send the money?"
        description="Use the checking or savings account where you want your funds deposited."
      >
        <TrustMarkers variant="bank" />

        <TextField
          id="routingNumber"
          label="Routing number"
          required
          value={routing}
          onChange={(v) => setRouting(v.replace(/\D/g, '').slice(0, 9))}
          onBlur={lookupRouting}
          inputMode="numeric"
          maxLength={9}
          placeholder="9 digits"
          autoComplete="off"
          sensitive
          hint="The 9-digit number on the bottom left of your cheque."
          error={errors.routingNumber}
        />

        <TextField
          id="bankName"
          label="Bank name"
          required
          value={lookingUp ? 'Looking up...' : bankName}
          onChange={() => undefined}
          readOnly
          hint="Filled in automatically from your routing number."
        />

        <TextField
          id="accountNumber"
          label="Account number"
          required
          value={account}
          onChange={(v) => setAccount(v.replace(/\D/g, '').slice(0, 17))}
          onBlur={() => setError('accountNumber', validateAccountNumber(account))}
          inputMode="numeric"
          maxLength={17}
          autoComplete="off"
          sensitive
          error={errors.accountNumber}
        />

        <TextField
          id="confirmAccountNumber"
          label="Confirm account number"
          required
          value={confirmAccount}
          onChange={(v) => setConfirmAccount(v.replace(/\D/g, '').slice(0, 17))}
          onBlur={() =>
            setError(
              'confirmAccountNumber',
              digitsOnly(account) === digitsOnly(confirmAccount)
                ? null
                : 'The account numbers do not match.',
            )
          }
          disablePaste
          inputMode="numeric"
          maxLength={17}
          autoComplete="off"
          sensitive
          hint="Please re-type it - paste is disabled so typos get caught."
          error={errors.confirmAccountNumber}
        />

        <RadioGroup
          id="accountType"
          label="Account type"
          required
          value={accountType}
          options={options.accountTypes as { value: 'checking' | 'savings'; label: string }[]}
          onChange={(v) => setAccountType(v)}
          error={errors.accountType}
        />

        <SelectField
          id="accountStatusSelfReported"
          label="Is this account currently positive or negative?"
          required
          value={accountStatus}
          options={options.accountStatuses}
          onChange={(v) => setAccountStatus(String(v))}
          error={errors.accountStatusSelfReported}
        />

        <SelectField
          id="accountAge"
          label="How long have you had this account?"
          required
          value={accountAge}
          options={options.accountAges}
          onChange={(v) => setAccountAge(String(v))}
          error={errors.accountAge}
        />
      </SectionCard>

      <SectionCard title="Payment authorisation">
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
          {submitting ? 'Submitting...' : 'Finish my application'}
        </button>
      </div>
    </form>
  );
}
