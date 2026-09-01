export interface IndividualFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  policyNumbers: string[];
  gender: string;
  maritalStatus: string;
  physicalAddress: string;
  postalAddress: string;
  proofOfAddress: string;
  idType: string;
  idNumber: string;
  dateOfBirth: string;
  idExpiryDate: string;
  countryOfResidence: string;
  nationality: string;
  immigrationPermit: string;
  permitExpiryDate: string;
  sourceOfIncome: string;
  employerName: string;
  employmentStartDate: string;
  monthlyNetIncome: string;
  businessType: string;
  businessAddress: string;
  businessRegistrationNumber: string;
  businessMonthlyIncome: string;
  otherIncome: string;
  sourceOfFunds: string;
  otherMonthlyIncome: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinOccupation: string;
  cellNumber: string;
  preferredCommunication: string;
  telephoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  isPEP: string;
  relatedToPEP: string;
  termsAgreement: boolean;
  documents: {
    proofOfAddress: File | null;
    identification: File | null;
    identificationFront: File | null;
    identificationBack: File | null;
    immigrationPermit: File | null;
    sourceOfIncome: File | null;
  };
}

export interface FileSelections {
  [key: string]: File | null;
}

export interface FileInputRefs {
  [key: string]: React.RefObject<HTMLInputElement | null>;
}

export interface StepProps {
  formData: IndividualFormData;
  errors: { [key: string]: string };
  fileSelections: FileSelections;
  fileInputRefs: FileInputRefs;
  handleInputChange: (field: keyof IndividualFormData, value: any) => void;
  handleFileChange: (field: string, files: FileList | null) => void;
}

export const STEPS = [
  { label: 'Personal Information' },
  { label: 'Identification & Immigration' },
  { label: 'Employment & Income' },
  { label: 'Contact & Next of Kin' },
  { label: 'Declarations' },
];

export const PROOF_OF_ADDRESS_OPTIONS = [
  'Water Bill',
  'Electricity Bill',
  'City Rates',
  'Lease agreement',
];

export const MARITAL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Divorced',
  'Widow',
  'Widower',
];

export const IMMIGRATION_PERMIT_OPTIONS = [
  'Employment Permit',
  'Study Permit',
  'Temporary Residence Permit',
  'Business Residence Permit',
  'Permanent Residence Permit',
  'Diplomatic Permit',
  'Technical Assistance Permit',
];

export const RELATIONSHIPS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild',
  'Aunt', 'Uncle', 'Cousin', 'Friend', 'Colleague', 'Other',
];

export const COMMUNICATION_OPTIONS = [
  'Phone Call', 'SMS', 'Email', 'Post',
];

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe', 'Other',
];

export const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'Andorran', 'Angolan', 'Antiguan and Barbudan', 'Argentine', 'Armenian', 'Australian', 'Austrian',
  'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian', 'Belizean', 'Beninese', 'Bhutanese',
  'Bolivian', 'Bosnian and Herzegovinian', 'Botswanan', 'Brazilian', 'Bruneian', 'Bulgarian', 'Burkinabe', 'Burundian', 'Cape Verdean', 'Cambodian',
  'Cameroonian', 'Canadian', 'Central African', 'Chadian', 'Chilean', 'Chinese', 'Colombian', 'Comoran', 'Congolese', 'Costa Rican',
  'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican', 'Ecuadorian', 'Egyptian',
  'Salvadoran', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Eswatini', 'Ethiopian', 'Fijian', 'Finnish', 'French', 'Gabonese',
  'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian', 'Guatemalan', 'Guinean', 'Guinea-Bissauan', 'Guyanese',
  'Haitian', 'Honduran', 'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli',
  'Italian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan', 'Kiribati', 'Kuwaiti', 'Kyrgyz', 'Laotian',
  'Latvian', 'Lebanese', 'Lesotho', 'Liberian', 'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourgish', 'Malagasy', 'Malawian',
  'Malaysian', 'Maldivian', 'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan',
  'Monacan', 'Mongolian', 'Montenegrin', 'Moroccan', 'Mozambican', 'Burmese', 'Namibian', 'Nauruan', 'Nepali', 'Dutch',
  'New Zealander', 'Nicaraguan', 'Nigerien', 'Nigerian', 'North Korean', 'North Macedonian', 'Norwegian', 'Omani', 'Pakistani', 'Palauan',
  'Panamanian', 'Papua New Guinean', 'Paraguayan', 'Peruvian', 'Filipino', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian',
  'Rwandan', 'Kittitian and Nevisian', 'Saint Lucian', 'Saint Vincentian', 'Samoan', 'Sammarinese', 'Sao Tomean', 'Saudi Arabian', 'Senegalese', 'Serbian',
  'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean', 'South Sudanese',
  'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamese', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian',
  'Thai', 'Timorese', 'Togolese', 'Tongan', 'Trinidadian and Tobagonian', 'Tunisian', 'Turkish', 'Turkmen', 'Tuvaluan', 'Ugandan',
  'Ukrainian', 'Emirati', 'British', 'American', 'Uruguayan', 'Uzbek', 'Vanuatuan', 'Vatican', 'Venezuelan', 'Vietnamese',
  'Yemeni', 'Zambian', 'Zimbabwean', 'Other',
];

export const REQUIRED_FIELDS: Record<string, string> = {
  firstName: 'First name is required',
  lastName: 'Last name is required',
  gender: 'You must make a selection.',
  maritalStatus: 'Marital status is required',
  physicalAddress: 'Physical address is required',
  postalAddress: 'Postal address is required',
  proofOfAddress: 'You must make a selection.',
  proofOfAddressFile: 'Proof of address document file is required',
  policyNumbers: 'Please add at least one policy number',
  idType: 'You must make a selection.',
  idNumber: 'Identification number is required',
  dateOfBirth: 'Date of birth is required',
  idExpiryDate: 'Date of expiry of ID is required',
  countryOfResidence: 'Country of residence is required',
  nationality: 'Nationality is required',
  sourceOfIncome: 'You must make a selection.',
  sourceOfIncomeFile: 'Source of income document file is required',
  sourceOfFunds: 'Source of funds is required',
  nextOfKinName: 'Name of next of kin is required',
  nextOfKinRelationship: 'Relationship to customer is required',
  nextOfKinOccupation: 'Occupation is required',
  cellNumber: 'Cell number is required',
  emailAddress: 'Email address is required',
  preferredCommunication: 'You must make a selection.',
  isPEP: 'You must make a selection.',
  relatedToPEP: 'You must make a selection.',
};

export const REQUIRED_FIELDS_CONDITIONAL: Record<string, Record<string, string>> = {
  Employment: {
    employerName: 'Name of employer is required',
    employmentStartDate: 'Employment start date is required',
    monthlyNetIncome: 'Monthly net income is required',
  },
  Business: {
    businessType: 'Business type is required',
    businessAddress: 'Business physical address is required',
    businessMonthlyIncome: 'Business monthly income is required',
  },
};

export const isRequired = (fieldName: string): boolean => {
  return fieldName in REQUIRED_FIELDS;
};

export const requiredLabel = (label: string, fieldName: string): string => {
  return isRequired(fieldName) ? `${label} *` : label;
};
