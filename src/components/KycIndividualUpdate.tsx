import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Description,
  Group,
  CheckCircle,
  ArrowBack,
  Update
} from '@mui/icons-material';
import FloatingProgressIndicator from './FloatingProgressIndicator';
import { defaultToastrOptions, sanitizeErrorMessage } from '../lib/security';

// Import toastr
declare const toastr: any;

interface IndividualFormData {
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

const KycIndividualUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmationDialog();
  const { token } = useParams<{ token: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [updateRequest, setUpdateRequest] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [validationErrorStep, setValidationErrorStep] = useState<number | undefined>(undefined);

  // Initialize toastr on component mount
  useEffect(() => {
    if (typeof toastr !== 'undefined') {
      toastr.options = defaultToastrOptions;
    }
  }, []);

  // Refs for file inputs to preserve selections when navigating between steps
  const fileInputRefs = {
    proofOfAddress: useRef<HTMLInputElement>(null),
    identification: useRef<HTMLInputElement>(null),
    identificationFront: useRef<HTMLInputElement>(null),
    identificationBack: useRef<HTMLInputElement>(null),
    immigrationPermit: useRef<HTMLInputElement>(null),
    sourceOfIncome: useRef<HTMLInputElement>(null)
  };

  // State to track file selections for persistence across step navigation
  const [fileSelections, setFileSelections] = useState<{[key: string]: File | null}>({
    proofOfAddress: null,
    identification: null,
    identificationFront: null,
    identificationBack: null,
    immigrationPermit: null,
    sourceOfIncome: null
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
      sourceOfIncome: null
    }
  });

  // Load submission data on component mount
  useEffect(() => {
    if (token) {
      loadSubmissionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadSubmissionData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`/api/admin/submission-by-token/${token}`);

      if (response.data.submission) {
        const submission = response.data.submission;
        const formDataFromDB = submission.formData;

        // Pre-populate form data
        setFormData({
          firstName: formDataFromDB.firstName || '',
          lastName: formDataFromDB.lastName || '',
          middleName: formDataFromDB.middleName || '',
          policyNumbers: formDataFromDB.policyNumbers || [],
          gender: formDataFromDB.gender || '',
          maritalStatus: formDataFromDB.maritalStatus || '',
          physicalAddress: formDataFromDB.physicalAddress || '',
          postalAddress: formDataFromDB.postalAddress || '',
          proofOfAddress: formDataFromDB.proofOfAddress || '',
          idType: formDataFromDB.idType || '',
          idNumber: formDataFromDB.idNumber || '',
          dateOfBirth: formDataFromDB.dateOfBirth || '',
          idExpiryDate: formDataFromDB.idExpiryDate || '',
          countryOfResidence: formDataFromDB.countryOfResidence || '',
          nationality: formDataFromDB.nationality || '',
          immigrationPermit: formDataFromDB.immigrationPermit || '',
          permitExpiryDate: formDataFromDB.permitExpiryDate || '',
          sourceOfIncome: formDataFromDB.sourceOfIncome || '',
          employerName: formDataFromDB.employerName || '',
          employmentStartDate: formDataFromDB.employmentStartDate || '',
          monthlyNetIncome: formDataFromDB.monthlyNetIncome || '',
          businessType: formDataFromDB.businessType || '',
          businessAddress: formDataFromDB.businessAddress || '',
          businessRegistrationNumber: formDataFromDB.businessRegistrationNumber || '',
          businessMonthlyIncome: formDataFromDB.businessMonthlyIncome || '',
          otherIncome: formDataFromDB.otherIncome || '',
          sourceOfFunds: formDataFromDB.sourceOfFunds || '',
          otherMonthlyIncome: formDataFromDB.otherMonthlyIncome || '',
          nextOfKinName: formDataFromDB.nextOfKinName || '',
          nextOfKinRelationship: formDataFromDB.nextOfKinRelationship || '',
          nextOfKinOccupation: formDataFromDB.nextOfKinOccupation || '',
          cellNumber: formDataFromDB.cellNumber || '',
          preferredCommunication: formDataFromDB.preferredCommunication || '',
          telephoneNumber: formDataFromDB.telephoneNumber || '',
          mobileNumber: formDataFromDB.mobileNumber || '',
          emailAddress: formDataFromDB.emailAddress || '',
          isPEP: formDataFromDB.isPEP || '',
          relatedToPEP: formDataFromDB.relatedToPEP || '',
          termsAgreement: formDataFromDB.termsAgreement || false,
          documents: {
            proofOfAddress: null,
            identification: null,
            identificationFront: null,
            identificationBack: null,
            immigrationPermit: null,
            sourceOfIncome: null
          }
        });

        setUpdateRequest(response.data.updateRequest);
        setTokenValid(true);
      }
    } catch (error) {
      console.error('Error loading submission data:', error);
      setTokenValid(false);
      if (typeof toastr !== 'undefined') {
        toastr.error('Invalid or expired update link. Please contact support.', 'Access Denied');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  // Custom File Input Component for persistent file display
  const CustomFileInput = ({
    label,
    field,
    error,
    accept = ".pdf,.doc,.docx,.jpg,.png",
    multiple = false
  }: {
    label: string;
    field: string;
    error?: string;
    accept?: string;
    multiple?: boolean;
  }) => {
    const fileKey = field.split('.')[1] || field;
    const selectedFile = fileSelections[fileKey];

    return (
      <Box sx={{ mt: 2 }}>
        <input
          ref={fileInputRefs[fileKey as keyof typeof fileInputRefs]}
          type="file"
          onChange={(e) => handleFileChange(field, e.target.files)}
          style={{
            width: '100%',
            padding: '12px',
            border: error ? '2px solid #dc3545' : selectedFile ? '2px solid #4caf50' : '2px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'none' // Hide the actual input
          }}
          accept={accept}
          multiple={multiple}
        />

        {/* Custom display button */}
        <Box
          onClick={() => fileInputRefs[fileKey as keyof typeof fileInputRefs]?.current?.click()}
          sx={{
            width: '100%',
            padding: '12px',
            border: error ? '2px solid #dc3545' : selectedFile ? '2px solid #4caf50' : '2px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#f0f0f0',
              borderColor: selectedFile ? '#45a049' : '#999'
            }
          }}
        >
          <Typography variant="body2" sx={{ color: selectedFile ? '#4caf50' : '#666' }}>
            {selectedFile ? `✓ ${selectedFile.name}` : `📎 ${label}`}
          </Typography>
        </Box>

        {selectedFile && (
          <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              ✓ Selected: {selectedFile.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
        )}

        {!selectedFile && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
            Click to select {label.toLowerCase()}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  };

  // Check completeness for each step
  const getStepCompleteness = (stepIndex: number): { completed: boolean; percentage: number } => {
    switch (stepIndex) {
      case 0: // Personal Information
        const hasBasicInfo = !!formData.firstName.trim() && !!formData.lastName.trim() &&
                            !!formData.gender && !!formData.dateOfBirth;
        const hasContact = !!formData.cellNumber.trim() && !!formData.emailAddress.trim();
        const hasAddress = !!formData.physicalAddress.trim();
        const hasId = !!formData.idType && !!formData.idNumber && !!formData.idExpiryDate;
        const hasPolicyNumbers = formData.policyNumbers.filter(p => p.trim()).length > 0;
        const completedPersonalFields = [hasBasicInfo, hasContact, hasAddress, hasId, hasPolicyNumbers].filter(Boolean).length;
        return {
          completed: completedPersonalFields === 5,
          percentage: (completedPersonalFields / 5) * 100
        };

      case 1: // Identification & Immigration
        const hasIdInfo = !!formData.idType && !!formData.idNumber && !!formData.dateOfBirth && !!formData.idExpiryDate;
        const hasLocation = !!formData.countryOfResidence && !!formData.nationality;
        const hasImmigration = formData.nationality === 'Malawian' || !!formData.immigrationPermit;
        const totalIdFields = 3;
        const completedIdFields = [hasIdInfo, hasLocation, hasImmigration].filter(Boolean).length;
        return {
          completed: completedIdFields === totalIdFields,
          percentage: (completedIdFields / totalIdFields) * 100
        };

      case 2: // Employment & Income
        const hasSource = !!formData.sourceOfIncome;
        const hasEmployment = formData.sourceOfIncome === 'Employment' ?
          (!!formData.employerName && !!formData.employmentStartDate && !!formData.monthlyNetIncome) : true;
        const hasBusiness = formData.sourceOfIncome === 'Business' ?
          (!!formData.businessType && !!formData.businessAddress && !!formData.businessMonthlyIncome) : true;
        const hasOtherIncome = !!formData.otherIncome || !!formData.otherMonthlyIncome;
        const hasSourceOfFunds = !!formData.sourceOfFunds;
        const totalEmploymentFields = 5;
        const completedEmploymentFields = [hasSource, hasEmployment, hasBusiness, hasOtherIncome, hasSourceOfFunds].filter(Boolean).length;
        return {
          completed: completedEmploymentFields === totalEmploymentFields,
          percentage: (completedEmploymentFields / totalEmploymentFields) * 100
        };

      case 3: // Contact & Next of Kin
        const hasKin = !!formData.nextOfKinName && !!formData.nextOfKinRelationship && !!formData.nextOfKinOccupation;
        const hasCommunication = !!formData.cellNumber && !!formData.preferredCommunication;
        const totalContactFields = 2;
        const completedContactFields = [hasKin, hasCommunication].filter(Boolean).length;
        return {
          completed: completedContactFields === totalContactFields,
          percentage: (completedContactFields / totalContactFields) * 100
        };

      case 4: // Declarations
        return {
          completed: formData.termsAgreement,
          percentage: formData.termsAgreement ? 100 : 0
        };

      default:
        return { completed: false, percentage: 0 };
    }
  };

  const steps = [
    { label: 'Personal Information', icon: Person },
    { label: 'Identification & Immigration', icon: Description },
    { label: 'Employment & Income', icon: Group },
    { label: 'Contact & Next of Kin', icon: Person },
    { label: 'Declarations', icon: CheckCircle }
  ];

  // Calculate overall form completion
  const getOverallProgress = (): number => {
    const stepProgresses = steps.map((_, index) => getStepCompleteness(index).percentage);
    return stepProgresses.reduce((sum, progress) => sum + progress, 0) / steps.length;
  };

  // Get step data for progress indicator
  const getStepData = () => {
    return steps.map((step, index) => {
      const completeness = getStepCompleteness(index);
      return {
        label: step.label,
        completed: completeness.completed,
        percentage: completeness.percentage
      };
    });
  };

  const handleInputChange = (field: keyof IndividualFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIdTypeChange = (idType: string) => {
    handleInputChange('idType', idType);

    if (idType === 'National ID') {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          identification: null
        }
      }));
      setFileSelections(prev => ({
        ...prev,
        identification: null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          identificationFront: null,
          identificationBack: null
        }
      }));
      setFileSelections(prev => ({
        ...prev,
        identificationFront: null,
        identificationBack: null
      }));
    }

    setErrors(prev => ({
      ...prev,
      identificationFile: '',
      identificationFrontFile: '',
      identificationBackFile: ''
    }));
  };

  const validateIdentificationDocuments = () => {
    const nextErrors: {[key: string]: string} = {
      identificationFile: '',
      identificationFrontFile: '',
      identificationBackFile: ''
    };

    if (formData.idType === 'National ID') {
      if (!formData.documents.identificationFront) {
        nextErrors.identificationFrontFile = 'National ID front side attachment is required';
      }
      if (!formData.documents.identificationBack) {
        nextErrors.identificationBackFile = 'National ID back side attachment is required';
      }
    } else {
      if (!formData.documents.identification) {
        nextErrors.identificationFile = 'Identification attachment is required';
      }
    }

    setErrors(prev => ({ ...prev, ...nextErrors }));
    return !nextErrors.identificationFile && !nextErrors.identificationFrontFile && !nextErrors.identificationBackFile;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          !!formData.firstName.trim() &&
          !!formData.lastName.trim() &&
          !!formData.gender &&
          !!formData.maritalStatus &&
          !!formData.physicalAddress.trim() &&
          !!formData.postalAddress.trim() &&
          !!formData.proofOfAddress &&
          formData.policyNumbers.filter(p => p.trim()).length > 0
        );
      case 1:
        return (
          !!formData.idType &&
          !!formData.idNumber.trim() &&
          !!formData.dateOfBirth &&
          !!formData.idExpiryDate &&
          !!formData.countryOfResidence &&
          !!formData.nationality &&
          (formData.idType === 'National ID'
            ? !!formData.documents.identificationFront && !!formData.documents.identificationBack
            : !!formData.documents.identification)
        );
      case 2:
        if (!formData.sourceOfIncome || !formData.sourceOfFunds.trim()) return false;
        if (formData.sourceOfIncome === 'Employment') {
          return !!formData.employerName.trim() && !!formData.employmentStartDate && !!formData.monthlyNetIncome.trim();
        }
        if (formData.sourceOfIncome === 'Business') {
          return !!formData.businessType.trim() && !!formData.businessAddress.trim() && !!formData.businessMonthlyIncome.trim();
        }
        return true;
      case 3:
        return (
          !!formData.nextOfKinName.trim() &&
          !!formData.nextOfKinRelationship &&
          !!formData.nextOfKinOccupation.trim() &&
          !!formData.cellNumber.trim() &&
          !!formData.emailAddress.trim() &&
          !!formData.preferredCommunication
        );
      case 4:
        return formData.termsAgreement === true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !validateIdentificationDocuments()) {
      setValidationError('Please attach all required identification documents');
      setValidationErrorStep(1);
      return;
    }
    setValidationError('');
    setValidationErrorStep(undefined);
    setActiveStep(prev => prev + 1);
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    const file = files?.[0] || null;
    const fieldErrorMap: {[key: string]: string} = {
      'documents.identification': 'identificationFile',
      'documents.identificationFront': 'identificationFrontFile',
      'documents.identificationBack': 'identificationBackFile',
      'documents.proofOfAddress': 'proofOfAddressFile',
      'documents.immigrationPermit': 'immigrationPermitFile',
      'documents.sourceOfIncome': 'sourceOfIncomeFile'
    };
    const errorKey = fieldErrorMap[field];

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof IndividualFormData] as any, [child]: file }
      }));
      setFileSelections(prev => ({ ...prev, [child]: file }));

      if (errorKey && file) {
        setErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
      setFileSelections(prev => ({ ...prev, [field]: file }));

      if (errorKey && file) {
        setErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (!validateIdentificationDocuments()) {
      setValidationError('Please attach all required identification documents');
      setValidationErrorStep(1);
      setActiveStep(1);
      return;
    }

    setValidationError('');
    setValidationErrorStep(undefined);

    const confirmed = await confirm({
      title: 'Submit KYC updates?',
      message: 'This will send your updated individual KYC details and documents for review.',
      confirmLabel: 'Submit Update',
      tone: 'primary'
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('formData', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        policyNumbers: formData.policyNumbers.filter(p => p.trim() !== ''), // Filter out empty entries
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
        termsAgreement: formData.termsAgreement
      }));

      // Add files
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          submitData.append(key, file);
        }
      });

      await axios.put(`/api/admin/update-submission/${token}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Show success toast
      if (typeof toastr !== 'undefined') {
        toastr.success('Your Individual KYC has been updated successfully!', 'Update Successful');
      }

      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Update error:', error);

      // Show error toast
      if (typeof toastr !== 'undefined') {
        toastr.error('Failed to update KYC. Please check your connection and try again.', 'Update Failed');
      }
    }
    setLoading(false);
  };

  // Show loading screen while fetching data
  if (initialLoading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/ombackground_alt.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Loading your KYC information...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we retrieve your data
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/ombackground_alt.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, maxWidth: 500 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This update link is invalid or has expired. Please contact Old Mutual support for assistance.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<ArrowBack />}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  // Render step content (simplified - showing only key parts for brevity)
  const renderStepContent = (step: number) => {
    if (step === 1) {
      return (
        <Box sx={{ p: 3 }}>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
              10. Type of Identification (tick and attach) *
            </FormLabel>
            <RadioGroup
              value={formData.idType}
              onChange={(e) => handleIdTypeChange(e.target.value)}
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}
            >
              {['National ID', 'Passport', 'Driver\'s Licence'].map(option => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">{option}</Typography>}
                />
              ))}
            </RadioGroup>

            {formData.idType === 'National ID' ? (
              <>
                <CustomFileInput
                  label="national ID front side file"
                  field="documents.identificationFront"
                  error={errors.identificationFrontFile}
                />
                {formData.documents.identificationFront && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 500 }}>
                    ✓ Front selected: {formData.documents.identificationFront.name}
                  </Typography>
                )}

                <CustomFileInput
                  label="national ID back side file"
                  field="documents.identificationBack"
                  error={errors.identificationBackFile}
                />
                {formData.documents.identificationBack && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 500 }}>
                    ✓ Back selected: {formData.documents.identificationBack.name}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <CustomFileInput
                  label="identification document file"
                  field="documents.identification"
                  error={errors.identificationFile}
                />
                {formData.documents.identification && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 500 }}>
                    ✓ Selected: {formData.documents.identification.name}
                  </Typography>
                )}
              </>
            )}
          </FormControl>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Step {step + 1}: {steps[step].label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Form content for step {step + 1} would be rendered here.
          This is a placeholder for the complete form implementation.
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Update Request Header */}
      {updateRequest && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Update Request:</strong> {updateRequest.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Requested on {new Date(updateRequest.requestedAt).toLocaleDateString()}
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack sx={{ color: 'green' }} />}
          variant="outlined"
          sx={{
            color: 'green',
            borderColor: 'green',
            '&:hover': {
              color: '#107c10',
              borderColor: '#107c10',
              backgroundColor: '#f0f8f0'
            }
          }}
        >
          Back to Home
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 3, gap: 2 }}>
          <Update sx={{ color: 'orange', fontSize: 30 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'green',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Update Individual KYC
          </Typography>
        </Box>
      </Box>

      {/* Validation Error Banner */}
      {validationError && (
        <Box sx={{ mb: 3 }}>
          <Alert
            severity="error"
            onClose={() => {
              setValidationError('');
              setValidationErrorStep(undefined);
            }}
            action={
              validationErrorStep !== undefined ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setActiveStep(validationErrorStep);
                    setValidationError('');
                    setValidationErrorStep(undefined);
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  Go to {steps[validationErrorStep]?.label}
                </Button>
              ) : null
            }
          >
            {validationError}
          </Alert>
        </Box>
      )}

      <Paper
        sx={{
          border: '1px solid #ddd',
          borderRadius: 3,
          backgroundColor: 'white',
          p: 3
        }}
      >
        {/* Vertical Stepper with Inline Content */}
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{ mb: 2 }}
          connector={
            <StepConnector
              sx={{
                '& .MuiStepConnector-line': {
                  borderColor: '#667eea',
                  borderWidth: 2,
                  minHeight: 30
                },
                '&.Mui-active .MuiStepConnector-line': {
                  borderColor: '#ff9800',
                  borderWidth: 3
                },
                '&.Mui-completed .MuiStepConnector-line': {
                  borderColor: '#4caf50',
                  borderWidth: 3
                }
              }}
            />
          }
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const completeness = getStepCompleteness(index);
            return (
              <Step key={step.label} completed={index < activeStep}>
                <StepLabel
                  onClick={() => setActiveStep(index)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      '& .MuiStepLabel-label': {
                        color: '#667eea'
                      }
                    }
                  }}
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: index < activeStep ? '#4caf50' :
                                        index === activeStep ? '#ff9800' : '#bdbdbd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                        border: index === activeStep ? '2px solid #ff9800' : 'none',
                        transform: index === activeStep ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <IconComponent sx={{ fontSize: 20 }} />
                    </Box>
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: index === activeStep ? 600 : 400,
                          color: index === activeStep ? '#ff9800' : 'inherit',
                          fontSize: '1rem'
                        }}
                      >
                        {step.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 4,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${completeness.percentage}%`,
                              height: '100%',
                              backgroundColor: completeness.completed ? '#4caf50' : '#ff9800',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#666', minWidth: 35 }}>
                          {Math.round(completeness.percentage)}%
                        </Typography>
                        {completeness.completed && (
                          <Box sx={{ color: '#4caf50', fontSize: 18 }}>✓</Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </StepLabel>
                {/* Content inside the step when active */}
                {index === activeStep && (
                  <Box sx={{ mt: 0.5, ml: 7, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ fontSize: '0.8rem' }}>
                      {renderStepContent(activeStep)}
                    </Box>
                    {/* Navigation Buttons inside the step */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 1.5,
                      pt: 1.5,
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <Button
                        onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                        disabled={index === 0}
                        variant="outlined"
                        size="small"
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                      >
                        Previous
                      </Button>
                      {index < steps.length - 1 ? (
                        <Button
                          onClick={handleNext}
                          disabled={!isStepValid(activeStep)}
                          variant="contained"
                          size="small"
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={loading || !formData.termsAgreement}
                          variant="contained"
                          size="small"
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1,
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            background: loading || !formData.termsAgreement ? '#ccc' : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
                          }}
                        >
                          {loading ? 'Updating...' : 'Update KYC'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Message Display */}
      {message && (
        <Box sx={{
          mt: 3,
          p: 2,
          borderRadius: 1,
          backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
          color: message.includes('success') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}`,
          textAlign: 'center'
        }}>
          <Typography>{message}</Typography>
        </Box>
      )}

      {/* Floating Progress Indicator */}
      {showProgressIndicator && (
        <FloatingProgressIndicator
          steps={getStepData()}
          overallProgress={getOverallProgress()}
          onClose={() => setShowProgressIndicator(false)}
          formType="Individual Update"
        />
      )}
    </Box>
  );
};

export default KycIndividualUpdate;