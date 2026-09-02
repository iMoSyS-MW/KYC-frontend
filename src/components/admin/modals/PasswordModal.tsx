import React from 'react';
import { FloatingInput } from '../../ui/floating-input';
import { colors } from '../theme';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordModalProps {
  show: boolean;
  onClose: () => void;
  passwordForm: PasswordForm;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  onSave: () => void;
  loading: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: colors.cardBg,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  width: '100%',
  maxWidth: '400px',
  padding: '24px',
};

const buttonBaseStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'opacity 0.2s',
};

export default function PasswordModal({
  show,
  onClose,
  passwordForm,
  setPasswordForm,
  onSave,
  loading,
  message,
}: PasswordModalProps) {
  if (!show) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            margin: '0 0 20px',
            fontSize: '18px',
            color: colors.textPrimary,
          }}
        >
          Change Password
        </h2>

        {message && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              backgroundColor:
                message.type === 'success' ? colors.greenSoft : '#f8d7da',
              color:
                message.type === 'success' ? '#155724' : '#721c24',
            }}
          >
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FloatingInput
            label="Current Password"
            type="password"
            showPasswordToggle
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
          />

          <FloatingInput
            label="New Password"
            type="password"
            showPasswordToggle
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
          />

          <FloatingInput
            label="Confirm Password"
            type="password"
            showPasswordToggle
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              ...buttonBaseStyle,
              backgroundColor: colors.tableHeaderBg,
              color: colors.textPrimary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            style={{
              ...buttonBaseStyle,
              backgroundColor: colors.green,
              color: '#fff',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
