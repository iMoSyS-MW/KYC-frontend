import React from 'react';
import { FloatingInput } from '../../ui/floating-input';
import { colors } from '../theme';

interface UserForm {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  accessTypes: string[];
  isActive: boolean;
}

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  editingUser: any | null;
  userForm: UserForm;
  setUserForm: React.Dispatch<React.SetStateAction<UserForm>>;
  onSave: () => void;
  loading: boolean;
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
  maxWidth: '500px',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: '24px',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: colors.textPrimary,
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  accentColor: colors.green,
};

const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
};

const toggleTrackStyle = (active: boolean): React.CSSProperties => ({
  width: '44px',
  height: '24px',
  borderRadius: '12px',
  backgroundColor: active ? colors.green : '#ccc',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
});

const toggleThumbStyle = (active: boolean): React.CSSProperties => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#fff',
  position: 'absolute',
  top: '2px',
  left: active ? '22px' : '2px',
  transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
});

const buttonBaseStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'opacity 0.2s',
};

const roles = [
  { value: 'approver', label: 'Approver' },
  { value: 'request_info', label: 'Request Info' },
  { value: 'admin', label: 'Admin' },
];

const accessTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Group' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'all', label: 'All' },
];

export default function UserModal({
  show,
  onClose,
  editingUser,
  userForm,
  setUserForm,
  onSave,
  loading,
}: UserModalProps) {
  if (!show) return null;

  const handleRoleToggle = (role: string) => {
    setUserForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleAccessToggle = (access: string) => {
    setUserForm((prev) => ({
      ...prev,
      accessTypes: prev.accessTypes.includes(access)
        ? prev.accessTypes.filter((a) => a !== access)
        : [...prev.accessTypes, access],
    }));
  };

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
          {editingUser ? 'Edit User' : 'Create User'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FloatingInput
            label="Username"
            value={userForm.username}
            onChange={(e) =>
              setUserForm((prev) => ({ ...prev, username: e.target.value }))
            }
          />

          <FloatingInput
            label="Email"
            type="email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <FloatingInput
            label="First Name"
            value={userForm.firstName}
            onChange={(e) =>
              setUserForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />

          <FloatingInput
            label="Last Name"
            value={userForm.lastName}
            onChange={(e) =>
              setUserForm((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />

          <div>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              Roles
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {roles.map((role) => (
                <label key={role.value} style={labelStyle}>
                  <input
                    type="checkbox"
                    checked={userForm.roles.includes(role.value)}
                    onChange={() => handleRoleToggle(role.value)}
                    style={checkboxStyle}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              KYC Access Types
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {accessTypes.map((access) => (
                <label key={access.value} style={labelStyle}>
                  <input
                    type="checkbox"
                    checked={userForm.accessTypes.includes(access.value)}
                    onChange={() => handleAccessToggle(access.value)}
                    style={checkboxStyle}
                  />
                  {access.label}
                </label>
              ))}
            </div>
          </div>

          <div style={toggleContainerStyle}>
            <span style={{ fontSize: '14px', color: colors.textPrimary }}>
              Active
            </span>
            <div
              style={toggleTrackStyle(userForm.isActive)}
              onClick={() =>
                setUserForm((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
            >
              <div style={toggleThumbStyle(userForm.isActive)} />
            </div>
          </div>
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
