export interface Signatory {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  occupation: string;
  idType: string;
  idDocument: File | null;
  idDocumentFront: File | null;
  idDocumentBack: File | null;
  addressProof: string;
  addressProofFile: File | null;
}

export interface GroupFormData {
  groupName: string;
  products: string[];
  schemeNumbers: string[];
  foundingDocument: string;
  sourceOfFunds: string;
  bankAccountProof: string;
  signatories: Signatory[];
  declaration: boolean;
  documents: {
    founding: File | null;
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
  formData: GroupFormData;
  errors: { [key: string]: string };
  fileSelections: FileSelections;
  fileInputRefs: FileInputRefs;
  handleInputChange: (field: keyof GroupFormData, value: any) => void;
  handleFileChange: (field: string, files: FileList | null) => void;
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
];

export const STEPS = [
  { label: 'Client Details' },
  { label: 'Supporting Documents' },
  { label: 'Signatories' },
  { label: 'Declaration' },
];

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
};

export const SIGNATORY_REQUIRED_FIELDS: Record<string, string> = {
  fullName: 'Full name is required',
  phone: 'Phone number is required',
  email: 'Email is required',
  address: 'Address is required',
  occupation: 'Occupation is required',
  idType: 'ID type is required',
  addressProof: 'Address proof type is required',
};

export const isRequired = (fieldName: string): boolean => {
  return fieldName in REQUIRED_FIELDS;
};

export const requiredLabel = (label: string, fieldName: string): string => {
  return isRequired(fieldName) ? `${label} *` : label;
};
