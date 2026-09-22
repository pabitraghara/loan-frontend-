export interface Option<T = string> {
  value: T;
  label: string;
}

/** Served by GET /api/lookup/options so the UI and server share one source. */
export interface LookupOptions {
  loanAmount: { min: number; max: number; step: number; default: number };
  loanPurposes: Option[];
  loanTerms: Option<number>[];
  suffixes: Option[];
  states: Option[];
  residenceTenure: Option[];
  housingStatuses: Option[];
  housingStatusesRequiringPayment: string[];
  employmentStatuses: Option[];
  employerFieldStatuses: string[];
  incomeTypes: Option[];
  derivedIncomeType: Record<string, string | null>;
  jobTenure: Option[];
  payFrequencies: Option[];
  accountTypes: Option[];
  accountStatuses: Option[];
  accountAges: Option[];
  regBNotice: string;
}

export interface ConsentTemplate {
  type: string;
  versionId: string;
  step: 1 | 2 | 3;
  label: string;
  text: string;
  namedParties: string[] | null;
  links: Array<{ label: string; href: string }> | null;
}

export interface TrackingPayload {
  deviceFingerprint?: string;
  pageUrl?: string;
  referrerUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPageFirstTouch?: string;
  jornayaLeadid?: string;
  trustedformCertUrl?: string;
  sessionId?: string;
  timezone?: string;
  timeOnForm?: number;
}

export interface ConsentPayload {
  type: string;
  accepted: boolean;
  versionId: string;
  timezone?: string;
}

/** Field-keyed errors rendered inline beside each input. */
export type FieldErrors = Record<string, string>;

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: FieldErrors;
  code?: string;
  suggestions?: { email?: string };
  lockoutUntil?: string;
  applicationId?: string;
}

export interface Offer {
  amount: number;
  termMonths: number;
  apr: number;
  installment: number;
}

export interface Step1Response {
  applicationId: string;
  status: string;
  prequalified: boolean;
  nextStep: number | null;
  offer: Offer | null;
  reviewFlags: string[];
  resumeToken: string;
  emailSuggestion: string | null;
  availableTerms: number[] | null;
}

export interface Step2Response {
  applicationId: string;
  status: string;
  approved: boolean;
  manualReview?: boolean;
  nextStep: number | null;
  offer?: Offer | null;
  resumeToken?: string;
}

export interface Step3Response {
  applicationId: string;
  status: string;
  bankName: string | null;
  accountNumberMasked: string;
  bankVerificationRequired: boolean;
  /** Single-use link, so the applicant can verify without leaving the flow. */
  bankVerificationUrl?: string;
  /** How many drip emails were scheduled - six, two a day for three days. */
  dripScheduled: number;
  dripSchedule?: Array<{
    sequence: number;
    day: number;
    emailType: string;
    scheduledAt: string;
    status: string;
  }>;
}

/** Saved state returned by the resume link - step 2/3 come back masked only. */
export interface ResumeState {
  applicationId: string;
  status: string;
  currentStep: number;
  highestStepReached: number;
  prequalified: boolean;
  approved: boolean;
  bankVerificationStatus: string;
  offer: Offer | null;
  step1: Record<string, any>;
  step2: {
    completed: boolean;
    ssnMasked: string | null;
    driversLicenseMasked: string | null;
    dlIssuingState: string | null;
    dlExpirationDate: string | null;
  };
  step3: {
    completed: boolean;
    bankName: string | null;
    routingNumberMasked: string | null;
    accountNumberMasked: string | null;
    accountType: string | null;
    accountStatusSelfReported: string | null;
    accountAge: string | null;
  };
  derived: Record<string, any>;
}
