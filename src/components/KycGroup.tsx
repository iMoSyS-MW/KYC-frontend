import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import FormPageLayout from './layout/FormPageLayout';
import { StepClientDetails } from './kyc-group/StepClientDetails';
import { StepSupportingDocuments } from './kyc-group/StepSupportingDocuments';
import { StepSignatories } from './kyc-group/StepSignatories';
import { StepDeclaration } from './kyc-group/StepDeclaration';
import { GroupFormData, FileSelections, FileInputRefs, STEPS, REQUIRED_FIELDS, SIGNATORY_REQUIRED_FIELDS } from './kyc-group/types';
import SuccessModal from './ui/SuccessModal';

declare const toastr: any;

const KycGroup: React.FC = () => {
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
    founding: useRef<HTMLInputElement | null>(null),
    sourceOfFunds: useRef<HTMLInputElement | null>(null),
    bankAccount: useRef<HTMLInputElement | null>(null),
    signatory_0_id: useRef<HTMLInputElement | null>(null),
    signatory_0_idFront: useRef<HTMLInputElement | null>(null),
    signatory_0_idBack: useRef<HTMLInputElement | null>(null),
    signatory_0_address: useRef<HTMLInputElement | null>(null),
    signatory_1_id: useRef<HTMLInputElement | null>(null),
    signatory_1_idFront: useRef<HTMLInputElement | null>(null),
    signatory_1_idBack: useRef<HTMLInputElement | null>(null),
    signatory_1_address: useRef<HTMLInputElement | null>(null),
    signatory_2_id: useRef<HTMLInputElement | null>(null),
    signatory_2_idFront: useRef<HTMLInputElement | null>(null),
    signatory_2_idBack: useRef<HTMLInputElement | null>(null),
    signatory_2_address: useRef<HTMLInputElement | null>(null),
    signatory_3_id: useRef<HTMLInputElement | null>(null),
    signatory_3_idFront: useRef<HTMLInputElement | null>(null),
    signatory_3_idBack: useRef<HTMLInputElement | null>(null),
    signatory_3_address: useRef<HTMLInputElement | null>(null),
    signatory_4_id: useRef<HTMLInputElement | null>(null),
    signatory_4_idFront: useRef<HTMLInputElement | null>(null),
    signatory_4_idBack: useRef<HTMLInputElement | null>(null),
    signatory_4_address: useRef<HTMLInputElement | null>(null),
    signatory_5_id: useRef<HTMLInputElement | null>(null),
    signatory_5_idFront: useRef<HTMLInputElement | null>(null),
    signatory_5_idBack: useRef<HTMLInputElement | null>(null),
    signatory_5_address: useRef<HTMLInputElement | null>(null),
    signatory_6_id: useRef<HTMLInputElement | null>(null),
    signatory_6_idFront: useRef<HTMLInputElement | null>(null),
    signatory_6_idBack: useRef<HTMLInputElement | null>(null),
    signatory_6_address: useRef<HTMLInputElement | null>(null),
    signatory_7_id: useRef<HTMLInputElement | null>(null),
    signatory_7_idFront: useRef<HTMLInputElement | null>(null),
    signatory_7_idBack: useRef<HTMLInputElement | null>(null),
    signatory_7_address: useRef<HTMLInputElement | null>(null),
    signatory_8_id: useRef<HTMLInputElement | null>(null),
    signatory_8_idFront: useRef<HTMLInputElement | null>(null),
    signatory_8_idBack: useRef<HTMLInputElement | null>(null),
    signatory_8_address: useRef<HTMLInputElement | null>(null),
    signatory_9_id: useRef<HTMLInputElement | null>(null),
    signatory_9_idFront: useRef<HTMLInputElement | null>(null),
    signatory_9_idBack: useRef<HTMLInputElement | null>(null),
    signatory_9_address: useRef<HTMLInputElement | null>(null),
  };

  const [fileSelections, setFileSelections] = useState<FileSelections>({
    founding: null,
    sourceOfFunds: null,
    bankAccount: null,
  });

  const [formData, setFormData] = useState<GroupFormData>({
    groupName: '',
    products: [],
    schemeNumbers: [],
    foundingDocument: '',
    sourceOfFunds: '',
    bankAccountProof: '',
    signatories: [],
    declaration: false,
    documents: {
      founding: null,
      sourceOfFunds: null,
      bankAccount: null,
    },
  });

  const handleInputChange = (field: keyof GroupFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof GroupFormData] as any), [child]: file },
      }));
      setFileSelections((prev) => ({ ...prev, [child]: file }));
    } else if (field.startsWith('signatory_')) {
      const parts = field.split('_');
      const signatoryIndex = parseInt(parts[1]);
      const fileType = parts[2];

      if (fileType === 'id') {
        updateSignatory(signatoryIndex, 'idDocument', file);
        setFileSelections((prev) => ({ ...prev, [`signatory_${signatoryIndex}_id`]: file }));
        if (file) {
          setErrors((prev) => ({ ...prev, [`signatory_${signatoryIndex}_idDocument`]: '' }));
        }
      } else if (fileType === 'idFront') {
        updateSignatory(signatoryIndex, 'idDocumentFront', file);
        setFileSelections((prev) => ({ ...prev, [`signatory_${signatoryIndex}_idFront`]: file }));
        if (file) {
          setErrors((prev) => ({ ...prev, [`signatory_${signatoryIndex}_idDocumentFront`]: '' }));
        }
      } else if (fileType === 'idBack') {
        updateSignatory(signatoryIndex, 'idDocumentBack', file);
        setFileSelections((prev) => ({ ...prev, [`signatory_${signatoryIndex}_idBack`]: file }));
        if (file) {
          setErrors((prev) => ({ ...prev, [`signatory_${signatoryIndex}_idDocumentBack`]: '' }));
        }
      } else if (fileType === 'address') {
        updateSignatory(signatoryIndex, 'addressProofFile', file);
        setFileSelections((prev) => ({ ...prev, [`signatory_${signatoryIndex}_address`]: file }));
        if (file) {
          setErrors((prev) => ({ ...prev, [`signatory_${signatoryIndex}_addressProofFile`]: '' }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: file }));
      setFileSelections((prev) => ({ ...prev, [field]: file }));
    }
  };

  const addSignatory = () => {
    setFormData((prev) => ({
      ...prev,
      signatories: [
        ...prev.signatories,
        {
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
        },
      ],
    }));
  };

  const handleSignatoryIdTypeChange = (index: number, idType: string) => {
    setFormData((prev) => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) => {
        if (i !== index) return sig;
        if (idType === 'National ID') {
          return { ...sig, idType, idDocument: null };
        }
        return { ...sig, idType, idDocumentFront: null, idDocumentBack: null };
      }),
    }));

    setFileSelections((prev) => ({
      ...prev,
      [`signatory_${index}_id`]: idType === 'National ID' ? null : prev[`signatory_${index}_id`],
      [`signatory_${index}_idFront`]: idType === 'National ID' ? prev[`signatory_${index}_idFront`] : null,
      [`signatory_${index}_idBack`]: idType === 'National ID' ? prev[`signatory_${index}_idBack`] : null,
    }));

    setErrors((prev) => ({
      ...prev,
      [`signatory_${index}_idType`]: '',
      [`signatory_${index}_idDocument`]: '',
      [`signatory_${index}_idDocumentFront`]: '',
      [`signatory_${index}_idDocumentBack`]: '',
    }));
  };

  const updateSignatory = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) =>
        i === index ? { ...sig, [field]: value } : sig
      ),
    }));

    if (field === 'phone') {
      const phoneRegex = /^(09|08)\d{8}$/;
      if (value && !phoneRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [`signatory_${index}_phone`]: 'Phone number must start with 09 or 08 and be exactly 10 digits',
        }));
      } else {
        setErrors((prev) => ({ ...prev, [`signatory_${index}_phone`]: '' }));
      }
    }

    if (field === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, [`signatory_${index}_email`]: 'Please enter a valid email address' }));
      } else {
        setErrors((prev) => ({ ...prev, [`signatory_${index}_email`]: '' }));
      }
    }
  };

  const removeSignatory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index),
    }));
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
      const value = formData[field as keyof GroupFormData];
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
        const docKey = docField === 'founding' ? 'documents.founding'
          : docField === 'sourceOfFunds' ? 'documents.sourceOfFunds'
          : docField === 'bankAccount' ? 'documents.bankAccount'
          : null;
        if (docKey) {
          const [parent, child] = docKey.split('.');
          const docs = formData[parent as keyof GroupFormData] as any;
          if (!docs?.[child]) newErrors[field] = REQUIRED_FIELDS[field];
        }
      } else {
        checkField(field);
      }
    }

    if (formData.signatories.length === 0) {
      newErrors.signatories = 'Please add at least one signatory';
    } else {
      const phoneRegex = /^(09|08)\d{8}$/;
      formData.signatories.forEach((sig, index) => {
        for (const [field, message] of Object.entries(SIGNATORY_REQUIRED_FIELDS)) {
          const value = sig[field as keyof typeof sig];
          if (typeof value === 'string' && !value.trim()) {
            newErrors[`signatory_${index}_${field}`] = `Signatory ${index + 1}: ${message}`;
          }
        }
        if (sig.phone && !phoneRegex.test(sig.phone)) {
          newErrors[`signatory_${index}_phone`] = `Signatory ${index + 1}: Phone number must start with 09 or 08 and be exactly 10 digits`;
        }
        if (sig.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sig.email)) {
          newErrors[`signatory_${index}_email`] = `Signatory ${index + 1}: Please enter a valid email address`;
        }
        if (sig.idType === 'National ID') {
          if (!sig.idDocumentFront) newErrors[`signatory_${index}_idDocumentFront`] = `Signatory ${index + 1}: National ID front side file is required`;
          if (!sig.idDocumentBack) newErrors[`signatory_${index}_idDocumentBack`] = `Signatory ${index + 1}: National ID back side file is required`;
        } else if (sig.idType) {
          if (!sig.idDocument) newErrors[`signatory_${index}_idDocument`] = `Signatory ${index + 1}: ID document file is required`;
        }
        if (!sig.addressProofFile) {
          newErrors[`signatory_${index}_addressProofFile`] = `Signatory ${index + 1}: Address proof file is required`;
        }
      });
    }

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    return { valid: errorKeys.length === 0, errorKeys };
  };

  const getFirstErrorStep = (errorKeys: string[]): number => {
    const step0Fields = ['groupName', 'products', 'schemeNumbers'];
    const step1Fields = ['foundingDocument', 'foundingFile', 'sourceOfFunds', 'sourceOfFundsFile', 'bankAccountProof', 'bankAccountFile'];
    const step3Fields = ['declaration'];

    for (const key of errorKeys) {
      if (step0Fields.includes(key)) return 0;
      if (step1Fields.includes(key)) return 1;
      if (key.startsWith('signatory_') || key === 'signatories') return 2;
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
      title: 'Submit group KYC?',
      message: 'This will submit the completed group KYC form and supporting documents for review.',
      confirmLabel: 'Submit KYC',
      tone: 'primary',
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('type', 'group');
      submitData.append('clientName', formData.groupName);
      submitData.append(
        'formData',
        JSON.stringify({
          products: formData.products,
          schemeNumbers: formData.schemeNumbers.filter((scheme) => scheme.trim() !== ''),
          foundingDocument: formData.foundingDocument,
          sourceOfFunds: formData.sourceOfFunds,
          bankAccountProof: formData.bankAccountProof,
          signatories: formData.signatories.map((sig) => ({
            fullName: sig.fullName,
            address: sig.address,
            phone: sig.phone,
            email: sig.email,
            occupation: sig.occupation,
            idType: sig.idType,
            addressProof: sig.addressProof,
          })),
          declaration: formData.declaration,
        })
      );

      if (formData.documents.founding) {
        submitData.append('foundingDocument', formData.documents.founding);
      }
      if (formData.documents.sourceOfFunds) {
        submitData.append('sourceOfFunds', formData.documents.sourceOfFunds);
      }
      if (formData.documents.bankAccount) {
        submitData.append('bankAccountProof', formData.documents.bankAccount);
      }

      formData.signatories.forEach((sig, index) => {
        if (sig.idType === 'National ID') {
          if (sig.idDocumentFront) {
            submitData.append(`signatory_${index}_idFront`, sig.idDocumentFront);
          }
          if (sig.idDocumentBack) {
            submitData.append(`signatory_${index}_idBack`, sig.idDocumentBack);
          }
        } else if (sig.idDocument) {
          submitData.append(`signatory_${index}_id`, sig.idDocument);
        }
        if (sig.addressProofFile) {
          submitData.append(`signatory_${index}_address`, sig.addressProofFile);
        }
      });

      await client.post('/api/kyc/submit', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Submission error:', error);

      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to submit KYC. Please check your connection and try again.', 'Submission Failed');
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
        return <StepSupportingDocuments {...stepProps} />;
      case 2:
        return (
          <StepSignatories
            {...stepProps}
            addSignatory={addSignatory}
            removeSignatory={removeSignatory}
            updateSignatory={updateSignatory}
            handleSignatoryIdTypeChange={handleSignatoryIdTypeChange}
          />
        );
      case 3:
        return <StepDeclaration {...stepProps} />;
      default:
        return null;
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
        message="Your Group KYC has been submitted successfully!"
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
      />
    </>
  );
};

export default KycGroup;
