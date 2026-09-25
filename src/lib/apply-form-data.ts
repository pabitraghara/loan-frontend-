import type { ConsentTemplate, LookupOptions } from "./types";

/**
 * The apply form is not connected to the API. These are copies of what
 * GET /lookup/options and GET /consents/templates returned, taken from
 * loan-backend, so the form renders without a server. If the backend lists
 * change, update them here too.
 */
export const APPLY_FORM_OPTIONS: LookupOptions = {
  "loanAmount": {
    "min": 2000,
    "max": 50000,
    "step": 500,
    "default": 10000
  },
  "loanPurposes": [
    {
      "value": "debt_consolidation",
      "label": "Debt Consolidation"
    },
    {
      "value": "emergency_expenses",
      "label": "Emergency Expenses"
    },
    {
      "value": "medical_expenses",
      "label": "Medical Expenses"
    },
    {
      "value": "dental_expenses",
      "label": "Dental Expenses"
    },
    {
      "value": "home_improvement",
      "label": "Home Improvement"
    },
    {
      "value": "auto_repair",
      "label": "Auto Repair"
    },
    {
      "value": "moving_expenses",
      "label": "Moving Expenses"
    },
    {
      "value": "wedding_expenses",
      "label": "Wedding Expenses"
    },
    {
      "value": "vacation",
      "label": "Vacation"
    },
    {
      "value": "education",
      "label": "Education"
    },
    {
      "value": "rent_or_utilities",
      "label": "Rent or Utilities"
    },
    {
      "value": "major_purchase",
      "label": "Major Purchase"
    },
    {
      "value": "childcare_expenses",
      "label": "Childcare Expenses"
    },
    {
      "value": "funeral_expenses",
      "label": "Funeral Expenses"
    },
    {
      "value": "tax_payments",
      "label": "Tax Payments"
    },
    {
      "value": "business_expenses",
      "label": "Business Expenses"
    },
    {
      "value": "other_personal_expenses",
      "label": "Other Personal Expenses"
    }
  ],
  "loanTerms": [
    {
      "value": 12,
      "label": "12 months"
    },
    {
      "value": 24,
      "label": "24 months"
    },
    {
      "value": 36,
      "label": "36 months"
    },
    {
      "value": 48,
      "label": "48 months"
    }
  ],
  "suffixes": [
    {
      "value": "none",
      "label": "None"
    },
    {
      "value": "jr",
      "label": "Jr"
    },
    {
      "value": "sr",
      "label": "Sr"
    },
    {
      "value": "ii",
      "label": "II"
    },
    {
      "value": "iii",
      "label": "III"
    },
    {
      "value": "iv",
      "label": "IV"
    }
  ],
  "states": [
    {
      "value": "AL",
      "label": "Alabama"
    },
    {
      "value": "AK",
      "label": "Alaska"
    },
    {
      "value": "AZ",
      "label": "Arizona"
    },
    {
      "value": "AR",
      "label": "Arkansas"
    },
    {
      "value": "CA",
      "label": "California"
    },
    {
      "value": "CO",
      "label": "Colorado"
    },
    {
      "value": "CT",
      "label": "Connecticut"
    },
    {
      "value": "DE",
      "label": "Delaware"
    },
    {
      "value": "DC",
      "label": "District of Columbia"
    },
    {
      "value": "FL",
      "label": "Florida"
    },
    {
      "value": "GA",
      "label": "Georgia"
    },
    {
      "value": "HI",
      "label": "Hawaii"
    },
    {
      "value": "ID",
      "label": "Idaho"
    },
    {
      "value": "IL",
      "label": "Illinois"
    },
    {
      "value": "IN",
      "label": "Indiana"
    },
    {
      "value": "IA",
      "label": "Iowa"
    },
    {
      "value": "KS",
      "label": "Kansas"
    },
    {
      "value": "KY",
      "label": "Kentucky"
    },
    {
      "value": "LA",
      "label": "Louisiana"
    },
    {
      "value": "ME",
      "label": "Maine"
    },
    {
      "value": "MD",
      "label": "Maryland"
    },
    {
      "value": "MA",
      "label": "Massachusetts"
    },
    {
      "value": "MI",
      "label": "Michigan"
    },
    {
      "value": "MN",
      "label": "Minnesota"
    },
    {
      "value": "MS",
      "label": "Mississippi"
    },
    {
      "value": "MO",
      "label": "Missouri"
    },
    {
      "value": "MT",
      "label": "Montana"
    },
    {
      "value": "NE",
      "label": "Nebraska"
    },
    {
      "value": "NV",
      "label": "Nevada"
    },
    {
      "value": "NH",
      "label": "New Hampshire"
    },
    {
      "value": "NJ",
      "label": "New Jersey"
    },
    {
      "value": "NM",
      "label": "New Mexico"
    },
    {
      "value": "NY",
      "label": "New York"
    },
    {
      "value": "NC",
      "label": "North Carolina"
    },
    {
      "value": "ND",
      "label": "North Dakota"
    },
    {
      "value": "OH",
      "label": "Ohio"
    },
    {
      "value": "OK",
      "label": "Oklahoma"
    },
    {
      "value": "OR",
      "label": "Oregon"
    },
    {
      "value": "PA",
      "label": "Pennsylvania"
    },
    {
      "value": "RI",
      "label": "Rhode Island"
    },
    {
      "value": "SC",
      "label": "South Carolina"
    },
    {
      "value": "SD",
      "label": "South Dakota"
    },
    {
      "value": "TN",
      "label": "Tennessee"
    },
    {
      "value": "TX",
      "label": "Texas"
    },
    {
      "value": "UT",
      "label": "Utah"
    },
    {
      "value": "VT",
      "label": "Vermont"
    },
    {
      "value": "VA",
      "label": "Virginia"
    },
    {
      "value": "WA",
      "label": "Washington"
    },
    {
      "value": "WV",
      "label": "West Virginia"
    },
    {
      "value": "WI",
      "label": "Wisconsin"
    },
    {
      "value": "WY",
      "label": "Wyoming"
    }
  ],
  "residenceTenure": [
    {
      "value": "under_6_months",
      "label": "Under 6 months"
    },
    {
      "value": "6_11_months",
      "label": "6-11 months"
    },
    {
      "value": "1_2_years",
      "label": "1-2 years"
    },
    {
      "value": "3_5_years",
      "label": "3-5 years"
    },
    {
      "value": "5_plus_years",
      "label": "5+ years"
    }
  ],
  "housingStatuses": [
    {
      "value": "rent",
      "label": "Rent"
    },
    {
      "value": "own_with_mortgage",
      "label": "Own with mortgage"
    },
    {
      "value": "own_outright",
      "label": "Own outright"
    },
    {
      "value": "living_with_family_or_friends",
      "label": "Living with family or friends"
    },
    {
      "value": "military_housing",
      "label": "Military housing"
    },
    {
      "value": "other",
      "label": "Other"
    }
  ],
  "housingStatusesRequiringPayment": [
    "rent",
    "own_with_mortgage"
  ],
  "employmentStatuses": [
    {
      "value": "employed_full_time",
      "label": "Employed - Full Time"
    },
    {
      "value": "employed_part_time",
      "label": "Employed - Part Time"
    },
    {
      "value": "self_employed",
      "label": "Self-Employed"
    },
    {
      "value": "active_military",
      "label": "Active Military"
    },
    {
      "value": "retired",
      "label": "Retired"
    },
    {
      "value": "disability",
      "label": "Disability"
    },
    {
      "value": "social_security",
      "label": "Social Security"
    },
    {
      "value": "unemployment_benefits",
      "label": "Unemployment Benefits"
    },
    {
      "value": "other_benefits",
      "label": "Other Benefits"
    },
    {
      "value": "student",
      "label": "Student"
    },
    {
      "value": "not_currently_employed",
      "label": "Not Currently Employed"
    }
  ],
  "employerFieldStatuses": [
    "employed_full_time",
    "employed_part_time",
    "self_employed",
    "active_military"
  ],
  "incomeTypes": [
    {
      "value": "employment",
      "label": "Employment"
    },
    {
      "value": "self_employment",
      "label": "Self-Employment"
    },
    {
      "value": "retirement_or_pension",
      "label": "Retirement or Pension"
    },
    {
      "value": "social_security",
      "label": "Social Security"
    },
    {
      "value": "disability",
      "label": "Disability"
    },
    {
      "value": "unemployment",
      "label": "Unemployment"
    },
    {
      "value": "other",
      "label": "Other"
    }
  ],
  "derivedIncomeType": {
    "employed_full_time": "employment",
    "employed_part_time": "employment",
    "self_employed": "self_employment",
    "active_military": "employment",
    "retired": "retirement_or_pension",
    "disability": "disability",
    "social_security": "social_security",
    "unemployment_benefits": "unemployment",
    "other_benefits": null,
    "student": null,
    "not_currently_employed": null
  },
  "jobTenure": [
    {
      "value": "under_3_months",
      "label": "Under 3 months"
    },
    {
      "value": "3_5_months",
      "label": "3-5 months"
    },
    {
      "value": "6_11_months",
      "label": "6-11 months"
    },
    {
      "value": "1_2_years",
      "label": "1-2 years"
    },
    {
      "value": "3_5_years",
      "label": "3-5 years"
    },
    {
      "value": "5_plus_years",
      "label": "5+ years"
    }
  ],
  "payFrequencies": [
    {
      "value": "weekly",
      "label": "Weekly"
    },
    {
      "value": "every_two_weeks",
      "label": "Every two weeks"
    },
    {
      "value": "twice_a_month",
      "label": "Twice a month"
    },
    {
      "value": "monthly",
      "label": "Monthly"
    },
    {
      "value": "irregular",
      "label": "Irregular"
    }
  ],
  "accountTypes": [
    {
      "value": "checking",
      "label": "Checking"
    },
    {
      "value": "savings",
      "label": "Savings"
    }
  ],
  "accountStatuses": [
    {
      "value": "positive",
      "label": "Positive"
    },
    {
      "value": "negative",
      "label": "Negative"
    }
  ],
  "accountAges": [
    {
      "value": "under_6_months",
      "label": "Under 6 months"
    },
    {
      "value": "1_year",
      "label": "1 Year"
    },
    {
      "value": "2_years",
      "label": "2 Years"
    },
    {
      "value": "3_years",
      "label": "3 Years"
    },
    {
      "value": "4_years",
      "label": "4 Years"
    },
    {
      "value": "5_plus_years",
      "label": "5 Years +"
    }
  ],
  "regBNotice": "Alimony, child support, or separate maintenance income need not be revealed if you do not wish to have it considered as a basis for repaying this obligation."
};

export const APPLY_CONSENT_TEMPLATES: ConsentTemplate[] = [
  {
    "type": "tcpa",
    "versionId": "tcpa-v1.0.0",
    "step": 1,
    "label": "I agree to be contacted by phone, text and email (TCPA consent).",
    "text": "By checking this box, I give my express written consent for New Loans, LLC, NewLending Partners Network, and NewFinancial Servicing, LLC (together, the \"Named Parties\") to contact me at the telephone number I provided, including my wireless number, using an automatic telephone dialing system, an artificial or prerecorded voice, and SMS text messages, for marketing, servicing and application purposes. I understand that my consent is NOT a condition of purchasing any property, goods or services, and that I may instead call (800) 555-0143 to apply. Message frequency varies. Message and data rates may apply. I may revoke this consent at any time by replying STOP to any text, by calling (800) 555-0143, or by emailing optout@newloans.com.",
    "namedParties": [
      "New Loans, LLC",
      "NewLending Partners Network",
      "NewFinancial Servicing, LLC"
    ],
    "links": [
      {
        "label": "Marketing partners",
        "href": "/legal/partners"
      }
    ]
  },
  {
    "type": "esign",
    "versionId": "esign-v1.0.0",
    "step": 1,
    "label": "I consent to receive disclosures electronically (E-SIGN consent).",
    "text": "I consent under the federal E-SIGN Act to receive all disclosures, notices, agreements and records relating to my application and any resulting loan in electronic form rather than on paper. To access and retain these records I need: a device with internet access; a current version of Chrome, Safari, Firefox or Edge; an active email account; and the ability to view and save PDF files. I may withdraw this consent at any time, at no charge, by emailing esign@newloans.com or calling (800) 555-0143; withdrawing consent may end my ability to apply or transact online. I may request a paper copy of any record at no charge using the same contact details.",
    "namedParties": null,
    "links": null
  },
  {
    "type": "credit_pull_soft",
    "versionId": "credit-soft-v1.0.0",
    "step": 1,
    "label": "I authorise a SOFT credit inquiry to check my eligibility. This will NOT affect my credit score.",
    "text": "I authorise New Loans and its lending partners to obtain a consumer report about me from one or more consumer reporting agencies for the purpose of determining whether I pre-qualify for a loan. I understand this is a SOFT inquiry, that it is visible only to me on my credit file, and that IT WILL NOT AFFECT MY CREDIT SCORE. I confirm that New Loans has a permissible purpose under the Fair Credit Reporting Act, 15 U.S.C. section 1681b, to obtain this report in connection with my request. A separate authorisation will be requested before any hard inquiry is made.",
    "namedParties": null,
    "links": null
  },
  {
    "type": "credit_pull_hard",
    "versionId": "credit-hard-v1.0.0",
    "step": 2,
    "label": "I authorise a HARD credit inquiry to underwrite my loan. This MAY affect my credit score.",
    "text": "I authorise New Loans and its lending partners to obtain a consumer report and any other information about me, including from consumer reporting agencies and verification services, for the purpose of underwriting, verifying my identity, and making a final credit decision on my application. I understand this is a HARD inquiry, that it will appear on my credit file and MAY LOWER MY CREDIT SCORE, and that it is distinct from the soft inquiry I previously authorised. I confirm that New Loans has a permissible purpose under the Fair Credit Reporting Act, 15 U.S.C. section 1681b, to obtain this report.",
    "namedParties": null,
    "links": null
  },
  {
    "type": "privacy_glba",
    "versionId": "privacy-glba-v1.0.0",
    "step": 1,
    "label": "I have read the Privacy Policy and GLBA Privacy Notice.",
    "text": "I acknowledge that I have been given the opportunity to read the New Loans Privacy Policy and the Gramm-Leach-Bliley Act Privacy Notice, which describe the non-public personal information New Loans collects, how it is used, the categories of affiliates and non-affiliated third parties with whom it may be shared, and how it is protected. I understand that I have the right to opt out of certain sharing of my information with non-affiliated third parties and with affiliates for their own marketing, and that I may exercise that right at any time by calling (800) 555-0143, by emailing privacy@newloans.com, or through the opt-out form linked in the Privacy Notice.",
    "namedParties": null,
    "links": [
      {
        "label": "Privacy Policy",
        "href": "/legal/privacy"
      },
      {
        "label": "GLBA Privacy Notice",
        "href": "/legal/glba"
      },
      {
        "label": "Information sharing opt-out",
        "href": "/legal/opt-out"
      },
      {
        "label": "Direct Lender Disclosure",
        "href": "/legal/direct-lender"
      }
    ]
  },
  {
    "type": "terms_of_use",
    "versionId": "terms-v1.1.0",
    "step": 1,
    "label": "I agree to the Terms of Service.",
    "text": "I have read and agree to the New Loans Terms of Service, including the sections governing acceptable use of this website, the accuracy of the information I submit, electronic signatures, limitation of liability, and dispute resolution. I certify that the information I have provided is true, accurate and complete to the best of my knowledge, and that I am submitting this application on my own behalf.",
    "namedParties": null,
    "links": [
      {
        "label": "Terms of Service",
        "href": "/legal/terms"
      },
      {
        "label": "Fair Lending Statement",
        "href": "/legal/fair-lending"
      }
    ]
  },
  {
    "type": "ach_authorization",
    "versionId": "ach-v1.0.0",
    "step": 3,
    "label": "I authorise ACH debits and credits to the bank account provided.",
    "text": "I authorise New Loans and NewFinancial Servicing, LLC to initiate electronic credit entries to the checking or savings account I identified in order to disburse my loan proceeds, and to initiate electronic debit entries to that same account to collect each scheduled installment in the amount shown on my loan agreement, on each scheduled due date, for the full term of the loan, together with any adjusting entries needed to correct an error. I understand the amount and frequency of these debits are set out in my loan agreement and Truth in Lending disclosure, and that a final debit may differ in amount to close out the balance. I may revoke this authorisation at any time by calling (800) 555-0143 or by emailing ach@newloans.com at least three (3) business days before a scheduled debit; revoking it does not cancel my obligation to repay the loan. I certify that I am an authorised signer on this account.",
    "namedParties": null,
    "links": null
  }
];
