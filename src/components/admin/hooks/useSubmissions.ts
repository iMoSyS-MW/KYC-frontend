import { useState, useEffect, useCallback } from 'react';
import axios from '../../../api/client';
import { mapSubmission } from '../../../lib/apiMappers';
import { KycSubmission, DashboardStats } from '../../../types/admin';

export function useSubmissions(currentUser: any) {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<KycSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needsInfo: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [remarks, setRemarks] = useState('');
  const [nextAction, setNextAction] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Filter state
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadSubmissions = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/submissions');
      const mapped = (response.data as any[]).map(mapSubmission);
      setSubmissions(mapped);
      calculateStats(mapped);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
    setLoading(false);
  }, []);

  const calculateStats = (data: KycSubmission[]) => {
    const newStats = {
      total: data.length,
      pending: data.filter(s => s.status === 'pending').length,
      approved: data.filter(s => s.status === 'approved').length,
      rejected: data.filter(s => s.status === 'rejected').length,
      needsInfo: data.filter(s => s.status === 'needs_info').length
    };
    setStats(newStats);
  };

  const filterSubmissions = useCallback(() => {
    let filtered = submissions;

    // Apply permission-based filtering for non-admin users only
    if (
      currentUser &&
      !((Array.isArray(currentUser.roles) ? currentUser.roles : (currentUser.role ? [currentUser.role] : [])).includes('admin')) &&
      Array.isArray(currentUser.accessTypes) &&
      currentUser.accessTypes.length > 0 &&
      !currentUser.accessTypes.includes('all')
    ) {
      filtered = filtered.filter(submission => {
        return currentUser.accessTypes.includes(submission.type);
      });
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.formData?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.formData?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.formData?.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.formData?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Apply lifecycle filter
    if (lifecycleFilter !== 'all') {
      filtered = filtered.filter((s) => {
        if (lifecycleFilter === 'due_soon') return Boolean(s.kycLifecycle?.dueSoon);
        if (lifecycleFilter === 'expired') return Boolean(s.kycLifecycle?.expired || s.kycLifecycle?.isExpired);
        if (lifecycleFilter === 'pending_update') return Boolean(s.kycLifecycle?.pendingUpdate);
        if (lifecycleFilter === 'pending_review') return s.kycLifecycle?.pendingUpdateStatus === 'pending_review';
        return true;
      });
    }

    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(s => new Date(s.submittedAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => new Date(s.submittedAt) <= toDate);
    }

    // Apply completeness filter
    if (filter === 'complete') {
      filtered = filtered.filter(submission => {
        let requiredFields = 0;
        let completedFields = 0;

        if (submission.type === 'individual') {
          const required = ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber'];
          requiredFields = required.length;
          completedFields = required.filter(field => submission.formData?.[field]).length;
        } else if (submission.type === 'group') {
          const required = ['name', 'foundingDocument', 'sourceOfFunds'];
          requiredFields = required.length;
          completedFields = required.filter(field => submission.formData?.[field]).length;
        } else if (submission.type === 'corporate') {
          const required = ['organizationName', 'contactPersonName', 'phone', 'email', 'identificationDocument'];
          requiredFields = required.length;
          completedFields = required.filter(field => submission.formData?.[field]).length;
        }

        const completeness = (completedFields / requiredFields) * 100;
        return completeness >= 80;
      });
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(submission => {
        let requiredFields = 0;
        let completedFields = 0;

        if (submission.type === 'individual') {
          const required = ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber'];
          requiredFields = required.length;
          completedFields = required.filter(field => submission.formData?.[field]).length;
        } else if (submission.type === 'group') {
          const required = ['name', 'foundingDocument', 'sourceOfFunds'];
          requiredFields = required.length;
          completedFields = required.filter(field => submission.formData?.[field]).length;
        } else if (submission.type === 'corporate') {
          const required = ['organizationName', 'contactPersonName', 'phone', 'email', 'identificationDocument'];
          requiredFields = required.length;
          completedFields = required.filter(field => submission.formData?.[field]).length;
        }

        const completeness = (completedFields / requiredFields) * 100;
        return completeness < 80;
      });
    }

    // Apply legacy status filter for backward compatibility
    if (filter !== 'all' && filter !== 'complete' && filter !== 'incomplete') {
      filtered = filtered.filter(s => s.status === filter);
    }

    setFilteredSubmissions(filtered);
    setCurrentPage(1);
  }, [submissions, filter, searchTerm, typeFilter, statusFilter, lifecycleFilter, dateFrom, dateTo, currentUser]);

  useEffect(() => {
    filterSubmissions();
  }, [filterSubmissions]);

  // Keep the open detail panel pointed at the freshly loaded copy of its submission.
  useEffect(() => {
    setSelectedSubmission(prev => (prev ? submissions.find(s => s._id === prev._id) ?? prev : prev));
  }, [submissions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const clearSubmissionFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setLifecycleFilter('all');
    setDateFrom('');
    setDateTo('');
    setFilter('all');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getLifecycleBadges = (submission: KycSubmission) => {
    const badges: Array<{ text: string; bg: string; color: string }> = [];

    if (submission.kycLifecycle?.expired || submission.kycLifecycle?.isExpired) {
      badges.push({ text: 'Expired', bg: '#f8d7da', color: '#721c24' });
    } else if (submission.kycLifecycle?.dueSoon) {
      badges.push({ text: 'Due Soon', bg: '#fff3cd', color: '#856404' });
    }

    if (submission.kycLifecycle?.pendingUpdate) {
      badges.push({ text: 'Pending Update', bg: '#d1ecf1', color: '#0c5460' });
    }

    if (submission.kycLifecycle?.pendingUpdateStatus === 'pending_review') {
      badges.push({ text: 'Update Under Review', bg: '#cce5ff', color: '#004085' });
    }

    return badges;
  };

  return {
    submissions,
    filteredSubmissions,
    stats,
    loading,
    selectedSubmission,
    setSelectedSubmission,
    requestMessage,
    setRequestMessage,
    remarks,
    setRemarks,
    nextAction,
    setNextAction,
    dueDate,
    setDueDate,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    lifecycleFilter,
    setLifecycleFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentSubmissions,
    loadSubmissions,
    clearSubmissionFilters,
    handlePageChange,
    handleItemsPerPageChange,
    getLifecycleBadges,
  };
}
