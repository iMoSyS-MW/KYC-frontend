export interface CorporateFormData {
  organizationName: string;
  products: string[];
  schemeNumbers: string[];
  phone: string;
  email: string;
  address: string;
  identificationDocument: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  addressProof: string;
  articlesOfAssociation: string;
  directorsId: string;
  sourceOfFunds: string;
  bankAccountProof: string;
  pepDeclaration: boolean;
  declaration: boolean;
  documents: {
    identification: File | null;
    addressProof: File | null;
    articles: File | null;
    directorsId: File | null;
    sourceOfFunds: File | null;
    bankAccount: File | null;
  };
}

export interface FileSelections {
  [key: string]: File | null;
}

export interface FileInputRefs {
  [key: string]: React.RefObject<HTMLInputElement | null>;
}

export interface StepProps {
  formData: CorporateFormData;
  errors: { [key: string]: string };
  fileSelections: FileSelections;
  fileInputRefs: FileInputRefs;
  handleInputChange: (field: keyof CorporateFormData, value: any) => void;
  handleFileChange: (field: string, files: FileList | null) => void;
}

export const STEPS = [
  { label: 'Client Details' },
  { label: 'Contact Details' },
  { label: 'Supporting Documents' },
  { label: 'Declaration' },
];

export const PRODUCTS = [
  { code: 'MPICO', label: 'Property' },
  { code: 'OMIG', label: 'Investment Private Wealth' },
  { code: 'OMIG', label: 'Investment Money Market' },
  { code: 'OMIG', label: 'Segregated Funds' },
  { code: 'OMUT', label: 'Investment Interest Bearing Asset Fund' },
  { code: 'OMUT', label: 'Investment Balanced Fund' },
  { code: 'OMPSC', label: '' },
  { code: 'OMLAC', label: '' },
];

export const ID_DOCUMENT_OPTIONS = [
  'Business Registration',
  'Incorporation Certificate',
  'Act of Parliament',
  'Other',
];

export const ADDRESS_PROOF_OPTIONS = [
  'Telephone Bill',
  'Utility Bill',
  'Lease Agreement',
  'City Rates',
  'Other',
];

export const ARTICLES_OPTIONS = [
  'Articles of Association',
  'Constitution',
  'Partnership Agreement',
  'Board Resolution',
  'Other',
];

export const DIRECTORS_ID_OPTIONS = [
  'Valid Passport',
  'Immigration Permit',
  'National ID',
  "Driver's License",
  'Other',
];

export const SOURCE_OF_FUNDS_OPTIONS = [
  'Bank Statements',
  'Audited Financials',
  'Tax Returns',
];

export const BANK_ACCOUNT_OPTIONS = [
  'Bank Statement',
  'Bank Letter',
  'Deposit Slip',
  'Cancelled Cheque',
  'Transfer Slip',
];

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
};

export const isRequired = (fieldName: string): boolean => {
  return fieldName in REQUIRED_FIELDS;
};

export const requiredLabel = (label: string, fieldName: string): string => {
  return isRequired(fieldName) ? `${label} *` : label;
};
