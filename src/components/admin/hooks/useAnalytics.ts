import { useMemo } from 'react';
import { KycSubmission, DashboardStats } from '../../../types/admin';

interface FollowupFilters {
  typeFilter: string;
  lifecycleFilter: string;
  searchTerm: string;
}

export function useAnalytics(
  submissions: KycSubmission[],
  stats: DashboardStats,
  followupFilters: FollowupFilters = { typeFilter: 'all', lifecycleFilter: 'all', searchTerm: '' }
) {
  const { typeFilter, lifecycleFilter, searchTerm } = followupFilters;
  // Analytics and Reporting Data
  const analyticsData = useMemo(() => {
    // Status Distribution Pie Chart Data
    const statusData = [
      { name: 'Approved', value: stats.approved, color: '#28a745' },
      { name: 'Pending', value: stats.pending, color: '#ffc107' },
      { name: 'Rejected', value: stats.rejected, color: '#dc3545' },
      { name: 'Needs Info', value: stats.needsInfo, color: '#17a2b8' }
    ].filter(item => item.value > 0);

    // KYC Type Distribution
    const typeData = [
      { name: 'Individual', value: submissions.filter(s => s.type === 'individual').length, color: '#007bff' },
      { name: 'Group', value: submissions.filter(s => s.type === 'group').length, color: '#28a745' },
      { name: 'Corporate', value: submissions.filter(s => s.type === 'corporate').length, color: '#ffc107' }
    ].filter(item => item.value > 0);

    // Monthly Trends (last 6 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthSubmissions = submissions.filter(s => {
        const subDate = new Date(s.submittedAt);
        return subDate.getMonth() === date.getMonth() && subDate.getFullYear() === date.getFullYear();
      });

      monthlyData.push({
        month: monthName,
        total: monthSubmissions.length,
        approved: monthSubmissions.filter(s => s.status === 'approved').length,
        pending: monthSubmissions.filter(s => s.status === 'pending').length,
        rejected: monthSubmissions.filter(s => s.status === 'rejected').length
      });
    }

    // Product Distribution
    const productCounts: { [key: string]: number } = {};
    submissions.forEach(submission => {
      if (submission.formData?.products) {
        const products = Array.isArray(submission.formData.products)
          ? submission.formData.products
          : [submission.formData.products];
        products.forEach((product: string) => {
          if (product && product.trim()) {
            productCounts[product] = (productCounts[product] || 0) + 1;
          }
        });
      }
    });

    const productData = Object.entries(productCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Geographic Distribution
    const countryCounts: { [key: string]: number } = {};
    submissions.forEach(submission => {
      const country = submission.formData?.countryOfResidence ||
                     submission.formData?.nationality ||
                     'Unknown';
      if (country && country !== 'N/A') {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    const countryData = Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Processing Time Analysis: days between submission and the approve/reject decision
    const processingTimes = submissions
      .filter(s => (s.status === 'approved' || s.status === 'rejected') && s.submittedAt && s.updatedAt)
      .map(s => {
        const submitted = new Date(s.submittedAt).getTime();
        const resolved = new Date(s.updatedAt).getTime();
        if (Number.isNaN(submitted) || Number.isNaN(resolved)) return null;
        return Math.max(0, Math.round((resolved - submitted) / (1000 * 60 * 60 * 24)));
      })
      .filter((days): days is number => days !== null);

    const avgProcessingTime = processingTimes.length > 0
      ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
      : 0;

    return {
      statusData,
      typeData,
      monthlyData,
      productData,
      countryData,
      avgProcessingTime,
      processingTimes
    };
  }, [submissions, stats]);

  // Data Completeness Analysis
  const completenessData = useMemo(() => {
    const completenessStats = {
      individual: { total: 0, complete: 0, fields: [] as any[] },
      group: { total: 0, complete: 0, fields: [] as any[] },
      corporate: { total: 0, complete: 0, fields: [] as any[] }
    };

    submissions.forEach(submission => {
      const type = submission.type as keyof typeof completenessStats;
      if (!completenessStats[type]) return;
      completenessStats[type].total++;

      let requiredFields = 0;
      let completedFields = 0;

      if (type === 'individual') {
        const required = ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber'];
        requiredFields = required.length;
        completedFields = required.filter(field => submission.formData?.[field]).length;
      } else if (type === 'group') {
        const required = ['name', 'foundingDocument', 'sourceOfFunds'];
        requiredFields = required.length;
        completedFields = required.filter(field => submission.formData?.[field]).length;
      } else if (type === 'corporate') {
        const required = ['organizationName', 'contactPersonName', 'phone', 'email', 'identificationDocument'];
        requiredFields = required.length;
        completedFields = required.filter(field => submission.formData?.[field]).length;
      }

      const completeness = requiredFields > 0 ? (completedFields / requiredFields) * 100 : 0;
      if (completeness >= 80) {
        completenessStats[type].complete++;
      }

      completenessStats[type].fields.push({
        submissionId: submission._id,
        completeness: Math.round(completeness),
        completedFields,
        requiredFields
      });
    });

    return {
      individual: {
        total: completenessStats.individual.total,
        complete: completenessStats.individual.complete,
        completenessRate: completenessStats.individual.total > 0
          ? Math.round((completenessStats.individual.complete / completenessStats.individual.total) * 100)
          : 0,
        avgCompleteness: completenessStats.individual.fields.length > 0
          ? Math.round(completenessStats.individual.fields.reduce((sum, item) => sum + item.completeness, 0) / completenessStats.individual.fields.length)
          : 0
      },
      group: {
        total: completenessStats.group.total,
        complete: completenessStats.group.complete,
        completenessRate: completenessStats.group.total > 0
          ? Math.round((completenessStats.group.complete / completenessStats.group.total) * 100)
          : 0,
        avgCompleteness: completenessStats.group.fields.length > 0
          ? Math.round(completenessStats.group.fields.reduce((sum, item) => sum + item.completeness, 0) / completenessStats.group.fields.length)
          : 0
      },
      corporate: {
        total: completenessStats.corporate.total,
        complete: completenessStats.corporate.complete,
        completenessRate: completenessStats.corporate.total > 0
          ? Math.round((completenessStats.corporate.complete / completenessStats.corporate.total) * 100)
          : 0,
        avgCompleteness: completenessStats.corporate.fields.length > 0
          ? Math.round(completenessStats.corporate.fields.reduce((sum, item) => sum + item.completeness, 0) / completenessStats.corporate.fields.length)
          : 0
      }
    };
  }, [submissions]);

  // Field Completeness Analysis
  const fieldCompletenessData = useMemo(() => {
    const fieldStats = {
      individual: {} as { [key: string]: { total: number, completed: number, missing: number } },
      group: {} as { [key: string]: { total: number, completed: number, missing: number } },
      corporate: {} as { [key: string]: { total: number, completed: number, missing: number } }
    };

    const requiredFields = {
      individual: ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber', 'idExpiryDate'],
      group: ['name', 'foundingDocument', 'sourceOfFunds', 'bankAccountProof'],
      corporate: ['organizationName', 'contactPersonName', 'phone', 'email', 'identificationDocument', 'sourceOfFunds']
    };

    submissions.forEach(submission => {
      const type = submission.type as keyof typeof requiredFields;
      const fields = requiredFields[type];
      if (!fields) return;

      fields.forEach(field => {
        if (!fieldStats[type][field]) {
          fieldStats[type][field] = { total: 0, completed: 0, missing: 0 };
        }
        fieldStats[type][field].total++;

        if (submission.formData?.[field] && submission.formData[field].toString().trim() !== '') {
          fieldStats[type][field].completed++;
        } else {
          fieldStats[type][field].missing++;
        }
      });
    });

    return fieldStats;
  }, [submissions]);

  // ID Expiration Analysis
  const expirationData = useMemo(() => {
    const expired = [] as KycSubmission[];
    const expiringSoon = [] as KycSubmission[];
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    submissions.forEach(submission => {
      const expiryDate = submission.formData?.idExpiryDate || submission.formData?.expiryDate;
      if (expiryDate) {
        const expiry = new Date(expiryDate);
        if (expiry < today) {
          expired.push(submission);
        } else if (expiry <= thirtyDaysFromNow) {
          expiringSoon.push(submission);
        }
      }
    });

    return { expired, expiringSoon };
  }, [submissions]);

  // Follow-ups Report Data, honouring the tab's own filter controls
  const filteredFollowups = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const needsFollowUp = (submission: KycSubmission) => (
      submission.status === 'needs_info' ||
      submission.kycLifecycle?.expired ||
      submission.kycLifecycle?.isExpired ||
      submission.kycLifecycle?.dueSoon ||
      submission.kycLifecycle?.pendingUpdate
    );

    const matchesLifecycle = (submission: KycSubmission) => {
      switch (lifecycleFilter) {
        case 'needs_info': return submission.status === 'needs_info';
        case 'expired': return Boolean(submission.kycLifecycle?.expired || submission.kycLifecycle?.isExpired);
        case 'due_soon': return Boolean(submission.kycLifecycle?.dueSoon);
        case 'pending_update': return Boolean(submission.kycLifecycle?.pendingUpdate);
        case 'pending_review': return submission.kycLifecycle?.pendingUpdateStatus === 'pending_review';
        default: return true;
      }
    };

    const matchesSearch = (submission: KycSubmission) => {
      if (!search) return true;
      return [
        submission.clientId?.name,
        submission.formData?.firstName,
        submission.formData?.lastName,
        submission.formData?.organizationName,
        submission.formData?.name,
      ].some(value => typeof value === 'string' && value.toLowerCase().includes(search));
    };

    return submissions.filter(submission =>
      needsFollowUp(submission) &&
      (typeFilter === 'all' || submission.type === typeFilter) &&
      matchesLifecycle(submission) &&
      matchesSearch(submission)
    );
  }, [submissions, typeFilter, lifecycleFilter, searchTerm]);

  // Helper: Get follow-up info for a submission
  const getFollowUpInfo = (submission: KycSubmission) => {
    if (submission.status === 'needs_info') {
      return {
        label: 'NEEDS INFO',
        reason: 'Client additional information required',
        requestedAt: submission.updatedAt || submission.submittedAt || null,
        daysPending: Math.floor((new Date().getTime() - new Date(submission.updatedAt || submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)),
        color: { bg: '#fff3cd', fg: '#856404' }
      };
    }
    if (submission.kycLifecycle?.expired) {
      return {
        label: 'EXPIRED',
        reason: 'KYC has expired and requires immediate update',
        requestedAt: submission.kycLifecycle.pendingUpdateRequestedAt || submission.updatedAt || null,
        daysPending: submission.kycLifecycle.pendingUpdateRequestedAt
          ? Math.floor((new Date().getTime() - new Date(submission.kycLifecycle.pendingUpdateRequestedAt as string).getTime()) / (1000 * 60 * 60 * 24))
          : submission.updatedAt
          ? Math.floor((new Date().getTime() - new Date(submission.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        color: { bg: '#f8d7da', fg: '#721c24' }
      };
    }
    if (submission.kycLifecycle?.dueSoon) {
      return {
        label: 'DUE SOON',
        reason: 'KYC review deadline approaching',
        requestedAt: submission.nextReviewDueAt || submission.kycExpiresAt || null,
        daysPending: submission.nextReviewDueAt
          ? Math.floor((new Date(submission.nextReviewDueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : submission.kycExpiresAt
          ? Math.floor((new Date(submission.kycExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null,
        color: { bg: '#d1ecf1', fg: '#0c5460' }
      };
    }
    if (submission.kycLifecycle?.pendingUpdate) {
      return {
        label: 'PENDING UPDATE',
        reason: 'Update requested from client',
        requestedAt: submission.kycLifecycle.pendingUpdateRequestedAt || submission.updatedAt || null,
        daysPending: submission.kycLifecycle.pendingUpdateRequestedAt
          ? Math.floor((new Date().getTime() - new Date(submission.kycLifecycle.pendingUpdateRequestedAt as string).getTime()) / (1000 * 60 * 60 * 24))
          : submission.updatedAt
          ? Math.floor((new Date().getTime() - new Date(submission.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        color: { bg: '#d4edda', fg: '#155724' }
      };
    }
    return {
      label: 'FOLLOW-UP',
      reason: 'Action required',
      requestedAt: null,
      daysPending: null,
      color: { bg: '#e2e3e5', fg: '#383d41' }
    };
  };

  return {
    analyticsData,
    completenessData,
    fieldCompletenessData,
    expirationData,
    filteredFollowups,
    getFollowUpInfo,
  };
}
