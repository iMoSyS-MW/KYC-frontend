import React, { useState, useEffect } from 'react';
import axios from '../api/client';
import { useConfirmationDialog } from '../context/ConfirmationDialogContext';
import OverviewTab from './admin/OverviewTab';
import Sidebar from './Sidebar';
import { colors } from './admin/theme';

// Hooks
import { useAuth } from './admin/hooks/useAuth';
import { useSubmissions } from './admin/hooks/useSubmissions';
import { useUsers } from './admin/hooks/useUsers';
import { useSettings } from './admin/hooks/useSettings';
import { useAnalytics } from './admin/hooks/useAnalytics';
import { useExport } from './admin/hooks/useExport';
import { useUserActivity } from './admin/hooks/useUserActivity';

// Tab Components
import SubmissionsTab from './admin/tabs/SubmissionsTab';
import FollowupsTab from './admin/tabs/FollowupsTab';
import ReportsSubmissionsTab from './admin/tabs/ReportsSubmissionsTab';
import ReportsAnalyticsTab from './admin/tabs/ReportsAnalyticsTab';
import ReportsTurnaroundTab from './admin/tabs/ReportsTurnaroundTab';
import ReportsRenewalTab from './admin/tabs/ReportsRenewalTab';
import FilesTab from './admin/tabs/FilesTab';
import UserReviewTab from './admin/tabs/UserReviewTab';
import UserActivityTab from './admin/tabs/UserActivityTab';
import SettingsTab from './admin/tabs/SettingsTab';
import UserManagementTab from './admin/tabs/UserManagementTab';

// Modal Components
import UserModal from './admin/modals/UserModal';
import PasswordModal from './admin/modals/PasswordModal';
import DocumentPreviewModal from './admin/DocumentPreviewModal';

const AdminDashboard: React.FC = () => {
  const { confirm, notify } = useConfirmationDialog();
  const [activeTab, setActiveTab] = useState('overview');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'expiring'>('all');

  // Auth Hook
  const {
    currentUser,
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
  } = useAuth();

  // Submissions Hook
  const {
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
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentSubmissions,
    loadSubmissions,
    clearSubmissionFilters,
    handlePageChange,
    handleItemsPerPageChange,
    getLifecycleBadges,
  } = useSubmissions(currentUser);

  // Users Hook
  const {
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
  } = useUsers(currentUser, hasCurrentRole);

  // Settings Hook
  const {
    systemSettings,
    settingsLoading,
    settingsSaving,
    settingsMessage,
    loadSystemSettings,
    updateSystemNumberSetting,
    updateSystemPrioritySetting,
    updateDueSoonDays,
    resetSystemSettingsForm,
    saveSystemSettings,
  } = useSettings();

  // Analytics Hook
  const {
    analyticsData,
    completenessData,
    fieldCompletenessData,
    expirationData,
    filteredFollowups,
    getFollowUpInfo,
  } = useAnalytics(submissions, stats, { typeFilter, lifecycleFilter, searchTerm });

  // Export Hook
  const {
    exportRowsToExcel,
    exportSingleSubmissionToExcel,
    exportToExcel,
    exportUserReviewToExcel,
    exportUserReviewToPdf,
    exportUserActivityToExcel,
    exportUserActivityToPdf,
  } = useExport();

  // User Activity Hook
  const {
    userActivityEntries,
    userActivityLoading,
    userActivitySearch,
    setUserActivitySearch,
    userActivityActionFilter,
    setUserActivityActionFilter,
    setUserActivityPage,
    userActivityItemsPerPage,
    filteredUserActivityEntries,
    availableUserActions,
    userActivityTotalPages,
    safeUserActivityPage,
    userActivityStartIndex,
    paginatedUserActivityEntries,
    loadUserActivity,
    handleUserActivityItemsPerPageChange,
  } = useUserActivity();

  // Computed values
  const canChangeSubmissionStatus = hasCurrentRole('admin') || hasCurrentRole('approver');
  const canRequestMoreInfo = hasCurrentRole('admin') || hasCurrentRole('request_info');

  // Helper functions
  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string
  ) => {
    void notify({
      title: title || (type === 'error' ? 'Error' : 'Notice'),
      message,
      confirmLabel: 'OK',
      tone: type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'primary'
    });
  };

  type ActionResult = { success: boolean; message: string };

  const reportResult = (result: ActionResult | void) => {
    if (!result || !result.message || result.message === 'Cancelled') return result;
    showToast(result.success ? 'success' : 'error', result.message);
    return result;
  };

  const withResultToast = <T extends any[]>(action: (...args: T) => Promise<ActionResult>) =>
    async (...args: T) => reportResult(await action(...args));

  const withExportToast = <T extends any[]>(action: (...args: T) => ActionResult) =>
    (...args: T) => {
      const result = action(...args);
      if (!result.success) showToast('warning', result.message);
      return result;
    };

  // Document preview modal state (renders in a blob URL, no token in URL bar)
  const [previewDoc, setPreviewDoc] = useState<{ path: string; name: string } | null>(null);

  const downloadFile = (filePath: string, fileName: string) => {
    setPreviewDoc({ path: filePath, name: fileName });
  };

  const updateSubmissionStatus = async (
    id: string,
    status: string,
    comments?: string,
    nextAction?: string,
    dueDate?: string,
    skipConfirmation?: boolean
  ): Promise<boolean> => {
    if (!skipConfirmation) {
      const confirmed = await confirm({
        title: `Change status to ${status}?`,
        message: 'This will update the submission status immediately.',
        confirmLabel: 'Confirm',
        tone: status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'primary'
      });
      if (!confirmed) return false;
    }

    try {
      await axios.put(`/api/admin/submission/${id}/status`, {
        status,
        comments,
        nextAction,
        dueDate
      });
      await loadSubmissions();
      showToast('success', 'Status updated successfully');
      return true;
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error updating status');
      return false;
    }
  };

  const requestMoreInfo = async () => {
    if (!selectedSubmission || !requestMessage.trim()) {
      showToast('warning', 'Please enter a message', 'Message Required');
      return;
    }

    const confirmed = await confirm({
      title: 'Request more info?',
      message: 'This will notify the client that additional information is required.',
      confirmLabel: 'Send Request',
      tone: 'primary'
    });

    if (!confirmed) return;

    try {
      await axios.post('/api/admin/request', {
        submissionId: selectedSubmission._id,
        message: requestMessage
      });

      await updateSubmissionStatus(selectedSubmission._id, 'needs_info', requestMessage, undefined, undefined, true);
      setRequestMessage('');
      showToast('success', 'Request sent successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Error sending request');
    }
  };

  // Effects
  useEffect(() => {
    checkAuth();
    loadSubmissions();
  }, [checkAuth, loadSubmissions]);

  useEffect(() => {
    const currentRoles = Array.isArray(currentUser?.roles)
      ? currentUser.roles
      : (currentUser?.role ? [currentUser.role] : []);

    if ((activeTab === 'users' || activeTab === 'user-audit-review') && currentRoles.includes('admin')) {
      loadUsers();
    }

    if (activeTab === 'user-audit-activity' && currentRoles.includes('admin')) {
      loadUserActivity();
    }

    if (activeTab === 'settings' && currentRoles.includes('admin')) {
      loadSystemSettings();
    }
  }, [activeTab, currentUser, loadUsers, loadUserActivity, loadSystemSettings]);

  useEffect(() => {
    setUserReviewPage(1);
  }, [userSearchTerm, userReviewRoleFilter, userReviewStatusFilter, users, setUserReviewPage]);

  useEffect(() => {
    setUserActivityPage(1);
  }, [userActivitySearch, userActivityActionFilter, userActivityEntries, setUserActivityPage]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.pageBg }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        currentUser={currentUser}
        onCollapseChange={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        padding: '24px', 
        overflowY: 'auto',
        marginLeft: sidebarCollapsed ? '60px' : '250px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} submissions={filteredSubmissions} />
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            filteredSubmissions={filteredSubmissions}
            currentSubmissions={currentSubmissions}
            selectedSubmission={selectedSubmission}
            setSelectedSubmission={setSelectedSubmission}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            lifecycleFilter={lifecycleFilter}
            setLifecycleFilter={setLifecycleFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            itemsPerPage={itemsPerPage}
            remarks={remarks}
            setRemarks={setRemarks}
            nextAction={nextAction}
            setNextAction={setNextAction}
            dueDate={dueDate}
            setDueDate={setDueDate}
            requestMessage={requestMessage}
            setRequestMessage={setRequestMessage}
            canChangeSubmissionStatus={canChangeSubmissionStatus}
            canRequestMoreInfo={canRequestMoreInfo}
            clearSubmissionFilters={clearSubmissionFilters}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
            getLifecycleBadges={getLifecycleBadges}
            updateSubmissionStatus={updateSubmissionStatus}
            requestMoreInfo={requestMoreInfo}
            exportToExcel={() => withExportToast(exportToExcel)(filteredSubmissions)}
            exportSingleSubmissionToExcel={withExportToast(exportSingleSubmissionToExcel)}
            downloadFile={downloadFile}
          />
        )}

        {/* Follow-ups Tab */}
        {activeTab === 'reports-followups' && (
          <FollowupsTab
            filteredFollowups={filteredFollowups}
            submissions={submissions}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            lifecycleFilter={lifecycleFilter}
            setLifecycleFilter={setLifecycleFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            getFollowUpInfo={getFollowUpInfo}
            exportToExcel={() => withExportToast(exportToExcel)(filteredFollowups)}
          />
        )}

        {/* Reports Submissions Tab */}
        {activeTab === 'reports-submissions' && (
          <ReportsSubmissionsTab
            submissions={submissions}
            filteredSubmissions={filteredSubmissions}
            currentSubmissions={currentSubmissions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            lifecycleFilter={lifecycleFilter}
            setLifecycleFilter={setLifecycleFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
            clearSubmissionFilters={clearSubmissionFilters}
            exportToExcel={() => withExportToast(exportToExcel)(filteredSubmissions)}
            setSelectedSubmission={setSelectedSubmission}
          />
        )}

        {/* Reports Analytics Tab */}
        {activeTab === 'reports-analytics' && (
          <ReportsAnalyticsTab
            completenessData={completenessData}
            fieldCompletenessData={fieldCompletenessData}
            analyticsData={analyticsData}
            submissions={submissions}
            stats={stats}
          />
        )}

        {/* Reports Turnaround Tab */}
        {activeTab === 'reports-turnaround' && (
          <ReportsTurnaroundTab
            analyticsData={analyticsData}
            submissions={submissions}
            exportRowsToExcel={withExportToast(exportRowsToExcel)}
          />
        )}

        {/* Reports Renewal Tab */}
        {activeTab === 'reports-renewal' && (
          <ReportsRenewalTab
            expirationData={expirationData}
            expiryFilter={expiryFilter}
            setExpiryFilter={setExpiryFilter}
            submissions={submissions}
          />
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <FilesTab
            submissions={submissions}
            downloadFile={downloadFile}
          />
        )}

        {/* User Review Tab */}
        {activeTab === 'user-audit-review' && (
          <UserReviewTab
            users={users}
            filteredUsers={filteredUsers}
            paginatedUsers={paginatedUsers}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userReviewRoleFilter={userReviewRoleFilter}
            setUserReviewRoleFilter={setUserReviewRoleFilter}
            userReviewStatusFilter={userReviewStatusFilter}
            setUserReviewStatusFilter={setUserReviewStatusFilter}
            userReviewItemsPerPage={userReviewItemsPerPage}
            handleUserReviewItemsPerPageChange={handleUserReviewItemsPerPageChange}
            availableUserRoles={availableUserRoles}
            userReviewTotalPages={userReviewTotalPages}
            safeUserReviewPage={safeUserReviewPage}
            userReviewStartIndex={userReviewStartIndex}
            setUserReviewPage={setUserReviewPage}
            exportUserReviewToExcel={() => withExportToast(exportUserReviewToExcel)(filteredUsers)}
            exportUserReviewToPdf={() => withExportToast(exportUserReviewToPdf)(filteredUsers)}
            hasCurrentRole={hasCurrentRole}
          />
        )}

        {/* User Activity Tab */}
        {activeTab === 'user-audit-activity' && (
          <UserActivityTab
            userActivityEntries={userActivityEntries}
            filteredUserActivityEntries={filteredUserActivityEntries}
            paginatedUserActivityEntries={paginatedUserActivityEntries}
            userActivityLoading={userActivityLoading}
            userActivitySearch={userActivitySearch}
            setUserActivitySearch={setUserActivitySearch}
            userActivityActionFilter={userActivityActionFilter}
            setUserActivityActionFilter={setUserActivityActionFilter}
            userActivityItemsPerPage={userActivityItemsPerPage}
            handleUserActivityItemsPerPageChange={handleUserActivityItemsPerPageChange}
            availableUserActions={availableUserActions}
            userActivityTotalPages={userActivityTotalPages}
            safeUserActivityPage={safeUserActivityPage}
            userActivityStartIndex={userActivityStartIndex}
            setUserActivityPage={setUserActivityPage}
            exportUserActivityToExcel={() => withExportToast(exportUserActivityToExcel)(filteredUserActivityEntries)}
            exportUserActivityToPdf={() => withExportToast(exportUserActivityToPdf)(filteredUserActivityEntries)}
            loadUserActivity={loadUserActivity}
            hasCurrentRole={hasCurrentRole}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab
            systemSettings={systemSettings}
            settingsLoading={settingsLoading}
            settingsSaving={settingsSaving}
            settingsMessage={settingsMessage}
            updateSystemNumberSetting={updateSystemNumberSetting}
            updateSystemPrioritySetting={updateSystemPrioritySetting}
            updateDueSoonDays={updateDueSoonDays}
            resetSystemSettingsForm={resetSystemSettingsForm}
            saveSystemSettings={withResultToast(saveSystemSettings)}
            loadSystemSettings={loadSystemSettings}
            hasCurrentRole={hasCurrentRole}
          />
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            filteredUsers={filteredUsers}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userActionLoading={userActionLoading}
            openUserModal={openUserModal}
            handleDeleteUser={withResultToast(handleDeleteUser)}
            handleResetUserPassword={withResultToast(handleResetUserPassword)}
            isCurrentUserRecord={isCurrentUserRecord}
            hasCurrentRole={hasCurrentRole}
          />
        )}
      </div>

      {/* Modals */}
      <UserModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        editingUser={editingUser}
        userForm={userForm}
        setUserForm={setUserForm}
        onSave={withResultToast(editingUser ? handleUpdateUser : handleCreateUser)}
        loading={userActionLoading}
      />

      <PasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        onSave={handlePasswordChange}
        loading={passwordLoading}
        message={passwordMessage}
      />

      {previewDoc && (
        <DocumentPreviewModal
          path={previewDoc.path}
          name={previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
