import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowBack, Update } from '@mui/icons-material';
import { defaultToastrOptions } from '../lib/security';

// Import toastr
declare const toastr: any;

interface GroupSignatory {
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

interface GroupUpdateFormData {
  signatories: GroupSignatory[];
}

const KycGroupUpdate: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmationDialog();
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [updateRequest, setUpdateRequest] = useState<any>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [validationError, setValidationError] = useState<string>('');
  const [formData, setFormData] = useState<GroupUpdateFormData>({
    signatories: []
  });

  // Initialize toastr on component mount
  useEffect(() => {
    if (typeof toastr !== 'undefined') {
      toastr.options = defaultToastrOptions;
    }
  }, []);

  // Load submission data on component mount
  const loadSubmissionData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`/api/admin/submission-by-token/${token}`);

      if (response.data.submission) {
        const submission = response.data.submission;
        const existingSignatories = Array.isArray(submission?.formData?.signatories)
          ? submission.formData.signatories
          : [];

        setFormData({
          signatories: existingSignatories.map((sig: any) => ({
            fullName: sig.fullName || '',
            address: sig.address || '',
            phone: sig.phone || '',
            email: sig.email || '',
            occupation: sig.occupation || '',
            idType: sig.idType || '',
            idDocument: null,
            idDocumentFront: null,
            idDocumentBack: null,
            addressProof: sig.addressProof || '',
            addressProofFile: null
          }))
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
  }, [token]);

  useEffect(() => {
    if (token) {
      loadSubmissionData();
    }
  }, [token, loadSubmissionData]);

  const updateSignatory = (index: number, field: keyof GroupSignatory, value: any) => {
    setFormData(prev => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) =>
        i === index ? { ...sig, [field]: value } : sig
      )
    }));
  };

  const addSignatory = () => {
    setFormData(prev => ({
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
          addressProofFile: null
        }
      ]
    }));
  };

  const removeSignatory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index)
    }));
  };

  const handleSignatoryIdTypeChange = (index: number, idType: string) => {
    setFormData(prev => ({
      ...prev,
      signatories: prev.signatories.map((sig, i) => {
        if (i !== index) return sig;

        if (idType === 'National ID') {
          return {
            ...sig,
            idType,
            idDocument: null
          };
        }

        return {
          ...sig,
          idType,
          idDocumentFront: null,
          idDocumentBack: null
        };
      })
    }));

    setErrors(prev => ({
      ...prev,
      [`signatory_${index}_idType`]: '',
      [`signatory_${index}_idDocument`]: '',
      [`signatory_${index}_idDocumentFront`]: '',
      [`signatory_${index}_idDocumentBack`]: ''
    }));
  };

  const handleSignatoryFileChange = (index: number, field: 'idDocument' | 'idDocumentFront' | 'idDocumentBack' | 'addressProofFile', files: FileList | null) => {
    const file = files?.[0] || null;
    updateSignatory(index, field, file);

    if (file) {
      const errorMap: {[key: string]: string} = {
        idDocument: `signatory_${index}_idDocument`,
        idDocumentFront: `signatory_${index}_idDocumentFront`,
        idDocumentBack: `signatory_${index}_idDocumentBack`,
        addressProofFile: `signatory_${index}_addressProofFile`
      };
      setErrors(prev => ({ ...prev, [errorMap[field]]: '' }));
    }
  };

  const validateSignatories = (): { valid: boolean; errorKeys: string[] } => {
    const newErrors: {[key: string]: string} = {};

    if (formData.signatories.length === 0) {
      newErrors.signatories = 'Please add at least one signatory';
    } else {
      formData.signatories.forEach((sig, index) => {
        if (!sig.fullName.trim()) {
          newErrors[`signatory_${index}_fullName`] = `Signatory ${index + 1}: Full name is required`;
        }
        if (!sig.phone.trim()) {
          newErrors[`signatory_${index}_phone`] = `Signatory ${index + 1}: Phone number is required`;
        }
        if (!sig.email.trim()) {
          newErrors[`signatory_${index}_email`] = `Signatory ${index + 1}: Email is required`;
        }
        if (!sig.address.trim()) {
          newErrors[`signatory_${index}_address`] = `Signatory ${index + 1}: Address is required`;
        }
        if (!sig.occupation.trim()) {
          newErrors[`signatory_${index}_occupation`] = `Signatory ${index + 1}: Occupation is required`;
        }
        if (!sig.idType) {
          newErrors[`signatory_${index}_idType`] = `Signatory ${index + 1}: ID type is required`;
        }
        if (sig.idType === 'National ID') {
          if (!sig.idDocumentFront) {
            newErrors[`signatory_${index}_idDocumentFront`] = `Signatory ${index + 1}: National ID front side file is required`;
          }
          if (!sig.idDocumentBack) {
            newErrors[`signatory_${index}_idDocumentBack`] = `Signatory ${index + 1}: National ID back side file is required`;
          }
        } else {
          if (!sig.idDocument) {
            newErrors[`signatory_${index}_idDocument`] = `Signatory ${index + 1}: ID document file is required`;
          }
        }
        if (!sig.addressProof) {
          newErrors[`signatory_${index}_addressProof`] = `Signatory ${index + 1}: Address proof type is required`;
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

  const handleSubmit = async () => {
    if (!token) return;

    const { valid } = validateSignatories();
    if (!valid) {
      setValidationError('Please fix all validation errors before updating');
      return;
    }

    setValidationError('');

    const confirmed = await confirm({
      title: 'Submit KYC updates?',
      message: 'This will send your updated group KYC details and documents for review.',
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
        signatories: formData.signatories.map(sig => ({
          fullName: sig.fullName,
          address: sig.address,
          phone: sig.phone,
          email: sig.email,
          occupation: sig.occupation,
          idType: sig.idType,
          addressProof: sig.addressProof
        }))
      }));

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

      await axios.put(`/api/admin/update-submission/${token}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Show success toast
      if (typeof toastr !== 'undefined') {
        toastr.success('Your Group KYC has been updated successfully!', 'Update Successful');
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
            Update Group KYC
          </Typography>
        </Box>
      </Box>

      {/* Validation Error Banner */}
      {validationError && (
        <Box sx={{ mb: 3 }}>
          <Alert
            severity="error"
            onClose={() => setValidationError('')}
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
          p: 4
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Update Signatories
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Upload updated signatory identity and address proof documents. National ID requires front and back files.
        </Typography>

        {errors.signatories && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.signatories}
          </Alert>
        )}

        {formData.signatories.map((signatory, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Signatory {index + 1}
              </Typography>
              <Button color="error" variant="outlined" size="small" onClick={() => removeSignatory(index)}>
                Remove
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label="Full Name"
                value={signatory.fullName}
                onChange={(e) => updateSignatory(index, 'fullName', e.target.value)}
                size="small"
                error={!!errors[`signatory_${index}_fullName`]}
                helperText={errors[`signatory_${index}_fullName`]}
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Phone"
                value={signatory.phone}
                onChange={(e) => updateSignatory(index, 'phone', e.target.value)}
                size="small"
                error={!!errors[`signatory_${index}_phone`]}
                helperText={errors[`signatory_${index}_phone`]}
                inputProps={{ maxLength: 20 }}
              />
              <TextField
                label="Email"
                value={signatory.email}
                onChange={(e) => updateSignatory(index, 'email', e.target.value)}
                size="small"
                error={!!errors[`signatory_${index}_email`]}
                helperText={errors[`signatory_${index}_email`]}
                inputProps={{ maxLength: 254 }}
              />
              <TextField
                label="Occupation"
                value={signatory.occupation}
                onChange={(e) => updateSignatory(index, 'occupation', e.target.value)}
                size="small"
                error={!!errors[`signatory_${index}_occupation`]}
                helperText={errors[`signatory_${index}_occupation`]}
                inputProps={{ maxLength: 100 }}
              />
            </Box>

            <TextField
              label="Address"
              value={signatory.address}
              onChange={(e) => updateSignatory(index, 'address', e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
              error={!!errors[`signatory_${index}_address`]}
              inputProps={{ maxLength: 500 }}
              helperText={errors[`signatory_${index}_address`]}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <FormControl size="small" error={!!errors[`signatory_${index}_idType`]}>
                <InputLabel>ID Type</InputLabel>
                <Select
                  value={signatory.idType}
                  onChange={(e) => handleSignatoryIdTypeChange(index, e.target.value)}
                  label="ID Type"
                >
                  <MenuItem value=""><em>Select ID type</em></MenuItem>
                  <MenuItem value="National ID">National ID</MenuItem>
                  <MenuItem value="Passport">Passport</MenuItem>
                  <MenuItem value="Driver's Licence">Driver's Licence</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" error={!!errors[`signatory_${index}_addressProof`]}>
                <InputLabel>Address Proof</InputLabel>
                <Select
                  value={signatory.addressProof}
                  onChange={(e) => updateSignatory(index, 'addressProof', e.target.value)}
                  label="Address Proof"
                >
                  <MenuItem value=""><em>Select proof type</em></MenuItem>
                  <MenuItem value="Telephone Bill">Telephone Bill</MenuItem>
                  <MenuItem value="Utility Bill">Utility Bill</MenuItem>
                  <MenuItem value="Lease Agreement">Lease Agreement</MenuItem>
                  <MenuItem value="City Rates">City Rates</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {errors[`signatory_${index}_idType`] && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                {errors[`signatory_${index}_idType`]}
              </Typography>
            )}
            {errors[`signatory_${index}_addressProof`] && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                {errors[`signatory_${index}_addressProof`]}
              </Typography>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                {signatory.idType === 'National ID' ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>National ID Front *</Typography>
                    <input
                      type="file"
                      onChange={(e) => handleSignatoryFileChange(index, 'idDocumentFront', e.target.files)}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    {errors[`signatory_${index}_idDocumentFront`] && (
                      <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                        {errors[`signatory_${index}_idDocumentFront`]}
                      </Typography>
                    )}

                    <Typography variant="body2" sx={{ mt: 1.5, mb: 0.5, fontWeight: 600 }}>National ID Back *</Typography>
                    <input
                      type="file"
                      onChange={(e) => handleSignatoryFileChange(index, 'idDocumentBack', e.target.files)}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    {errors[`signatory_${index}_idDocumentBack`] && (
                      <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                        {errors[`signatory_${index}_idDocumentBack`]}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>ID Document *</Typography>
                    <input
                      type="file"
                      onChange={(e) => handleSignatoryFileChange(index, 'idDocument', e.target.files)}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    {errors[`signatory_${index}_idDocument`] && (
                      <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                        {errors[`signatory_${index}_idDocument`]}
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>Address Proof File *</Typography>
                <input
                  type="file"
                  onChange={(e) => handleSignatoryFileChange(index, 'addressProofFile', e.target.files)}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                {errors[`signatory_${index}_addressProofFile`] && (
                  <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                    {errors[`signatory_${index}_addressProofFile`]}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        ))}

        <Button onClick={addSignatory} variant="outlined" sx={{ mb: 3 }}>
          + Add Signatory
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1rem',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
          }}
        >
          {loading ? 'Updating...' : 'Update Group KYC'}
        </Button>
      </Paper>
    </Box>
  );
};

export default KycGroupUpdate;