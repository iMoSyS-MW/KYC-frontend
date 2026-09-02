import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import FormPageLayout from './layout/FormPageLayout';
import { StepPersonalInfo } from './kyc-individual/StepPersonalInfo';
import { StepIdentification } from './kyc-individual/StepIdentification';
import { StepEmployment } from './kyc-individual/StepEmployment';
import { StepContact } from './kyc-individual/StepContact';
import { StepDeclarations } from './kyc-individual/StepDeclarations';
import { IndividualFormData, FileSelections, FileInputRefs, STEPS, REQUIRED_FIELDS, REQUIRED_FIELDS_CONDITIONAL } from './kyc-individual/types';
import SuccessModal from './ui/SuccessModal';

declare const toastr: any;

const KycIndividual: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmationDialog();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [validationError, setValidationError] = useState<string>('');
  const [validationErrorStep, setValidationErrorStep] = useState<number | undefined>(undefined);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (typeof toastr !== 'undefined') {
      toastr.options = {
        closeButton: true,
        debug: false,
        newestOnTop: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        preventDuplicates: false,
        onclick: null,
        showDuration: '300',
        hideDuration: '1000',
        timeOut: '5000',
        extendedTimeOut: '1000',
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut',
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }
      if (e.key === 'ArrowRight') {
        setActiveStep((prev) => Math.min(STEPS.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveStep((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fileInputRefs: FileInputRefs = {
    proofOfAddress: useRef<HTMLInputElement | null>(null),
    identification: useRef<HTMLInputElement | null>(null),
    identificationFront: useRef<HTMLInputElement | null>(null),
    identificationBack: useRef<HTMLInputElement | null>(null),
    immigrationPermit: useRef<HTMLInputElement | null>(null),
    sourceOfIncome: useRef<HTMLInputElement | null>(null),
  };

  const [fileSelections, setFileSelections] = useState<FileSelections>({
    proofOfAddress: null,
    identification: null,
    identificationFront: null,
    identificationBack: null,
    immigrationPermit: null,
    sourceOfIncome: null,
  });

  const [formData, setFormData] = useState<IndividualFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    policyNumbers: [],
    gender: '',
    maritalStatus: '',
    physicalAddress: '',
    postalAddress: '',
    proofOfAddress: '',
    idType: '',
    idNumber: '',
    dateOfBirth: '',
    idExpiryDate: '',
    countryOfResidence: '',
    nationality: '',
    immigrationPermit: '',
    permitExpiryDate: '',
    sourceOfIncome: '',
    employerName: '',
    employmentStartDate: '',
    monthlyNetIncome: '',
    businessType: '',
    businessAddress: '',
    businessRegistrationNumber: '',
    businessMonthlyIncome: '',
    otherIncome: '',
    sourceOfFunds: '',
    otherMonthlyIncome: '',
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinOccupation: '',
    cellNumber: '',
    preferredCommunication: '',
    telephoneNumber: '',
    mobileNumber: '',
    emailAddress: '',
    isPEP: '',
    relatedToPEP: '',
    termsAgreement: false,
    documents: {
      proofOfAddress: null,
      identification: null,
      identificationFront: null,
      identificationBack: null,
      immigrationPermit: null,
      sourceOfIncome: null,
    },
  });

  const handleInputChange = (field: keyof IndividualFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'dateOfBirth') {
      if (value) {
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        setErrors((prev) => ({
          ...prev,
          dateOfBirth: age < 16 ? 'You must be at least 16 years old' : '',
        }));
      } else {
        setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
      }
    }

    if (field === 'cellNumber' || field === 'mobileNumber') {
      const phoneRegex = /^(09|08)\d{8}$/;
      if (value && !phoneRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [field]: 'Phone number must start with 09 or 08 and be exactly 10 digits',
        }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    }
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    const file = files?.[0] || null;
    const fieldErrorMap: { [key: string]: string } = {
      'documents.identification': 'identificationFile',
      'documents.identificationFront': 'identificationFrontFile',
      'documents.identificationBack': 'identificationBackFile',
      'documents.proofOfAddress': 'proofOfAddressFile',
      'documents.immigrationPermit': 'immigrationPermitFile',
      'documents.sourceOfIncome': 'sourceOfIncomeFile',
    };
    const errorKey = fieldErrorMap[field];

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof IndividualFormData] as any), [child]: file },
      }));
      setFileSelections((prev) => ({ ...prev, [child]: file }));

      if (errorKey && file) {
        setErrors((prev) => ({ ...prev, [errorKey]: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: file }));
      setFileSelections((prev) => ({ ...prev, [field]: file }));

      if (errorKey && file) {
        setErrors((prev) => ({ ...prev, [errorKey]: '' }));
      }
    }
  };

  const addPolicyNumber = () => {
    setFormData((prev) => ({
      ...prev,
      policyNumbers: [...prev.policyNumbers, ''],
    }));
  };

  const updatePolicyNumber = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      policyNumbers: prev.policyNumbers.map((policy, i) =>
        i === index ? value : policy
      ),
    }));
  };

  const removePolicyNumber = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      policyNumbers: prev.policyNumbers.filter((_, i) => i !== index),
    }));
  };

  const handleIdTypeChange = (idType: string) => {
    handleInputChange('idType', idType);

    if (idType === 'National ID') {
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, identification: null },
      }));
      setFileSelections((prev) => ({ ...prev, identification: null }));
      setErrors((prev) => ({
        ...prev,
        identificationFile: '',
        identificationFrontFile: '',
        identificationBackFile: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, identificationFront: null, identificationBack: null },
      }));
      setFileSelections((prev) => ({
        ...prev,
        identificationFront: null,
        identificationBack: null,
      }));
      setErrors((prev) => ({
        ...prev,
        identificationFile: '',
        identificationFrontFile: '',
        identificationBackFile: '',
      }));
    }
  };

  const validateForm = (): { valid: boolean; errorKeys: string[] } => {
    const newErrors: { [key: string]: string } = {};

    const checkField = (field: string) => {
      const value = formData[field as keyof IndividualFormData];
      if (typeof value === 'string') {
        if (!value.trim()) newErrors[field] = REQUIRED_FIELDS[field];
      } else if (Array.isArray(value)) {
        if (value.filter((v: string) => v.trim()).length === 0) newErrors[field] = REQUIRED_FIELDS[field];
      } else {
        if (!value) newErrors[field] = REQUIRED_FIELDS[field];
      }
    };

    for (const field of Object.keys(REQUIRED_FIELDS)) {
      if (field.endsWith('File')) continue; // file fields are validated below against formData.documents
      checkField(field);
    }

    if (!formData.documents.proofOfAddress) {
      newErrors.proofOfAddressFile = REQUIRED_FIELDS.proofOfAddressFile;
    }
    if (formData.idType === 'National ID') {
      if (!formData.documents.identificationFront) newErrors.identificationFrontFile = 'National ID front side attachment is required';
      if (!formData.documents.identificationBack) newErrors.identificationBackFile = 'National ID back side attachment is required';
    } else if (formData.idType) {
      if (!formData.documents.identification) newErrors.identificationFile = 'Identification attachment is required';
    }
    if (!formData.documents.sourceOfIncome) {
      newErrors.sourceOfIncomeFile = REQUIRED_FIELDS.sourceOfIncomeFile;
    }

    if (formData.sourceOfIncome && REQUIRED_FIELDS_CONDITIONAL[formData.sourceOfIncome]) {
      const conditionalFields = REQUIRED_FIELDS_CONDITIONAL[formData.sourceOfIncome];
      for (const [field, message] of Object.entries(conditionalFields)) {
        const value = formData[field as keyof IndividualFormData];
        if (typeof value === 'string' && !value.trim()) {
          newErrors[field] = message;
        }
      }
    }

    if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }

    const phoneRegex = /^(09|08)\d{8}$/;
    if (formData.cellNumber && !phoneRegex.test(formData.cellNumber)) {
      newErrors.cellNumber = 'Phone number must start with 09 or 08 and be exactly 10 digits';
    }
    if (formData.mobileNumber && !phoneRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Phone number must start with 09 or 08 and be exactly 10 digits';
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 16) {
        newErrors.dateOfBirth = 'You must be at least 16 years old';
      }
    }

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    return { valid: errorKeys.length === 0, errorKeys };
  };

  const getFirstErrorStep = (errorKeys: string[]): number => {
    const step0Fields = ['firstName', 'lastName', 'gender', 'maritalStatus', 'physicalAddress', 'postalAddress', 'proofOfAddress', 'proofOfAddressFile', 'policyNumbers'];
    const step1Fields = ['idType', 'identificationFile', 'identificationFrontFile', 'identificationBackFile', 'idNumber', 'dateOfBirth', 'idExpiryDate', 'countryOfResidence', 'nationality'];
    const step2Fields = ['sourceOfIncome', 'sourceOfIncomeFile', 'employerName', 'employmentStartDate', 'monthlyNetIncome', 'businessType', 'businessAddress', 'businessMonthlyIncome', 'sourceOfFunds'];
    const step3Fields = ['nextOfKinName', 'nextOfKinRelationship', 'nextOfKinOccupation', 'cellNumber', 'emailAddress', 'preferredCommunication'];
    const step4Fields = ['isPEP', 'relatedToPEP'];

    for (const key of errorKeys) {
      if (step0Fields.includes(key)) return 0;
      if (step1Fields.includes(key)) return 1;
      if (step2Fields.includes(key)) return 2;
      if (step3Fields.includes(key)) return 3;
      if (step4Fields.includes(key)) return 4;
    }
    return 0;
  };

  const handleSubmit = async () => {
    const { valid, errorKeys } = validateForm();
    if (!valid) {
      const firstErrorStep = getFirstErrorStep(errorKeys);
      setValidationError('Please complete the required fields');
      setValidationErrorStep(firstErrorStep);
      setActiveStep(firstErrorStep);
      setLoading(false);
      return;
    }

    setValidationError('');
    setValidationErrorStep(undefined);

    const confirmed = await confirm({
      title: 'Submit individual KYC?',
      message: 'This will submit the completed individual KYC form and supporting documents for review.',
      confirmLabel: 'Submit KYC',
      tone: 'primary',
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('type', 'individual');
      submitData.append('clientName', `${formData.firstName} ${formData.lastName}`);
      submitData.append(
        'formData',
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          policyNumbers: formData.policyNumbers.filter((p) => p.trim() !== ''),
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          physicalAddress: formData.physicalAddress,
          postalAddress: formData.postalAddress,
          proofOfAddress: formData.proofOfAddress,
          idType: formData.idType,
          idNumber: formData.idNumber,
          dateOfBirth: formData.dateOfBirth,
          idExpiryDate: formData.idExpiryDate,
          countryOfResidence: formData.countryOfResidence,
          nationality: formData.nationality,
          immigrationPermit: formData.immigrationPermit,
          permitExpiryDate: formData.permitExpiryDate,
          sourceOfIncome: formData.sourceOfIncome,
          employerName: formData.employerName,
          employmentStartDate: formData.employmentStartDate,
          monthlyNetIncome: formData.monthlyNetIncome,
          businessType: formData.businessType,
          businessAddress: formData.businessAddress,
          businessRegistrationNumber: formData.businessRegistrationNumber,
          businessMonthlyIncome: formData.businessMonthlyIncome,
          otherIncome: formData.otherIncome,
          sourceOfFunds: formData.sourceOfFunds,
          otherMonthlyIncome: formData.otherMonthlyIncome,
          nextOfKinName: formData.nextOfKinName,
          nextOfKinRelationship: formData.nextOfKinRelationship,
          nextOfKinOccupation: formData.nextOfKinOccupation,
          cellNumber: formData.cellNumber,
          preferredCommunication: formData.preferredCommunication,
          telephoneNumber: formData.telephoneNumber,
          mobileNumber: formData.mobileNumber,
          emailAddress: formData.emailAddress,
          isPEP: formData.isPEP,
          relatedToPEP: formData.relatedToPEP,
          termsAgreement: formData.termsAgreement,
        })
      );

      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          submitData.append(key, file);
        }
      });

      await client.post('/api/kyc/submit', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Submission error:', error?.response?.data || error);
      const errorMessage = error?.response?.data?.message || 'Failed to submit KYC. Please check your connection and try again.';

      if (typeof toastr !== 'undefined') {
        toastr.error(errorMessage, 'Submission Failed');
      }
    }
    setLoading(false);
  };

  const isStepValid = (step: number): boolean => {
    if (step === 0) {
      return (
        !!formData.firstName.trim() &&
        !!formData.lastName.trim() &&
        !!formData.gender &&
        !!formData.maritalStatus &&
        !!formData.physicalAddress.trim() &&
        !!formData.postalAddress.trim() &&
        !!formData.proofOfAddress &&
        !!formData.documents.proofOfAddress &&
        formData.policyNumbers.filter((p) => p.trim()).length > 0
      );
    }
    if (step === 1) {
      if (
        !formData.idType ||
        !formData.idNumber.trim() ||
        !formData.dateOfBirth ||
        !formData.idExpiryDate ||
        !formData.countryOfResidence ||
        !formData.nationality
      ) {
        return false;
      }
      if (formData.idType === 'National ID') {
        return !!formData.documents.identificationFront && !!formData.documents.identificationBack;
      }
      return !!formData.documents.identification;
    }
    if (step === 2) {
      if (!formData.sourceOfIncome || !formData.documents.sourceOfIncome || !formData.sourceOfFunds.trim()) {
        return false;
      }
      if (formData.sourceOfIncome === 'Employment') {
        return (
          !!formData.employerName.trim() &&
          !!formData.employmentStartDate &&
          !!formData.monthlyNetIncome.trim()
        );
      }
      if (formData.sourceOfIncome === 'Business') {
        return (
          !!formData.businessType.trim() &&
          !!formData.businessAddress.trim() &&
          !!formData.businessMonthlyIncome.trim()
        );
      }
      return true;
    }
    if (step === 3) {
      return (
        !!formData.nextOfKinName.trim() &&
        !!formData.nextOfKinRelationship &&
        !!formData.nextOfKinOccupation.trim() &&
        !!formData.cellNumber.trim() &&
        !!formData.emailAddress.trim() &&
        !!formData.preferredCommunication
      );
    }
    if (step === 4) {
      return !!formData.isPEP && !!formData.relatedToPEP;
    }
    return true;
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const renderStepContent = (step: number) => {
    const stepProps = {
      formData,
      errors,
      fileSelections,
      fileInputRefs,
      handleInputChange,
      handleFileChange,
    };

    switch (step) {
      case 0:
        return (
          <StepPersonalInfo
            {...stepProps}
            addPolicyNumber={addPolicyNumber}
            updatePolicyNumber={updatePolicyNumber}
            removePolicyNumber={removePolicyNumber}
          />
        );
      case 1:
        return (
          <StepIdentification
            {...stepProps}
            handleIdTypeChange={handleIdTypeChange}
          />
        );
      case 2:
        return <StepEmployment {...stepProps} />;
      case 3:
        return <StepContact {...stepProps} />;
      case 4:
        return <StepDeclarations {...stepProps} />;
      default:
        return (
          <div className="text-center py-12 text-gray-400">
            <p>Step {step + 1} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <>
      <FormPageLayout
        title={STEPS[activeStep].label}
        activeStep={activeStep}
        totalSteps={STEPS.length}
        stepLabels={STEPS.map((s) => s.label)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isLastStep={activeStep === STEPS.length - 1}
        isSubmitting={loading}
        nextDisabled={!isStepValid(activeStep)}
        validationError={validationError}
        validationErrorStep={validationErrorStep}
        validationErrorStepLabel={validationErrorStep !== undefined ? STEPS[validationErrorStep].label : undefined}
        onGoToStep={(step) => setActiveStep(step)}
        onDismissError={() => {
          setValidationError('');
          setValidationErrorStep(undefined);
        }}
      >
        {renderStepContent(activeStep)}
      </FormPageLayout>
      <SuccessModal
        open={showSuccessModal}
        message="Your Individual KYC has been submitted successfully!"
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
      />
    </>
  );
};

export default KycIndividual;
