import React, { useState } from 'react';
import { KycSubmission } from '../../../types/admin';
import SubmissionFilters from '../SubmissionFilters';
import SubmissionDetailPanel from '../SubmissionDetailPanel';
import StatusBadge from '../ui/StatusBadge';
import Pagination from '../ui/Pagination';
import { ChevronDown, Filter } from 'lucide-react';
import { colors } from '../theme';

interface SubmissionsTabProps {
  submissions: KycSubmission[];
  filteredSubmissions: KycSubmission[];
  currentSubmissions: KycSubmission[];
  selectedSubmission: KycSubmission | null;
  setSelectedSubmission: (s: KycSubmission | null) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  lifecycleFilter: string;
  setLifecycleFilter: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  remarks: string;
  setRemarks: (v: string) => void;
  nextAction: string;
  setNextAction: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  requestMessage: string;
  setRequestMessage: (v: string) => void;
  canChangeSubmissionStatus: boolean;
  canRequestMoreInfo: boolean;
  clearSubmissionFilters: () => void;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (n: number) => void;
  getLifecycleBadges: (s: KycSubmission) => Array<{ text: string; bg: string; color: string }>;
  updateSubmissionStatus: (id: string, status: string, comments?: string, nextAction?: string, dueDate?: string, skipConfirmation?: boolean) => Promise<boolean>;
  requestMoreInfo: () => Promise<void>;
  exportToExcel: () => void;
  exportSingleSubmissionToExcel: (s: KycSubmission) => void;
  downloadFile: (path: string, name: string) => void;
}

const SubmissionsTab: React.FC<SubmissionsTabProps> = (props) => {
  const {
    filteredSubmissions,
    currentSubmissions,
    selectedSubmission,
    setSelectedSubmission,
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
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    remarks,
    setRemarks,
    nextAction,
    setNextAction,
    dueDate,
    setDueDate,
    requestMessage,
    setRequestMessage,
    canChangeSubmissionStatus,
    canRequestMoreInfo,
    clearSubmissionFilters,
    handlePageChange,
    handleItemsPerPageChange,
    getLifecycleBadges,
    updateSubmissionStatus,
    requestMoreInfo,
    exportToExcel,
    exportSingleSubmissionToExcel,
    downloadFile,
  } = props;

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Exclude approved from the review tab only (reports show all)
  const reviewFiltered = filteredSubmissions.filter(s => s.status !== 'approved');
  const reviewTotalPages = Math.max(1, Math.ceil(reviewFiltered.length / itemsPerPage));
  const reviewStartIndex = (currentPage - 1) * itemsPerPage;
  const reviewEndIndex = reviewStartIndex + itemsPerPage;
  const reviewCurrent = reviewFiltered.slice(reviewStartIndex, reviewEndIndex);

  // Clamp page if approved removals caused the current page to go out of bounds
  React.useEffect(() => {
    if (currentPage > reviewTotalPages) {
      handlePageChange(reviewTotalPages);
    }
  }, [currentPage, reviewTotalPages, handlePageChange]);

  return (
    <div>
      <h3 style={{ margin: '0 0 20px', fontSize: '20px', color: '#1a1a1a' }}>KYC Submissions</h3>

      {/* Search and Filter Controls */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: filtersOpen ? '16px' : 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '16px', color: colors.textPrimary }}>
            <Filter className="w-4 h-4" />
            Filters
          </span>
          <ChevronDown
            className="w-5 h-5 text-gray-500"
            style={{
              transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {filtersOpen && (
          <SubmissionFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            lifecycleFilter={lifecycleFilter}
            onLifecycleFilterChange={setLifecycleFilter}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            onClearFilters={clearSubmissionFilters}
            onExport={exportToExcel}
            exportDisabled={reviewFiltered.length === 0}
          />
        )}

        {/* Results Summary and Items Per Page
        <div style={{
          marginTop: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div>
            Showing {filteredSubmissions.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '14px' }}>Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-om-green focus:ring-2 focus:ring-om-green/30 focus:ring-offset-0"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div> */}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Submissions List */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {reviewCurrent.map(submission => (
            <div
              key={submission._id}
              onClick={() => setSelectedSubmission(submission)}
              style={{
                padding: '15px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer',
                backgroundColor: selectedSubmission?._id === submission._id ? '#f8f9fa' : 'white'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{submission.clientId?.name || 'N/A'}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {submission.type} • {new Date(submission.submittedAt).toLocaleDateString()}
              </div>
              <div style={{ marginTop: '6px' }}>
                <StatusBadge status={submission.status} />
              </div>
              {getLifecycleBadges(submission).length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {getLifecycleBadges(submission).map((badge) => (
                    <span
                      key={badge.text}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        fontWeight: 600
                      }}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          {reviewFiltered.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={reviewTotalPages}
              onPageChange={handlePageChange}
              rangeStart={reviewStartIndex + 1}
              rangeEnd={Math.min(reviewEndIndex, reviewFiltered.length)}
              total={reviewFiltered.length}
              unit="submissions"
            />
          )}
        </div>

        {/* Submission Details */}
        <SubmissionDetailPanel
          selectedSubmission={selectedSubmission}
          canChangeSubmissionStatus={canChangeSubmissionStatus}
          canRequestMoreInfo={canRequestMoreInfo}
          remarks={remarks}
          setRemarks={setRemarks}
          nextAction={nextAction}
          setNextAction={setNextAction}
          dueDate={dueDate}
          setDueDate={setDueDate}
          requestMessage={requestMessage}
          setRequestMessage={setRequestMessage}
          updateSubmissionStatus={updateSubmissionStatus}
          requestMoreInfo={requestMoreInfo}
          exportSingleSubmissionToExcel={exportSingleSubmissionToExcel}
          downloadFile={downloadFile}
          getLifecycleBadges={getLifecycleBadges}
        />
      </div>
    </div>
  );
};

export default SubmissionsTab;
