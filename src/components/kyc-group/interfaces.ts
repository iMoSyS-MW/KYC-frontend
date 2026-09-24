export interface Signatory {
  fullName: string
  address: string
  phone: string
  email: string
  occupation: string
  idType: string
  idDocument: File | null
  idDocumentFront: File | null
  idDocumentBack: File | null
  addressProof: string
  addressProofFile: File | null
}

/** Maximum number of scheme numbers a group can add. */
export const MAX_SCHEME_NUMBERS = 10

/** Maximum number of signatories that can be added. */
export const MAX_SIGNATORIES = 5

export interface GroupFormData {
  groupName: string
  products: string[]
  schemeNumbers: string[]
  foundingDocument: string
  sourceOfFunds: string
  bankAccountProof: string
  signatories: Signatory[]
  declaration: boolean
  documents: {
    founding: File | null
    sourceOfFunds: File | null
    bankAccount: File | null
  }
}

export interface FileSelections {
  [key: string]: File | null
}

export interface StepProps {
  formData: GroupFormData
  errors: Record<string, string>
  fileSelections: FileSelections
}

export interface SignatoryFileSlot {
  label: string
  field: string
  errorKey: string
}

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

export const STEPS = [
  { label: 'Client Details' },
  { label: 'Supporting Documents' },
  { label: 'Signatories' },
  { label: 'Declaration' },
]

export const REQUIRED_FIELDS: Record<string, string> = {
  groupName: 'Group name is required',
  products: 'You must make a selection.',
  schemeNumbers: 'Please add at least one scheme number',
  foundingDocument: 'Founding document type is required',
  sourceOfFunds: 'Source of funds type is required',
  bankAccountProof: 'Bank account proof type is required',
  foundingFile: 'Founding document file is required',
  sourceOfFundsFile: 'Source of funds document file is required',
  bankAccountFile: 'Bank account proof document file is required',
  declaration: 'Please accept the declaration to proceed',
}

export const SIGNATORY_REQUIRED_FIELDS: Record<string, string> = {
  fullName: 'Full name is required',
  phone: 'Phone number is required',
  email: 'Email is required',
  address: 'Address is required',
  occupation: 'Occupation is required',
  idType: 'ID type is required',
  addressProof: 'Address proof type is required',
}

export function isRequired(fieldName: string): boolean {
  return fieldName in REQUIRED_FIELDS
}

export function createEmptySignatory(): Signatory {
  return {
    fullName: '',
    address: '',
    phone: '',
    email: '',
    occupation: '',
    idType: '',
    idDocument: null,
    idDocumentFront: null,
    idDocumentBack: null,
    addressProof: '',
    addressProofFile: null,
  }
}
