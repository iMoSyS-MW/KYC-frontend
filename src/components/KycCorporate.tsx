import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import FormPageLayout from './layout/FormPageLayout';
import { StepClientDetails } from './kyc-corporate/StepClientDetails';
import { StepContactDetails } from './kyc-corporate/StepContactDetails';
import { StepSupportingDocuments } from './kyc-corporate/StepSupportingDocuments';
import { StepDeclaration } from './kyc-corporate/StepDeclaration';
import { CorporateFormData, FileSelections, FileInputRefs, STEPS, REQUIRED_FIELDS } from './kyc-corporate/types';
import SuccessModal from './ui/SuccessModal';

declare const toastr: any;

const KycCorporate: React.FC = () => {
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
    identification: useRef<HTMLInputElement | null>(null),
    addressProof: useRef<HTMLInputElement | null>(null),
    articles: useRef<HTMLInputElement | null>(null),
    directorsId: useRef<HTMLInputElement | null>(null),
    sourceOfFunds: useRef<HTMLInputElement | null>(null),
    bankAccount: useRef<HTMLInputElement | null>(null),
  };

  const [fileSelections, setFileSelections] = useState<FileSelections>({
    identification: null,
    addressProof: null,
    articles: null,
    directorsId: null,
    sourceOfFunds: null,
    bankAccount: null,
  });

  const [formData, setFormData] = useState<CorporateFormData>({
    organizationName: '',
    products: [],
    schemeNumbers: [],
    phone: '',
    email: '',
    address: '',
    identificationDocument: '',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    addressProof: '',
    articlesOfAssociation: '',
    directorsId: '',
    sourceOfFunds: '',
    bankAccountProof: '',
    pepDeclaration: false,
    declaration: false,
    documents: {
      identification: null,
      addressProof: null,
      articles: null,
      directorsId: null,
      sourceOfFunds: null,
      bankAccount: null,
    },
  });

  const handleInputChange = (field: keyof CorporateFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'phone' || field === 'contactPersonPhone') {
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

    if (field === 'contactPersonEmail') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, contactPersonEmail: 'Please enter a valid email address' }));
      } else {
        setErrors((prev) => ({ ...prev, contactPersonEmail: '' }));
      }
    }
  };

  const handleProductChange = (product: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      products: checked
        ? [...prev.products, product]
        : prev.products.filter((p) => p !== product),
    }));
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    const file = files?.[0] || null;
    const fieldErrorMap: { [key: string]: string } = {
      'documents.identification': 'identificationFile',
      'documents.addressProof': 'addressProofFile',
      'documents.articles': 'articlesFile',
      'documents.directorsId': 'directorsIdFile',
      'documents.sourceOfFunds': 'sourceOfFundsFile',
      'documents.bankAccount': 'bankAccountFile',
    };
    const errorKey = fieldErrorMap[field];

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof CorporateFormData] as any), [child]: file },
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

  const addSchemeNumber = () => {
    setFormData((prev) => ({
      ...prev,
      schemeNumbers: [...prev.schemeNumbers, ''],
    }));
  };

  const updateSchemeNumber = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      schemeNumbers: prev.schemeNumbers.map((scheme, i) =>
        i === index ? value : scheme
      ),
    }));
  };

  const removeSchemeNumber = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schemeNumbers: prev.schemeNumbers.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): { valid: boolean; errorKeys: string[] } => {
    const newErrors: { [key: string]: string } = {};

    const checkField = (field: string) => {
      const value = formData[field as keyof CorporateFormData];
      if (typeof value === 'string') {
        if (!value.trim()) newErrors[field] = REQUIRED_FIELDS[field];
      } else if (Array.isArray(value)) {
        if (value.length === 0) newErrors[field] = REQUIRED_FIELDS[field];
      } else if (typeof value === 'boolean') {
        if (!value) newErrors[field] = REQUIRED_FIELDS[field];
      } else {
        if (!value) newErrors[field] = REQUIRED_FIELDS[field];
      }
    };

    for (const field of Object.keys(REQUIRED_FIELDS)) {
      if (field === 'declaration' || field === 'products' || field === 'schemeNumbers') {
        checkField(field);
      } else if (field.endsWith('File')) {
        const docField = field.replace('File', '');
        const docKey = docField === 'identification' ? 'documents.identification'
          : docField === 'addressProof' ? 'documents.addressProof'
          : docField === 'articles' ? 'documents.articles'
          : docField === 'directorsId' ? 'documents.directorsId'
          : docField === 'sourceOfFunds' ? 'documents.sourceOfFunds'
          : docField === 'bankAccount' ? 'documents.bankAccount'
          : null;
        if (docKey) {
          const [parent, child] = docKey.split('.');
          const docs = formData[parent as keyof CorporateFormData] as any;
          if (!docs?.[child]) newErrors[field] = REQUIRED_FIELDS[field];
        }
      } else {
        checkField(field);
      }
    }

    const phoneRegex = /^(09|08)\d{8}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must start with 09 or 08 and be exactly 10 digits';
    }
    if (formData.contactPersonPhone && !phoneRegex.test(formData.contactPersonPhone)) {
      newErrors.contactPersonPhone = 'Phone number must start with 09 or 08 and be exactly 10 digits';
    }

    if (formData.contactPersonEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPersonEmail)) {
      newErrors.contactPersonEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    return { valid: errorKeys.length === 0, errorKeys };
  };

  const getFirstErrorStep = (errorKeys: string[]): number => {
    const step0Fields = ['organizationName', 'products', 'schemeNumbers', 'identificationDocument', 'identificationFile'];
    const step1Fields = ['phone', 'address', 'contactPersonName', 'contactPersonPhone', 'contactPersonEmail', 'addressProof', 'addressProofFile'];
    const step2Fields = ['articlesOfAssociation', 'articlesFile', 'directorsId', 'directorsIdFile', 'sourceOfFunds', 'sourceOfFundsFile', 'bankAccountProof', 'bankAccountFile'];
    const step3Fields = ['declaration'];

    for (const key of errorKeys) {
      if (step0Fields.includes(key)) return 0;
      if (step1Fields.includes(key)) return 1;
      if (step2Fields.includes(key)) return 2;
      if (step3Fields.includes(key)) return 3;
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
      title: 'Submit corporate KYC?',
      message: 'This will submit the completed corporate KYC form and supporting documents for review.',
      confirmLabel: 'Submit KYC',
      tone: 'primary',
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('type', 'corporate');
      submitData.append('clientName', formData.organizationName);
      submitData.append(
        'formData',
        JSON.stringify({
          organizationName: formData.organizationName,
          products: formData.products,
          schemeNumbers: formData.schemeNumbers.filter((scheme) => scheme.trim() !== ''),
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          identificationDocument: formData.identificationDocument,
          contactPerson: {
            name: formData.contactPersonName,
            phone: formData.contactPersonPhone,
            email: formData.contactPersonEmail,
          },
          addressProof: formData.addressProof,
          articlesOfAssociation: formData.articlesOfAssociation,
          directorsId: formData.directorsId,
          sourceOfFunds: formData.sourceOfFunds,
          bankAccountProof: formData.bankAccountProof,
          pepDeclaration: formData.pepDeclaration,
          declaration: formData.declaration,
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
          <StepClientDetails
            {...stepProps}
            handleProductChange={handleProductChange}
            addSchemeNumber={addSchemeNumber}
            updateSchemeNumber={updateSchemeNumber}
            removeSchemeNumber={removeSchemeNumber}
          />
        );
      case 1:
        return <StepContactDetails {...stepProps} />;
      case 2:
        return <StepSupportingDocuments {...stepProps} />;
      case 3:
        return <StepDeclaration {...stepProps} />;
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
        message="Your Corporate KYC has been submitted successfully!"
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
      />
    </>
  );
};

export default KycCorporate;
