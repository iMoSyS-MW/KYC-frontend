import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
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
import { defaultToastrOptions } from '../lib/security';

declare const toastr: any;

interface CorporateUpdateFormData {
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
}

const PRODUCTS = [
  'MPICO � property',
  'OMIG � investment Private Wealth',
  'OMIG � investment Money Market',
  'OMIG � Segregated Funds',
  'OMUT � investment Interest Bearing Asset Fund',
  'OMUT � investment Balanced Fund',
  'OMPSC',
  'OMLAC',
];

const KycCorporateUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmationDialog();
  const { token } = useParams<{ token: string }>();

  const [initialLoading, setInitialLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [updateRequest, setUpdateRequest] = useState<any>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  const [validationError, setValidationError] = useState<string>('');
  const [validationErrorStep, setValidationErrorStep] = useState<number | undefined>(undefined);

  const [formData, setFormData] = useState<CorporateUpdateFormData>({
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
  });

  const [fileSelections, setFileSelections] = useState<{ [key: string]: File | null }>({
    identification: null,
    addressProof: null,
    articles: null,
    directorsId: null,
    sourceOfFunds: null,
    bankAccount: null,
  });

  const fileInputRefs = {
    identification: useRef<HTMLInputElement>(null),
    addressProof: useRef<HTMLInputElement>(null),
    articles: useRef<HTMLInputElement>(null),
    directorsId: useRef<HTMLInputElement>(null),
    sourceOfFunds: useRef<HTMLInputElement>(null),
    bankAccount: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (typeof toastr !== 'undefined') {
      toastr.options = defaultToastrOptions;
    }
  }, []);

  const loadSubmissionData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`/api/admin/submission-by-token/${token}`);
      const { submission, updateRequest: req } = response.data;

      const fd = submission.formData || {};
      setFormData({
        organizationName: fd.organizationName || '',
        products: Array.isArray(fd.products) ? fd.products : [],
        schemeNumbers: Array.isArray(fd.schemeNumbers) ? fd.schemeNumbers : [],
        phone: fd.phone || '',
        email: fd.email || '',
        address: fd.address || '',
        identificationDocument: fd.identificationDocument || '',
        contactPersonName: fd.contactPerson?.name || fd.contactPersonName || '',
        contactPersonPhone: fd.contactPerson?.phone || fd.contactPersonPhone || '',
        contactPersonEmail: fd.contactPerson?.email || fd.contactPersonEmail || '',
        addressProof: fd.addressProof || '',
        articlesOfAssociation: fd.articlesOfAssociation || '',
        directorsId: fd.directorsId || '',
        sourceOfFunds: fd.sourceOfFunds || '',
        bankAccountProof: fd.bankAccountProof || '',
        pepDeclaration: fd.pepDeclaration || false,
        declaration: !!fd.declaration,
      });

      setUpdateRequest(req);
      setTokenValid(true);
    } catch (error: any) {
      setTokenValid(false);
      if (typeof toastr !== 'undefined') {
        toastr.error('Invalid or expired update link. Please contact support.', 'Access Denied');
      }
    } finally {
      setInitialLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadSubmissionData();
    }
  }, [token, loadSubmissionData]);

  const handleInputChange = (field: keyof CorporateUpdateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (product: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      products: checked ? [...prev.products, product] : prev.products.filter(p => p !== product),
    }));
  };

  const addSchemeNumber = () => setFormData(prev => ({ ...prev, schemeNumbers: [...prev.schemeNumbers, ''] }));
  const updateSchemeNumber = (index: number, value: string) =>
    setFormData(prev => ({ ...prev, schemeNumbers: prev.schemeNumbers.map((s, i) => (i === index ? value : s)) }));
  const removeSchemeNumber = (index: number) =>
    setFormData(prev => ({ ...prev, schemeNumbers: prev.schemeNumbers.filter((_, i) => i !== index) }));

  const handleFileChange = (fileKey: string, files: FileList | null) => {
    const file = files?.[0] || null;
    setFileSelections(prev => ({ ...prev, [fileKey]: file }));
  };

  const steps = [
    { label: 'Client Details', icon: Person },
    { label: 'Contact Details', icon: Description },
    { label: 'Supporting Documents', icon: Group },
    { label: 'Declaration', icon: CheckCircle },
  ];

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          !!formData.organizationName.trim() &&
          formData.products.length > 0 &&
          formData.schemeNumbers.filter(s => s.trim()).length > 0 &&
          !!formData.identificationDocument
        );
      case 1:
        return (
          !!formData.phone.trim() &&
          !!formData.address.trim() &&
          !!formData.contactPersonName.trim() &&
          !!formData.contactPersonPhone.trim() &&
          !!formData.contactPersonEmail.trim() &&
          !!formData.addressProof
        );
      case 2:
        return (
          !!formData.articlesOfAssociation &&
          !!formData.directorsId &&
          !!formData.sourceOfFunds &&
          !!formData.bankAccountProof
        );
      case 3:
        return formData.declaration === true;
      default:
        return true;
    }
  };

  const getStepCompleteness = (stepIndex: number): { completed: boolean; percentage: number } => {
    switch (stepIndex) {
      case 0: {
        const f = [!!formData.organizationName.trim(), formData.products.length > 0, formData.schemeNumbers.filter(s => s.trim()).length > 0, !!formData.identificationDocument].filter(Boolean).length;
        return { completed: f === 4, percentage: (f / 4) * 100 };
      }
      case 1: {
        const f = [!!formData.phone.trim(), !!formData.address.trim(), !!formData.contactPersonName.trim(), !!formData.contactPersonPhone.trim(), !!formData.contactPersonEmail.trim(), !!formData.addressProof].filter(Boolean).length;
        return { completed: f === 6, percentage: (f / 6) * 100 };
      }
      case 2: {
        const f = [!!formData.articlesOfAssociation, !!formData.directorsId, !!formData.sourceOfFunds, !!formData.bankAccountProof].filter(Boolean).length;
        return { completed: f === 4, percentage: (f / 4) * 100 };
      }
      case 3:
        return { completed: formData.declaration, percentage: formData.declaration ? 100 : 0 };
      default:
        return { completed: false, percentage: 0 };
    }
  };

  const getOverallProgress = () =>
    steps.map((_, i) => getStepCompleteness(i).percentage).reduce((a, b) => a + b, 0) / steps.length;

  const getStepData = () =>
    steps.map((step, i) => ({
      label: step.label,
      completed: getStepCompleteness(i).completed,
      percentage: getStepCompleteness(i).percentage,
    }));

  const validateForm = (): { valid: boolean; errorKeys: string[] } => {
    const e: { [key: string]: string } = {};
    if (!formData.organizationName.trim()) e.organizationName = 'Organization name is required';
    if (formData.products.length === 0) e.products = 'Please select at least one product/scheme';
    if (formData.schemeNumbers.filter(s => s.trim()).length === 0) e.schemeNumbers = 'Please add at least one scheme number';
    if (!formData.identificationDocument) e.identificationDocument = 'Identification document type is required';
    if (!formData.phone.trim()) e.phone = 'Office phone number is required';
    if (!formData.address.trim()) e.address = 'Office address is required';
    if (!formData.contactPersonName.trim()) e.contactPersonName = 'Contact person name is required';
    if (!formData.contactPersonPhone.trim()) e.contactPersonPhone = 'Contact person phone is required';
    if (!formData.contactPersonEmail.trim()) e.contactPersonEmail = 'Contact person email is required';
    if (!formData.addressProof) e.addressProof = 'Proof of address type is required';
    if (!formData.articlesOfAssociation) e.articlesOfAssociation = 'Articles of association type is required';
    if (!formData.directorsId) e.directorsId = 'Directors ID type is required';
    if (!formData.sourceOfFunds) e.sourceOfFunds = 'Source of funds type is required';
    if (!formData.bankAccountProof) e.bankAccountProof = 'Bank account proof type is required';
    if (!formData.declaration) e.declaration = 'Please accept the declaration to proceed';
    setErrors(e);
    const errorKeys = Object.keys(e);
    return { valid: errorKeys.length === 0, errorKeys };
  };

  const getFirstErrorStep = (errorKeys: string[]): number => {
    const step0Fields = ['organizationName', 'products', 'schemeNumbers', 'identificationDocument'];
    const step1Fields = ['phone', 'address', 'contactPersonName', 'contactPersonPhone', 'contactPersonEmail'];
    const step2Fields = ['addressProof', 'articlesOfAssociation', 'directorsId', 'sourceOfFunds', 'bankAccountProof'];
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
    if (!token) return;

    const { valid, errorKeys } = validateForm();
    if (!valid) {
      const firstErrorStep = getFirstErrorStep(errorKeys);
      setValidationError('Please complete the required fields');
      setValidationErrorStep(firstErrorStep);
      setActiveStep(firstErrorStep);
      return;
    }

    setValidationError('');
    setValidationErrorStep(undefined);

    const confirmed = await confirm({
      title: 'Submit KYC updates?',
      message: 'This will send your updated corporate KYC details and documents for review.',
      confirmLabel: 'Submit Update',
      tone: 'primary'
    });

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      const payload = {
        organizationName: formData.organizationName,
        products: formData.products,
        schemeNumbers: formData.schemeNumbers.filter(s => s.trim()),
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        identificationDocument: formData.identificationDocument,
        contactPerson: { name: formData.contactPersonName, phone: formData.contactPersonPhone, email: formData.contactPersonEmail },
        addressProof: formData.addressProof,
        articlesOfAssociation: formData.articlesOfAssociation,
        directorsId: formData.directorsId,
        sourceOfFunds: formData.sourceOfFunds,
        bankAccountProof: formData.bankAccountProof,
        pepDeclaration: formData.pepDeclaration,
        declaration: formData.declaration,
      };
      submitData.append('formData', JSON.stringify(payload));
      const fileMap: Record<string, string> = { identification: 'identification', addressProof: 'addressProof', articles: 'articles', directorsId: 'directorsId', sourceOfFunds: 'sourceOfFunds', bankAccount: 'bankAccount' };
      for (const [key, fieldName] of Object.entries(fileMap)) {
        const file = fileSelections[key];
        if (file) submitData.append(fieldName, file);
      }
      await axios.put(`/api/admin/update-submission/${token}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (typeof toastr !== 'undefined') toastr.success('Your Corporate KYC has been updated successfully!', 'Update Successful');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Update error:', error);
      if (typeof toastr !== 'undefined') toastr.error('Failed to update KYC. Please check your connection and try again.', 'Update Failed');
    }
    setLoading(false);
  };

  const CustomFileInput = ({ label, fileKey, error }: { label: string; fileKey: string; error?: string }) => {
    const selected = fileSelections[fileKey];
    const ref = fileInputRefs[fileKey as keyof typeof fileInputRefs];
    return (
      <Box sx={{ mt: 1 }}>
        <input ref={ref} type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display: 'none' }} onChange={e => handleFileChange(fileKey, e.target.files)} />
        <Box onClick={() => ref?.current?.click()} sx={{ p: '12px', border: error ? '2px solid #dc3545' : selected ? '2px solid #4caf50' : '2px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { backgroundColor: '#f0f0f0' } }}>
          <Typography variant="body2" sx={{ color: selected ? '#4caf50' : '#666' }}>{selected ? `\u2713 ${selected.name}` : `\uD83D\uDCCE ${label}`}</Typography>
        </Box>
        {selected && (<Box sx={{ mt: 0.5, p: 1, backgroundColor: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}><Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>\u2713 {selected.name}</Typography><Typography variant="body2" color="text.secondary">Size: {(selected.size / 1024 / 1024).toFixed(2)} MB</Typography></Box>)}
        {!selected && (<Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>Click to select � leave blank to keep existing file</Typography>)}
        {error && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{error}</Typography>}
      </Box>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: return (
        <Box sx={{ p: 3 }}>
          <TextField fullWidth label="1. Organization Name (mandatory)" value={formData.organizationName} onChange={e => handleInputChange('organizationName', e.target.value)} error={!!errors.organizationName} helperText={errors.organizationName} size="small" sx={{ mb: 3 }} inputProps={{ maxLength: 200 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>2. Products/Schemes (mandatory � select at least one)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {PRODUCTS.map(product => (<FormControlLabel key={product} control={<Checkbox checked={formData.products.includes(product)} onChange={e => handleProductChange(product, e.target.checked)} size="small" />} label={<Typography variant="body2">{product}</Typography>} />))}
            </Box>
            {errors.products && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.products}</Typography>}
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>3. Scheme / Investment / Policy Numbers</Typography>
            {formData.schemeNumbers.map((scheme, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1.5, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: 'text.secondary', minWidth: 50 }}>#{index + 1}</Typography>
                <TextField fullWidth size="small" value={scheme} onChange={e => updateSchemeNumber(index, e.target.value)} placeholder="Enter scheme/investment/policy number" sx={{ mr: 1 }} inputProps={{ maxLength: 50 }} />
                <Button onClick={() => removeSchemeNumber(index)} variant="contained" size="small" color="error" sx={{ minWidth: 'auto' }}>Remove</Button>
              </Box>
            ))}
            <Button onClick={addSchemeNumber} variant="contained" color="primary" sx={{ mt: 1 }}>+ Add Scheme Number</Button>
            {errors.schemeNumbers && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.schemeNumbers}</Typography>}
          </Box>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth size="small" error={!!errors.identificationDocument}>
              <InputLabel>4. Identification Document (mandatory)</InputLabel>
              <Select value={formData.identificationDocument} onChange={e => handleInputChange('identificationDocument', e.target.value)} label="4. Identification Document (mandatory)">
                <MenuItem value=""><em>Select document type</em></MenuItem>
                <MenuItem value="Business Registration">Business registration certificate</MenuItem>
                <MenuItem value="Incorporation Certificate">Incorporation certificate</MenuItem>
                <MenuItem value="Act of Parliament">An Act of Parliament</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            {errors.identificationDocument && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.identificationDocument}</Typography>}
            <CustomFileInput label="Identification document file" fileKey="identification" />
          </Box>
        </Box>
      );

      case 1: return (
        <Box sx={{ p: 3 }}>
          <TextField fullWidth label="5. Office Phone Number (mandatory)" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} error={!!errors.phone} helperText={errors.phone} size="small" sx={{ mb: 3 }} inputProps={{ maxLength: 20 }} />
          <TextField fullWidth label="6. Office Email Address" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} size="small" sx={{ mb: 3 }} inputProps={{ maxLength: 254 }} />
          <TextField fullWidth label="7. Office Address (mandatory)" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} error={!!errors.address} helperText={errors.address} multiline rows={3} size="small" sx={{ mb: 3 }} inputProps={{ maxLength: 500 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>8. Contact Person Details (mandatory)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField label="Full Name" value={formData.contactPersonName} onChange={e => handleInputChange('contactPersonName', e.target.value)} error={!!errors.contactPersonName} helperText={errors.contactPersonName} size="small" fullWidth inputProps={{ maxLength: 100 }} />
              <TextField label="Phone Number" value={formData.contactPersonPhone} onChange={e => handleInputChange('contactPersonPhone', e.target.value)} error={!!errors.contactPersonPhone} helperText={errors.contactPersonPhone} size="small" fullWidth inputProps={{ maxLength: 20 }} />
              <TextField label="Email Address" type="email" value={formData.contactPersonEmail} onChange={e => handleInputChange('contactPersonEmail', e.target.value)} error={!!errors.contactPersonEmail} helperText={errors.contactPersonEmail} size="small" fullWidth inputProps={{ maxLength: 254 }} />
            </Box>
          </Box>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth size="small" error={!!errors.addressProof}>
              <InputLabel>9. Proof of Office Address (mandatory)</InputLabel>
              <Select value={formData.addressProof} onChange={e => handleInputChange('addressProof', e.target.value)} label="9. Proof of Office Address (mandatory)">
                <MenuItem value=""><em>Select proof type</em></MenuItem>
                <MenuItem value="Telephone Bill">Latest telephone bill (landline)</MenuItem>
                <MenuItem value="Utility Bill">Latest utility bill (water/electricity)</MenuItem>
                <MenuItem value="Lease Agreement">Lease agreement/sale agreement</MenuItem>
                <MenuItem value="City Rates">City rates</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            {errors.addressProof && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.addressProof}</Typography>}
            <CustomFileInput label="Address proof document file" fileKey="addressProof" />
          </Box>
        </Box>
      );

      case 2: return (
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>10. Articles of Association / Constitution (mandatory)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth size="small" error={!!errors.articlesOfAssociation}>
                  <InputLabel>Document Type</InputLabel>
                  <Select value={formData.articlesOfAssociation} onChange={e => handleInputChange('articlesOfAssociation', e.target.value)} label="Document Type">
                    <MenuItem value=""><em>Select document type</em></MenuItem>
                    <MenuItem value="Articles of Association">Articles of association</MenuItem>
                    <MenuItem value="Constitution">Constitution of Company</MenuItem>
                    <MenuItem value="Partnership Agreement">Partnership Agreement</MenuItem>
                    <MenuItem value="Board Resolution">Board Resolution</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                {errors.articlesOfAssociation && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.articlesOfAssociation}</Typography>}
              </Box>
              <CustomFileInput label="Articles of association file" fileKey="articles" />
            </Box>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>11. Directors / Senior Management ID (mandatory)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth size="small" error={!!errors.directorsId}>
                  <InputLabel>Document Type</InputLabel>
                  <Select value={formData.directorsId} onChange={e => handleInputChange('directorsId', e.target.value)} label="Document Type">
                    <MenuItem value=""><em>Select document type</em></MenuItem>
                    <MenuItem value="National ID">National ID</MenuItem>
                    <MenuItem value="Passport">Valid passport</MenuItem>
                    <MenuItem value="Drivers Licence">Driver's licence</MenuItem>
                  </Select>
                </FormControl>
                {errors.directorsId && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.directorsId}</Typography>}
              </Box>
              <CustomFileInput label="Directors ID file" fileKey="directorsId" />
            </Box>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>12. Source of Funds (mandatory)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth size="small" error={!!errors.sourceOfFunds}>
                  <InputLabel>Document Type</InputLabel>
                  <Select value={formData.sourceOfFunds} onChange={e => handleInputChange('sourceOfFunds', e.target.value)} label="Document Type">
                    <MenuItem value=""><em>Select type</em></MenuItem>
                    <MenuItem value="Audited Financials">Audited financial statements</MenuItem>
                    <MenuItem value="Bank Statements">Bank statements</MenuItem>
                    <MenuItem value="Investment Portfolio">Investment portfolio statement</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                {errors.sourceOfFunds && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.sourceOfFunds}</Typography>}
              </Box>
              <CustomFileInput label="Source of funds document" fileKey="sourceOfFunds" />
            </Box>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>13. Bank Account Proof (mandatory)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth size="small" error={!!errors.bankAccountProof}>
                  <InputLabel>Document Type</InputLabel>
                  <Select value={formData.bankAccountProof} onChange={e => handleInputChange('bankAccountProof', e.target.value)} label="Document Type">
                    <MenuItem value=""><em>Select type</em></MenuItem>
                    <MenuItem value="Bank Statement">Bank statement</MenuItem>
                    <MenuItem value="Cancelled Cheque">Cancelled cheque</MenuItem>
                    <MenuItem value="Bank Letter">Letter from bank confirming account details</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                {errors.bankAccountProof && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.bankAccountProof}</Typography>}
              </Box>
              <CustomFileInput label="Bank account proof document" fileKey="bankAccount" />
            </Box>
          </Box>
        </Box>
      );

      case 3: return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Declaration</Typography>
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              I/We hereby declare that the information provided in this KYC update is true, accurate and complete to the best of my/our knowledge and belief. I/We understand that providing false or misleading information may result in legal consequences and/or termination of services.
            </Typography>
          </Paper>
          <FormControlLabel control={<Checkbox checked={formData.pepDeclaration} onChange={e => handleInputChange('pepDeclaration', e.target.checked)} />} label={<Typography variant="body2">I/We confirm the entity is <strong>not</strong> a Politically Exposed Person (PEP) or associated with a PEP. (Check if applicable)</Typography>} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }} />
          <FormControlLabel control={<Checkbox checked={formData.declaration} onChange={e => handleInputChange('declaration', e.target.checked)} />} label={<Typography variant="body2"><strong>I/We agree to the above declaration</strong> and confirm all information provided is accurate.</Typography>} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }} />
          {errors.declaration && <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>{errors.declaration}</Typography>}
        </Box>
      );

      default: return null;
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(/ombackground_alt.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Loading your KYC information...</Typography>
          <Typography variant="body2" color="text.secondary">Please wait while we retrieve your data</Typography>
        </Paper>
      </Box>
    );
  }

  if (!tokenValid) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(/ombackground_alt.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, maxWidth: 500 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>Access Denied</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>This update link is invalid or has expired. Please contact Old Mutual support for assistance.</Typography>
          <Button component={Link} to="/" variant="contained" startIcon={<ArrowBack />}>Return to Home</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {updateRequest && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2"><strong>Update Request:</strong> {updateRequest.message}</Typography>
          <Typography variant="caption" color="text.secondary">Requested on {new Date(updateRequest.requestedAt).toLocaleDateString()}</Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button component={Link} to="/" startIcon={<ArrowBack sx={{ color: 'green' }} />} variant="outlined" sx={{ color: 'green', borderColor: 'green', '&:hover': { color: '#107c10', borderColor: '#107c10', backgroundColor: '#f0f8f0' } }}>
          Back to Home
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 3, gap: 2 }}>
          <Update sx={{ color: 'orange', fontSize: 30 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'green', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Update Corporate KYC
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

      <Stepper activeStep={activeStep} connector={<StepConnector />} sx={{ mb: 4, '& .MuiStep-root': { cursor: 'pointer' }, '& .MuiStepLabel-label': { fontSize: '0.8rem' } }}>
        {steps.map((step, index) => {
          const { completed } = getStepCompleteness(index);
          return (
            <Step key={step.label} completed={completed} onClick={() => setActiveStep(index)}>
              <StepLabel>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <step.icon sx={{ fontSize: 20, color: activeStep === index ? 'primary.main' : 'text.secondary' }} />
                  <Typography variant="caption">{step.label}</Typography>
                </Box>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Paper sx={{ border: '1px solid #ddd', borderRadius: 3, backgroundColor: 'white', mb: 3 }}>
        {renderStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))} disabled={activeStep === 0} variant="outlined">Back</Button>
        {activeStep < steps.length - 1 ? (
          <Button onClick={() => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))} disabled={!isStepValid(activeStep)} variant="contained">Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} variant="contained" size="large" sx={{ px: 4, background: loading ? '#ccc' : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' }}>
            {loading ? 'Updating...' : 'Submit Corporate KYC Update'}
          </Button>
        )}
      </Box>

      {showProgressIndicator && (
        <FloatingProgressIndicator
          steps={getStepData()}
          overallProgress={getOverallProgress()}
          onClose={() => setShowProgressIndicator(false)}
          formType="Corporate Update"
        />
      )}
    </Box>
  );
};

export default KycCorporateUpdate;
