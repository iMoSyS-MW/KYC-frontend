import { defineComponent, h } from 'vue'

export interface CorporateFormData {
  organizationName: string
  products: string[]
  schemeNumbers: string[]
  phone: string
  email: string
  address: string
  identificationDocument: string
  contactPersonName: string
  contactPersonPhone: string
  contactPersonEmail: string
  addressProof: string
  articlesOfAssociation: string
  directorsId: string
  sourceOfFunds: string
  bankAccountProof: string
  pepDeclaration: boolean
  declaration: boolean
  documents: {
    identification: File | null
    addressProof: File | null
    articles: File | null
    directorsId: File | null
    sourceOfFunds: File | null
    bankAccount: File | null
  }
}

export interface FileSelections {
  [key: string]: File | null
}

/** Maximum number of scheme numbers a corporate client can add. */
export const MAX_SCHEME_NUMBERS = 10

export interface StepProps {
  formData: CorporateFormData
  errors: Record<string, string>
  fileSelections: FileSelections
}

export const STEPS = [
  { label: 'Client Details' },
  { label: 'Contact Details' },
  { label: 'Supporting Documents' },
  { label: 'Declaration' },
]

export const PRODUCTS = [
  { code: 'MPICO', label: 'Property' },
  { code: 'OMIG', label: 'Investment Private Wealth' },
  { code: 'OMIG', label: 'Investment Money Market' },
  { code: 'OMIG', label: 'Segregated Funds' },
  { code: 'OMUT', label: 'Investment Interest Bearing Asset Fund' },
  { code: 'OMUT', label: 'Investment Balanced Fund' },
  { code: 'OMPSC', label: '' },
  { code: 'OMLAC', label: '' },
]

export const ID_DOCUMENT_OPTIONS = [
  'Business Registration',
  'Incorporation Certificate',
  'Act of Parliament',
  'Other',
]

export const ADDRESS_PROOF_OPTIONS = [
  'Telephone Bill',
  'Utility Bill',
  'Lease Agreement',
  'City Rates',
  'Other',
]

export const ARTICLES_OPTIONS = [
  'Articles of Association',
  'Constitution',
  'Partnership Agreement',
  'Board Resolution',
  'Other',
]

export const DIRECTORS_ID_OPTIONS = [
  'Valid Passport',
  'Immigration Permit',
  'National ID',
  "Driver's License",
  'Other',
]

export const SOURCE_OF_FUNDS_OPTIONS = [
  'Bank Statements',
  'Audited Financials',
  'Tax Returns',
]

export const BANK_ACCOUNT_OPTIONS = [
  'Bank Statement',
  'Bank Letter',
  'Deposit Slip',
  'Cancelled Cheque',
  'Transfer Slip',
]

export const REQUIRED_FIELDS: Record<string, string> = {
  organizationName: 'Organisation name is required',
  products: 'Please select at least one product/scheme',
  schemeNumbers: 'Please add at least one scheme number',
  identificationDocument: 'Identification document type is required',
  identificationFile: 'Identification document file is required',
  phone: 'Office phone number is required',
  address: 'Office address is required',
  contactPersonName: 'Contact person name is required',
  contactPersonPhone: 'Contact person phone number is required',
  contactPersonEmail: 'Contact person email is required',
  addressProof: 'Proof of office address type is required',
  addressProofFile: 'Proof of address document file is required',
  articlesOfAssociation: 'Articles of association type is required',
  articlesFile: 'Articles of association document file is required',
  directorsId: 'Directors/Senior Management ID type is required',
  directorsIdFile: 'Directors ID document file is required',
  sourceOfFunds: 'Source of funds type is required',
  sourceOfFundsFile: 'Source of funds document file is required',
  bankAccountProof: 'Bank account proof type is required',
  bankAccountFile: 'Bank account proof document file is required',
  declaration: 'Please accept the declaration to proceed',
}

export const isRequired = (fieldName: string): boolean => {
  return fieldName in REQUIRED_FIELDS
}

export const requiredLabel = (label: string, _fieldName: string): string => label

export const ErrorIcon = defineComponent({
  name: 'ErrorIcon',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () =>
      h(
        'svg',
        {
          ...attrs,
          width: '20',
          height: '20',
          viewBox: '0 0 20 20',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg',
        },
        [
          h('path', {
            d: 'M10 15C10.2833 15 10.5208 14.9042 10.7125 14.7125C10.9042 14.5208 11 14.2833 11 14C11 13.7167 10.9042 13.4792 10.7125 13.2875C10.5208 13.0958 10.2833 13 10 13C9.71667 13 9.47917 13.0958 9.2875 13.2875C9.09583 13.4792 9 13.7167 9 14C9 14.2833 9.09583 14.5208 9.2875 14.7125C9.47917 14.9042 9.71667 15 10 15ZM9 11H11V5H9V11ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C19.7375 15.1167 18.6875 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z',
            fill: '#910822',
          }),
        ],
      )
  },
})
