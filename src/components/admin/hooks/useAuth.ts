import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/client';
import { useConfirmationDialog } from '../../../context/ConfirmationDialogContext';
import { parsePgArray } from '../../../lib/apiMappers';

/** Mirrors the backend password policy: 8+ characters, at least one digit and one special character. */
const isStrongPassword = (password: string) =>
  password.length >= 8 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);

export function useAuth() {
  const navigate = useNavigate();
  const { confirm } = useConfirmationDialog();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const userInfo = localStorage.getItem('adminUser');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setCurrentUser({
        ...parsed,
        roles: parsePgArray(parsed.roles),
        accessTypes: parsePgArray(parsed.accessTypes),
      });
    }
  }, [navigate]);

  const logout = async () => {
    const confirmed = await confirm({
      title: 'Log out now?',
      message: 'Your current admin session will be closed and you will return to the login screen.',
      confirmLabel: 'Log Out',
      tone: 'warning'
    });

    if (!confirmed) {
      return;
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (!isStrongPassword(passwordForm.newPassword)) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters and include a number and a special character'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Change your password?',
      message: 'Your account password will be updated immediately. Make sure you have entered the correct new password before continuing.',
      confirmLabel: 'Change Password',
      tone: 'primary'
    });

    if (!confirmed) {
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage(null);
      }, 2000);
    } catch (error: any) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating password'
      });
    }
    setPasswordLoading(false);
  };

  const hasCurrentRole = (role: string) => {
    const roles = Array.isArray(currentUser?.roles)
      ? currentUser.roles
      : (currentUser?.role ? [currentUser.role] : []);
    return roles.includes(role);
  };

  const isCurrentUserRecord = (user: any) => {
    return currentUser && user._id === currentUser._id;
  };

  return {
    currentUser,
    setCurrentUser,
    sidebarCollapsed,
    setSidebarCollapsed,
    showPasswordModal,
    setShowPasswordModal,
    passwordForm,
    setPasswordForm,
    passwordLoading,
    passwordMessage,
    checkAuth,
    logout,
    handlePasswordChange,
    hasCurrentRole,
    isCurrentUserRecord,
  };
}
