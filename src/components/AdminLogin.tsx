import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import { FloatingInput } from './ui/floating-input';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<'error' | 'success' | 'info'>('error');
  const navigate = useNavigate();
  const { confirm } = useConfirmationDialog();

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageSeverity('error');

    try {
      if (passwordChangeRequired) {
        if (newPassword !== confirmPassword) {
          setMessage('New password and confirmation do not match.');
          setLoading(false);
          return;
        }

        const confirmed = await confirm({
          title: 'Set new password?',
          message: 'This will update your password and continue to the dashboard.',
          confirmLabel: 'Update Password',
          tone: 'primary'
        });

        if (!confirmed) {
          setLoading(false);
          return;
        }

        const resetResponse = await axios.post('/api/auth/first-login-password', {
          passwordResetToken,
          newPassword
        });

        localStorage.setItem('adminToken', resetResponse.data.token);
        localStorage.setItem('adminUser', JSON.stringify(resetResponse.data.admin));
        navigate('/admin/dashboard');
        return;
      }

      const response = await axios.post('/api/auth/login', credentials);

      if (response.data?.passwordChangeRequired) {
        setPasswordChangeRequired(true);
        setPasswordResetToken(response.data.passwordResetToken || '');
        setMessageSeverity('info');
        setMessage(response.data?.message || 'Please set a new password to continue.');
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

      navigate('/admin/dashboard');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
      setMessageSeverity('error');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/ombackground_alt.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '24px'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '32px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/OMU.JO-4aa2b32b.png"
            alt="Admin Logo"
            style={{ width: '120px', height: 'auto', display: 'block', margin: '0 auto 8px' }}
          />
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1a1a1a' }}>
            Admin Login
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b6b6b' }}>
            Access the KYC administration panel
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FloatingInput
            label="Username"
            value={credentials.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            disabled={passwordChangeRequired}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(e); } }}
          />
          <FloatingInput
            label="Password"
            type="password"
            showPasswordToggle
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={passwordChangeRequired}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(e); } }}
          />
          {passwordChangeRequired && (
            <>
              <FloatingInput
                label="New Password"
                type="password"
                showPasswordToggle
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(e); } }}
              />
              <p style={{ margin: '-8px 0 0', fontSize: '12px', color: '#6b6b6b' }}>
                Minimum 8 chars, at least 1 number and 1 special character
              </p>
              <FloatingInput
                label="Confirm New Password"
                type="password"
                showPasswordToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleSubmit(e); } }}
              />
            </>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              background: loading ? '#c9c9c9' : 'linear-gradient(135deg, #009979, #3F9339)',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : passwordChangeRequired ? 'Set New Password' : 'Sign In'}
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: messageSeverity === 'success' ? '#dff6dd' : messageSeverity === 'info' ? '#e3f1e8' : '#fde7e9',
              color: messageSeverity === 'success' ? '#006437' : messageSeverity === 'info' ? '#006437' : '#a4262c',
              border: `1px solid ${messageSeverity === 'success' ? '#9fd89b' : messageSeverity === 'info' ? '#9fd89b' : '#f1aeb5'}`,
              fontSize: '14px'
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b6b6b' }}>
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
