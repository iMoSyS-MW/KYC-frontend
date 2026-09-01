import { useState, useCallback } from 'react';
import axios from '../../../api/client';
import { mapUser } from '../../../lib/apiMappers';
import { useConfirmationDialog } from '../../../context/ConfirmationDialogContext';

export function useUsers(currentUser: any, hasCurrentRole: (role: string) => boolean) {
  const { confirm } = useConfirmationDialog();
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roles: ['approver'] as string[],
    accessTypes: [] as string[],
    isActive: true
  });

  // User Review Filter/Pagination State
  const [userReviewRoleFilter, setUserReviewRoleFilter] = useState('all');
  const [userReviewStatusFilter, setUserReviewStatusFilter] = useState('all');
  const [userReviewPage, setUserReviewPage] = useState(1);
  const [userReviewItemsPerPage, setUserReviewItemsPerPage] = useState(10);

  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers((response.data as any[]).map(mapUser));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const validateManagedUserForm = (username: string, email: string, firstName: string, lastName: string): string | null => {
    if (!username || username.length < 3 || username.length > 30) {
      return 'Username must be between 3 and 30 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (!firstName || firstName.length < 1) {
      return 'First name is required';
    }
    if (!lastName || lastName.length < 1) {
      return 'Last name is required';
    }
    return null;
  };

  const handleCreateUser = async () => {
    const validationError = validateManagedUserForm(
      userForm.username,
      userForm.email,
      userForm.firstName,
      userForm.lastName
    );
    if (validationError) {
      return { success: false, message: validationError };
    }

    const confirmed = await confirm({
      title: 'Create new user?',
      message: `This will create a new user account for ${userForm.username}.`,
      confirmLabel: 'Create User',
      tone: 'primary'
    });

    if (!confirmed) {
      return { success: false, message: 'Cancelled' };
    }

    setUserActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/users', {
        username: userForm.username,
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        roles: userForm.roles,
        accessTypes: userForm.accessTypes,
        isActive: userForm.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowUserModal(false);
      setUserForm({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: ['approver'],
        accessTypes: [],
        isActive: true
      });
      await loadUsers();
      return { success: true, message: 'User created successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error creating user' };
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return { success: false, message: 'No user selected' };

    const validationError = validateManagedUserForm(
      userForm.username,
      userForm.email,
      userForm.firstName,
      userForm.lastName
    );
    if (validationError) {
      return { success: false, message: validationError };
    }

    const confirmed = await confirm({
      title: 'Update user?',
      message: `This will update the user account for ${userForm.username}.`,
      confirmLabel: 'Update User',
      tone: 'primary'
    });

    if (!confirmed) {
      return { success: false, message: 'Cancelled' };
    }

    setUserActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/users/${editingUser._id}`, {
        username: userForm.username,
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        roles: userForm.roles,
        accessTypes: userForm.accessTypes,
        isActive: userForm.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: ['approver'],
        accessTypes: [],
        isActive: true
      });
      await loadUsers();
      return { success: true, message: 'User updated successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error updating user' };
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleResetUserPassword = async (user: any) => {
    const confirmed = await confirm({
      title: 'Reset password?',
      message: `This will reset the password for ${user.username}. They will need to set a new password on their next login.`,
      confirmLabel: 'Reset Password',
      tone: 'warning'
    });

    if (!confirmed) return { success: false, message: 'Cancelled' };

    setUserActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/users/${user._id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadUsers();
      return { success: true, message: 'Password reset successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error resetting password' };
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Delete user?',
      message: 'This action cannot be undone. The user will be permanently removed.',
      confirmLabel: 'Delete',
      tone: 'danger'
    });

    if (!confirmed) return { success: false, message: 'Cancelled' };

    setUserActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadUsers();
      return { success: true, message: 'User deleted successfully' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error deleting user' };
    } finally {
      setUserActionLoading(false);
    }
  };

  const openUserModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['approver']),
        accessTypes: Array.isArray(user.accessTypes) ? user.accessTypes : [],
        isActive: user.isActive !== false
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: ['approver'],
        accessTypes: [],
        isActive: true
      });
    }
    setShowUserModal(true);
  };

  // Filtered users for User Review tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = !userSearchTerm ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase());

    const roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
    const matchesRole = userReviewRoleFilter === 'all' || roles.includes(userReviewRoleFilter);
    const matchesStatus = userReviewStatusFilter === 'all' ||
      (userReviewStatusFilter === 'active' && user.isActive) ||
      (userReviewStatusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Available roles for filter
  const availableUserRoles = Array.from(new Set(
    users.flatMap(user => {
      const roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
      return roles;
    })
  )).filter(Boolean).sort();

  // Pagination for user review
  const userReviewTotalPages = Math.ceil(filteredUsers.length / userReviewItemsPerPage);
  const safeUserReviewPage = Math.min(userReviewPage, Math.max(1, userReviewTotalPages));
  const userReviewStartIndex = (safeUserReviewPage - 1) * userReviewItemsPerPage;
  const paginatedUsers = filteredUsers.slice(userReviewStartIndex, userReviewStartIndex + userReviewItemsPerPage);

  const handleUserReviewItemsPerPageChange = (newItemsPerPage: number) => {
    setUserReviewItemsPerPage(newItemsPerPage);
    setUserReviewPage(1);
  };

  return {
    users,
    showUserModal,
    setShowUserModal,
    editingUser,
    userSearchTerm,
    setUserSearchTerm,
    userActionLoading,
    userForm,
    setUserForm,
    userReviewRoleFilter,
    setUserReviewRoleFilter,
    userReviewStatusFilter,
    setUserReviewStatusFilter,
    userReviewPage,
    setUserReviewPage,
    userReviewItemsPerPage,
    filteredUsers,
    availableUserRoles,
    userReviewTotalPages,
    safeUserReviewPage,
    userReviewStartIndex,
    paginatedUsers,
    loadUsers,
    handleCreateUser,
    handleUpdateUser,
    handleResetUserPassword,
    handleDeleteUser,
    openUserModal,
    handleUserReviewItemsPerPageChange,
  };
}
