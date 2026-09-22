'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { getTracking } from '@/lib/tracking';
import { clearAutosave, readAutosave, useAutosave } from '@/lib/useAutosave';
import {
  validateCurrency,
  validateDob,
  validateEmail,
  validateName,
  validateNextPayDate,
  validatePhone,
  validateStreetAddress,
  validateZip,
  required,
  suggestEmail,
} from '@/lib/validation';
import { digitsOnly, formatPhone } from '@/lib/format';
import type {
  ConsentTemplate,
  FieldErrors,
  LookupOptions,
  Step1Response,
} from '@/lib/types';
import { SectionCard } from '../SectionCard';
import { RegBNotice } from '../RegBNotice';
import { ConsentCheckbox } from '../ConsentCheckbox';
import { AmountSlider } from '../fields/AmountSlider';
import { TextField } from '../fields/TextField';
import { SelectField } from '../fields/SelectField';
import { CurrencyField } from '../fields/CurrencyField';
import { DateField } from '../fields/DateField';
import { RadioGroup } from '../fields/RadioGroup';

const AUTOSAVE_KEY = 'ryer.step1';

interface Step1State {
  loanAmount: number;
  loanPurpose: string;
  loanPurposeOther: string;
  loanTermMonths: number | '';
  firstName: string;
  middleInitial: string;
  lastName: string;
  suffix: string;
  email: string;
  confirmEmail: string;
  phone: string;
  dateOfBirth: string;
  streetAddress: string;
  aptUnit: string;
  city: string;
  state: string;
  zipCode: string;
  timeAtCurrentAddress: string;
  housingStatus: string;
  monthlyHousingPayment: number | undefined;
  employmentStatus: string;
  primaryIncomeType: string;
  employerName: string;
  jobTitle: string;
  employerPhone: string;
  timeAtCurrentJob: string;
  netMonthlyIncome: number | undefined;
  payFrequency: string;
  nextPayDate: string;
  directDeposit: '' | 'yes' | 'no';
  additionalMonthlyIncome: number | undefined;
  additionalIncomeSource: string;
}

const initialState = (defaultAmount: number): Step1State => ({
  loanAmount: defaultAmount,
  loanPurpose: '',
  loanPurposeOther: '',
  loanTermMonths: '',
  firstName: '',
  middleInitial: '',
  lastName: '',
  suffix: '',
  email: '',
  confirmEmail: '',
  phone: '',
  dateOfBirth: '',
  streetAddress: '',
  aptUnit: '',
  city: '',
  state: '',
  zipCode: '',
  timeAtCurrentAddress: '',
  housingStatus: '',
  monthlyHousingPayment: undefined,
  employmentStatus: '',
  primaryIncomeType: '',
  employerName: '',
  jobTitle: '',
  employerPhone: '',
  timeAtCurrentJob: '',
  netMonthlyIncome: undefined,
  payFrequency: '',
  nextPayDate: '',
  directDeposit: '',
  additionalMonthlyIncome: undefined,
  additionalIncomeSource: '',
});

interface Props {
  options: LookupOptions;
  consentTemplates: ConsentTemplate[];
  /** Prefilled when resuming - rehydrates without losing anything. */
  initial?: Partial<Step1State> & { applicationId?: string };
  applicationId?: string;
  onComplete: (result: Step1Response) => void;
  /** Keeps the quote rail in step with the slider and term dropdown. */
  onQuoteChange?: (amount: number, termMonths: number | '') => void;
}

export function Step1({
  options,
  consentTemplates,
  initial,
  applicationId,
  onComplete,
  onQuoteChange,
}: Props) {
  const [form, setForm] = useState<Step1State>(() => ({
    ...initialState(options.loanAmount.default),
    ...(initial ?? {}),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [terms, setTerms] = useState<number[]>(options.loanTerms.map((t) => t.value));
  const [amountCap, setAmountCap] = useState<{ min: number; max: number; note: string | null }>({
    min: options.loanAmount.min,
    max: options.loanAmount.max,
    note: null,
  });

  // Local autosave for Step 1 only. Nothing sensitive lives on this step.
  useAutosave(AUTOSAVE_KEY, form, !initial);

  useEffect(() => {
    if (initial) return;
    const saved = readAutosave<Step1State>(AUTOSAVE_KEY);
    if (saved) setForm((f) => ({ ...f, ...saved }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push the quote up whenever the two inputs that drive it change.
  useEffect(() => {
    onQuoteChange?.(form.loanAmount, form.loanTermMonths);
  }, [form.loanAmount, form.loanTermMonths, onQuoteChange]);

  const set = useCallback(<K extends keyof Step1State>(key: K, value: Step1State[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear only this field's error. We never clear the field's value.
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: '' } : e));
  }, []);

  const setError = useCallback((key: string, message: string | null) => {
    setErrors((e) => ({ ...e, [key]: message ?? '' }));
  }, []);

  // ---------------- conditional visibility (spec fields 3, 20, 22, 23-26, 29, 32)
  const showPurposeOther = form.loanPurpose === 'other_personal_expenses';
  const showHousingPayment = options.housingStatusesRequiringPayment.includes(form.housingStatus);
  const showEmployerFields = options.employerFieldStatuses.includes(form.employmentStatus);
  const derivedIncomeType = options.derivedIncomeType[form.employmentStatus] ?? null;
  const showIncomeType = !!form.employmentStatus && derivedIncomeType === null;
  const showNextPayDate = !!form.payFrequency && form.payFrequency !== 'irregular';
  const showAdditionalSource = (form.additionalMonthlyIncome ?? 0) > 0;

  const totalMonthlyIncome =
    (form.netMonthlyIncome ?? 0) + (form.additionalMonthlyIncome ?? 0);

  // ---------------- term + amount rules, re-queried whenever the inputs change
  useEffect(() => {
    if (!form.state) return;
    const controller = new AbortController();
    const query = new URLSearchParams({
      amount: String(form.loanAmount),
      state: form.state,
      ...(totalMonthlyIncome > 0 ? { income: String(totalMonthlyIncome) } : {}),
    });

    api
      .get<{
        licensed: boolean;
        minAmount: number;
        maxAmount: number;
        terms: number[];
      }>(`/lookup/product-rules?${query}`)
      .then((rules) => {
        setTerms(rules.terms);
        setAmountCap({
          min: rules.minAmount,
          max: rules.maxAmount,
          note: !rules.licensed
            ? 'We are not currently licensed to lend in the state you selected.'
            : rules.maxAmount < options.loanAmount.max
              ? `State rules cap loans at $${rules.maxAmount.toLocaleString()} where you live.`
              : null,
        });
        if (form.loanTermMonths && !rules.terms.includes(Number(form.loanTermMonths))) {
          set('loanTermMonths', '');
        }
        if (form.loanAmount > rules.maxAmount) set('loanAmount', rules.maxAmount);
        if (form.loanAmount < rules.minAmount) set('loanAmount', rules.minAmount);
      })
      .catch(() => undefined);

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state, form.loanAmount, totalMonthlyIncome]);

  const termOptions = useMemo(
    () => terms.map((t) => ({ value: t, label: `${t} months` })),
    [terms],
  );

  // ---------------- async blur checks (email MX + disposable, ZIP/state)
  const checkEmailOnBlur = async () => {
    const local = validateEmail(form.email);
    setError('email', local);
    setEmailSuggestion(suggestEmail(form.email));
    if (local) return;
    try {
      const res = await api.get<{ valid: boolean; reason?: string; suggestion?: string | null }>(
        `/lookup/email?value=${encodeURIComponent(form.email)}`,
      );
      if (!res.valid) {
        setError(
          'email',
          res.reason === 'disposable'
            ? 'Temporary or disposable email addresses are not accepted.'
            : res.reason === 'no_mx'
              ? 'That email domain cannot receive mail. Please check the spelling.'
              : 'Enter a valid email address.',
        );
      }
      if (res.suggestion) setEmailSuggestion(res.suggestion);
    } catch {
      /* a lookup outage must not block the applicant */
    }
  };

  const checkZipOnBlur = async () => {
    const local = validateZip(form.zipCode);
    setError('zipCode', local);
    if (local || !form.state) return;
    try {
      const res = await api.get<{ valid: boolean; suggestedState: string | null }>(
        `/lookup/zip?zip=${form.zipCode}&state=${form.state}`,
      );
      if (!res.valid) {
        setError(
          'zipCode',
          res.suggestedState
            ? `That ZIP code is in ${res.suggestedState}, not ${form.state}.`
            : 'That ZIP code does not match the state you selected.',
        );
      }
    } catch {
      /* ignore */
    }
  };

  // ---------------- submit
  const validateAll = (): FieldErrors => {
    const e: FieldErrors = {};
    const put = (k: string, m: string | null) => {
      if (m) e[k] = m;
    };

    put('loanPurpose', required(form.loanPurpose, 'Select what the loan is for.'));
    if (showPurposeOther) {
      const detail = form.loanPurposeOther.trim();
      if (detail.length < 3 || detail.length > 120) {
        e.loanPurposeOther = 'Tell us briefly what the loan is for (3-120 characters).';
      }
    }
    put('loanTermMonths', required(form.loanTermMonths, 'Choose how long you need to repay.'));
    put('firstName', validateName(form.firstName, 'First name'));
    put('lastName', validateName(form.lastName, 'Last name'));
    put('email', validateEmail(form.email));
    if (form.email.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase()) {
      e.confirmEmail = 'Email addresses do not match.';
    }
    put('phone', validatePhone(form.phone));
    put('dateOfBirth', form.dateOfBirth ? null : 'Enter your date of birth.');
    if (form.dateOfBirth) {
      const [y, m, d] = form.dateOfBirth.split('-');
      put('dateOfBirth', validateDob(`${m}/${d}/${y}`));
    }
    put('streetAddress', validateStreetAddress(form.streetAddress));
    put('city', required(form.city, 'Enter your city.'));
    put('state', required(form.state, 'Select your state.'));
    put('zipCode', validateZip(form.zipCode));
    put('timeAtCurrentAddress', required(form.timeAtCurrentAddress, 'Select how long you have lived there.'));
    put('housingStatus', required(form.housingStatus, 'Select your housing status.'));
    if (showHousingPayment) {
      put(
        'monthlyHousingPayment',
        validateCurrency(form.monthlyHousingPayment, 0, 15000, 'your monthly housing payment'),
      );
    }
    put('employmentStatus', required(form.employmentStatus, 'Select your employment status.'));
    if (showIncomeType) {
      put('primaryIncomeType', required(form.primaryIncomeType, 'Select your main source of income.'));
    }
    if (showEmployerFields) {
      put('employerName', required(form.employerName.trim(), 'Enter your employer name.'));
      put('jobTitle', required(form.jobTitle.trim(), 'Enter your job title.'));
      put('employerPhone', validatePhone(form.employerPhone));
      put('timeAtCurrentJob', required(form.timeAtCurrentJob, 'Select how long you have been there.'));
    }
    put(
      'netMonthlyIncome',
      validateCurrency(form.netMonthlyIncome, 500, 50000, 'your take-home pay'),
    );
    put('payFrequency', required(form.payFrequency, 'Select how often you are paid.'));
    if (showNextPayDate) {
      if (!form.nextPayDate) {
        e.nextPayDate = 'Enter your next pay date.';
      } else {
        const [y, m, d] = form.nextPayDate.split('-');
        put('nextPayDate', validateNextPayDate(`${m}/${d}/${y}`));
      }
    }
    put('directDeposit', required(form.directDeposit, 'Let us know if your income is direct deposited.'));
    if (showAdditionalSource) {
      put(
        'additionalIncomeSource',
        required(form.additionalIncomeSource.trim(), 'Tell us where this income comes from.'),
      );
    }

    for (const t of consentTemplates) {
      if (!consents[t.type]) {
        e[`consents.${t.type}`] = 'You must agree to continue.';
      }
    }

    return e;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBanner(null);

    const found = validateAll();
    if (Object.keys(found).length) {
      setErrors(found);
      const first = document.querySelector('[aria-invalid="true"], [role="alert"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        applicationId,
        loanAmount: form.loanAmount,
        loanPurpose: form.loanPurpose,
        loanPurposeOther: showPurposeOther ? form.loanPurposeOther.trim() : undefined,
        loanTermMonths: Number(form.loanTermMonths),
        firstName: form.firstName.trim(),
        middleInitial: form.middleInitial || undefined,
        lastName: form.lastName.trim(),
        suffix: form.suffix || undefined,
        email: form.email.trim().toLowerCase(),
        confirmEmail: form.confirmEmail.trim().toLowerCase(),
        phone: digitsOnly(form.phone),
        dateOfBirth: form.dateOfBirth,
        streetAddress: form.streetAddress.trim(),
        aptUnit: form.aptUnit || undefined,
        city: form.city.trim(),
        state: form.state,
        zipCode: form.zipCode,
        timeAtCurrentAddress: form.timeAtCurrentAddress,
        housingStatus: form.housingStatus,
        monthlyHousingPayment: showHousingPayment ? form.monthlyHousingPayment : undefined,
        employmentStatus: form.employmentStatus,
        primaryIncomeType: showIncomeType ? form.primaryIncomeType : undefined,
        employerName: showEmployerFields ? form.employerName.trim() : undefined,
        jobTitle: showEmployerFields ? form.jobTitle.trim() : undefined,
        employerPhone: showEmployerFields ? digitsOnly(form.employerPhone) : undefined,
        timeAtCurrentJob: showEmployerFields ? form.timeAtCurrentJob : undefined,
        netMonthlyIncome: form.netMonthlyIncome,
        payFrequency: form.payFrequency,
        nextPayDate: showNextPayDate ? form.nextPayDate : undefined,
        directDeposit: form.directDeposit === 'yes',
        additionalMonthlyIncome: form.additionalMonthlyIncome ?? 0,
        additionalIncomeSource: showAdditionalSource
          ? form.additionalIncomeSource.trim()
          : undefined,
        consents: consentTemplates.map((t) => ({
          type: t.type,
          accepted: !!consents[t.type],
          versionId: t.versionId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })),
        tracking: getTracking(),
      };

      const result = await api.post<Step1Response>('/applications/step1', payload);
      clearAutosave(AUTOSAVE_KEY);
      onComplete(result);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.fieldErrors);
        setBanner(err.payload.message);
        if (err.payload.suggestions?.email) setEmailSuggestion(err.payload.suggestions.email);
      } else {
        setBanner('Something went wrong. Please try again.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const suffixOptions = options.suffixes.filter((s) => s.value !== 'none');

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {banner && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {banner}
        </div>
      )}

      {/* ---------------- 1.1 Loan request ---------------- */}
      <SectionCard step={1} title="What do you need?" description="Move the slider to the amount you want.">
        <AmountSlider
          value={form.loanAmount}
          min={amountCap.min}
          max={amountCap.max}
          step={options.loanAmount.step}
          onChange={(v) => set('loanAmount', v)}
          error={errors.loanAmount}
          capNote={amountCap.note}
          termMonths={form.loanTermMonths}
        />

        <SelectField
          id="loanPurpose"
          label="What is the loan for?"
          required
          value={form.loanPurpose}
          options={options.loanPurposes}
          onChange={(v) => set('loanPurpose', String(v))}
          error={errors.loanPurpose}
        />

        {showPurposeOther && (
          <TextField
            id="loanPurposeOther"
            label="Tell us a little more"
            required
            value={form.loanPurposeOther}
            onChange={(v) => set('loanPurposeOther', v)}
            maxLength={120}
            placeholder="e.g. replacing a broken refrigerator"
            error={errors.loanPurposeOther}
            hint="3-120 characters"
          />
        )}

        <SelectField
          id="loanTermMonths"
          label="How long do you need to repay?"
          required
          value={form.loanTermMonths}
          options={termOptions}
          onChange={(v) => set('loanTermMonths', v === '' ? '' : Number(v))}
          error={errors.loanTermMonths}
          hint={
            form.state
              ? 'Terms shown are the ones available for your amount and state.'
              : 'Select your state below to see every term available to you.'
          }
        />
      </SectionCard>

      {/* ---------------- 1.2 Identity ---------------- */}
      <SectionCard step={2} title="About you" description="As it appears on your government ID.">
        <div className="grid gap-5 sm:grid-cols-[1fr_6rem]">
          <TextField
            id="firstName"
            label="First name"
            required
            value={form.firstName}
            onChange={(v) => set('firstName', v)}
            onBlur={() => setError('firstName', validateName(form.firstName, 'First name'))}
            autoComplete="given-name"
            maxLength={40}
            error={errors.firstName}
          />
          <TextField
            id="middleInitial"
            label="M.I."
            value={form.middleInitial}
            onChange={(v) => set('middleInitial', v.replace(/[^A-Za-z]/g, '').toUpperCase())}
            autoComplete="additional-name"
            maxLength={1}
            error={errors.middleInitial}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_7rem]">
          <TextField
            id="lastName"
            label="Last name"
            required
            value={form.lastName}
            onChange={(v) => set('lastName', v)}
            onBlur={() => setError('lastName', validateName(form.lastName, 'Last name'))}
            autoComplete="family-name"
            maxLength={40}
            error={errors.lastName}
          />
          <SelectField
            id="suffix"
            label="Suffix"
            value={form.suffix}
            options={suffixOptions}
            onChange={(v) => set('suffix', String(v))}
            placeholder="None"
            autoComplete="honorific-suffix"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="email"
          label="Email address"
          required
          type="email"
          value={form.email}
          onChange={(v) => set('email', v)}
          onBlur={checkEmailOnBlur}
          autoComplete="email"
          inputMode="email"
          error={errors.email}
          suggestion={
            emailSuggestion && emailSuggestion !== form.email ? (
              <p className="text-sm text-amber-700">
                Did you mean{' '}
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => {
                    set('email', emailSuggestion);
                    set('confirmEmail', emailSuggestion);
                    setEmailSuggestion(null);
                    setError('email', null);
                  }}
                >
                  {emailSuggestion}
                </button>
                ?
              </p>
            ) : null
          }
        />

        <TextField
          id="confirmEmail"
          label="Confirm email address"
          required
          type="email"
          value={form.confirmEmail}
          onChange={(v) => set('confirmEmail', v)}
          onBlur={() =>
            setError(
              'confirmEmail',
              form.email.trim().toLowerCase() === form.confirmEmail.trim().toLowerCase()
                ? null
                : 'Email addresses do not match.',
            )
          }
          disablePaste
          autoComplete="off"
          inputMode="email"
          hint="Please re-type it - paste is disabled so typos get caught."
          error={errors.confirmEmail}
        />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="phone"
          label="Mobile phone"
          required
          type="tel"
          value={form.phone}
          onChange={(v) => set('phone', formatPhone(v))}
          onBlur={() => setError('phone', validatePhone(form.phone))}
          autoComplete="tel-national"
          inputMode="numeric"
          placeholder="(555) 123-4567"
          error={errors.phone}
        />

        <DateField
          id="dateOfBirth"
          label="Date of birth"
          required
          value={form.dateOfBirth}
          onChange={(v) => set('dateOfBirth', v)}
          onBlur={() => {
            if (!form.dateOfBirth) return setError('dateOfBirth', 'Enter your date of birth.');
            const [y, m, d] = form.dateOfBirth.split('-');
            setError('dateOfBirth', validateDob(`${m}/${d}/${y}`));
          }}
          autoComplete="bday"
          max={new Date().toISOString().slice(0, 10)}
          error={errors.dateOfBirth}
        />
        </div>
      </SectionCard>

      {/* ---------------- 1.3 Residence ---------------- */}
      <SectionCard step={3} title="Where do you live?" description="Your home address, not a PO Box.">
        <TextField
          id="streetAddress"
          label="Street address"
          required
          value={form.streetAddress}
          onChange={(v) => set('streetAddress', v)}
          onBlur={() => setError('streetAddress', validateStreetAddress(form.streetAddress))}
          autoComplete="address-line1"
          maxLength={100}
          error={errors.streetAddress}
        />

        <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
          <TextField
            id="aptUnit"
            label="Apt / Unit"
            value={form.aptUnit}
            onChange={(v) => set('aptUnit', v)}
            autoComplete="address-line2"
            maxLength={20}
          />
          <TextField
            id="city"
            label="City"
            required
            value={form.city}
            onChange={(v) => set('city', v)}
            autoComplete="address-level2"
            maxLength={50}
            error={errors.city}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <SelectField
            id="state"
            label="State"
            required
            value={form.state}
            options={options.states}
            onChange={(v) => set('state', String(v))}
            autoComplete="address-level1"
            error={errors.state}
          />
          <TextField
            id="zipCode"
            label="ZIP code"
            required
            value={form.zipCode}
            onChange={(v) => set('zipCode', v.replace(/\D/g, '').slice(0, 5))}
            onBlur={checkZipOnBlur}
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={5}
            placeholder="12345"
            error={errors.zipCode}
          />
        </div>

        <SelectField
          id="timeAtCurrentAddress"
          label="How long have you lived at this address?"
          required
          value={form.timeAtCurrentAddress}
          options={options.residenceTenure}
          onChange={(v) => set('timeAtCurrentAddress', String(v))}
          error={errors.timeAtCurrentAddress}
        />

        <SelectField
          id="housingStatus"
          label="Housing status"
          required
          value={form.housingStatus}
          options={options.housingStatuses}
          onChange={(v) => set('housingStatus', String(v))}
          error={errors.housingStatus}
        />

        {showHousingPayment && (
          <CurrencyField
            id="monthlyHousingPayment"
            label="Monthly housing payment"
            required
            value={form.monthlyHousingPayment}
            onChange={(v) => set('monthlyHousingPayment', v)}
            onBlur={() =>
              setError(
                'monthlyHousingPayment',
                validateCurrency(form.monthlyHousingPayment, 0, 15000, 'your monthly housing payment'),
              )
            }
            error={errors.monthlyHousingPayment}
          />
        )}
      </SectionCard>

      {/* ---------------- 1.4 Employment & income ---------------- */}
      <SectionCard step={4} title="Your income" description="Enough to check affordability, and no more.">
        {/* Reg B notice renders before any income field. */}
        <RegBNotice text={options.regBNotice} />

        <SelectField
          id="employmentStatus"
          label="Employment status"
          required
          value={form.employmentStatus}
          options={options.employmentStatuses}
          onChange={(v) => {
            set('employmentStatus', String(v));
            // Clear the employer block when it no longer applies, so a change
            // of status cannot leave stale answers behind.
            if (!options.employerFieldStatuses.includes(String(v))) {
              set('employerName', '');
              set('jobTitle', '');
              set('employerPhone', '');
              set('timeAtCurrentJob', '');
            }
          }}
          error={errors.employmentStatus}
        />

        {showIncomeType && (
          <SelectField
            id="primaryIncomeType"
            label="Main source of income"
            required
            value={form.primaryIncomeType}
            options={options.incomeTypes}
            onChange={(v) => set('primaryIncomeType', String(v))}
            error={errors.primaryIncomeType}
          />
        )}

        {showEmployerFields && (
          <>
            <TextField
              id="employerName"
              label="Employer name"
              required
              value={form.employerName}
              onChange={(v) => set('employerName', v)}
              autoComplete="organization"
              maxLength={60}
              error={errors.employerName}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="jobTitle"
                label="Job title"
                required
                value={form.jobTitle}
                onChange={(v) => set('jobTitle', v)}
                autoComplete="organization-title"
                maxLength={50}
                error={errors.jobTitle}
              />
              <TextField
                id="employerPhone"
                label="Employer phone"
                required
                type="tel"
                value={form.employerPhone}
                onChange={(v) => set('employerPhone', formatPhone(v))}
                onBlur={() => setError('employerPhone', validatePhone(form.employerPhone))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="(555) 123-4567"
                error={errors.employerPhone}
              />
            </div>
            <SelectField
              id="timeAtCurrentJob"
              label="How long have you been at this job?"
              required
              value={form.timeAtCurrentJob}
              options={options.jobTenure}
              onChange={(v) => set('timeAtCurrentJob', String(v))}
              error={errors.timeAtCurrentJob}
            />
          </>
        )}

        <CurrencyField
          id="netMonthlyIncome"
          label="Net monthly income"
          required
          value={form.netMonthlyIncome}
          onChange={(v) => set('netMonthlyIncome', v)}
          onBlur={() =>
            setError(
              'netMonthlyIncome',
              validateCurrency(form.netMonthlyIncome, 500, 50000, 'your take-home pay'),
            )
          }
          hint="Your take-home pay after taxes and deductions."
          error={errors.netMonthlyIncome}
        />

        <SelectField
          id="payFrequency"
          label="How often are you paid?"
          required
          value={form.payFrequency}
          options={options.payFrequencies}
          onChange={(v) => set('payFrequency', String(v))}
          error={errors.payFrequency}
        />

        {showNextPayDate && (
          <DateField
            id="nextPayDate"
            label="Next pay date"
            required
            value={form.nextPayDate}
            onChange={(v) => set('nextPayDate', v)}
            min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
            max={new Date(Date.now() + 35 * 86_400_000).toISOString().slice(0, 10)}
            error={errors.nextPayDate}
          />
        )}

        <RadioGroup
          id="directDeposit"
          label="Is your income deposited directly into your bank account?"
          required
          value={form.directDeposit}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          onChange={(v) => set('directDeposit', v)}
          error={errors.directDeposit}
        />

        <CurrencyField
          id="additionalMonthlyIncome"
          label="Additional monthly income"
          value={form.additionalMonthlyIncome}
          onChange={(v) => set('additionalMonthlyIncome', v)}
          hint="Leave blank if this does not apply to you."
          error={errors.additionalMonthlyIncome}
        />

        {showAdditionalSource && (
          <TextField
            id="additionalIncomeSource"
            label="Where does this income come from?"
            required
            value={form.additionalIncomeSource}
            onChange={(v) => set('additionalIncomeSource', v)}
            maxLength={50}
            error={errors.additionalIncomeSource}
          />
        )}
      </SectionCard>

      {/* ---------------- Consents ---------------- */}
      <SectionCard
        step={5}
        title="Your agreements"
        description="Each one is separate. Nothing is pre-ticked."
      >
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

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-6 py-4 text-base font-semibold text-white
                   transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Checking your eligibility...' : 'See if I qualify'}
      </button>

      <p className="pb-16 text-center text-xs text-slate-500 lg:pb-0">
        Checking your eligibility uses a soft credit inquiry. It will not affect your credit
        score, and it is not visible to other lenders.
      </p>
    </form>
  );
}
