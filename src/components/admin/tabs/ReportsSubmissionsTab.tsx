import React from 'react';
import { KycSubmission } from '../../../types/admin';
import SubmissionFilters from '../SubmissionFilters';
import StatusBadge from '../ui/StatusBadge';
import Pagination from '../ui/Pagination';
import { card, colors, reportHeadingStyle, reportThStyle, reportTdStyle } from '../theme';

interface ReportsSubmissionsTabProps {
  submissions: KycSubmission[];
  filteredSubmissions: KycSubmission[];
  currentSubmissions: KycSubmission[];
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
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (n: number) => void;
  clearSubmissionFilters: () => void;
  exportToExcel: () => void;
  setSelectedSubmission: (s: KycSubmission | null) => void;
}

const ReportsSubmissionsTab: React.FC<ReportsSubmissionsTabProps> = ({
  submissions,
  filteredSubmissions,
  currentSubmissions,
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
  handlePageChange,
  handleItemsPerPageChange,
  clearSubmissionFilters,
  exportToExcel,
  setSelectedSubmission,
}) => {
  return (
    <div>
      <h3 style={reportHeadingStyle}>Submissions Report</h3>

      {/* Filter Controls */}
      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
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
          exportDisabled={filteredSubmissions.length === 0}
        />

        {/* Results Summary */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: colors.tableHeaderBg,
          borderRadius: '8px',
          fontSize: '14px',
          color: colors.textPrimary
        }}>
          <div>
            Showing {filteredSubmissions.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '14px' }}>Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{ ...card, padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.tableHeaderBg }}>
              <th style={reportThStyle}>ID</th>
              <th style={reportThStyle}>Client Name</th>
              <th style={reportThStyle}>Type</th>
              <th style={reportThStyle}>Status</th>
              <th style={reportThStyle}>Submitted Date</th>
              <th style={reportThStyle}>Documents</th>
              <th style={reportThStyle}>Completeness</th>
              <th style={reportThStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSubmissions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                  No submissions found.
                </td>
              </tr>
            ) : (
              currentSubmissions.map(submission => (
                <tr key={submission._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ ...reportTdStyle, fontSize: '12px', color: colors.textMuted }}>
                    {submission._id.substring(0, 8)}...
                  </td>
                  <td style={{ ...reportTdStyle, fontWeight: 700 }}>
                    {submission.clientId?.name || 'N/A'}
                  </td>
                  <td style={{ ...reportTdStyle, textTransform: 'capitalize' }}>
                    {submission.type}
                  </td>
                  <td style={reportTdStyle}>
                    <StatusBadge status={submission.status} />
                  </td>
                  <td style={reportTdStyle}>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={{ ...reportTdStyle, textAlign: 'center' }}>
                    {submission.documents?.length || 0}
                  </td>
                  <td style={reportTdStyle}>
                    {(() => {
                      let required = 0, completed = 0;
                      if (submission.type === 'individual') {
                        required = 6; completed = ['firstName','lastName','email','phone','idType','idNumber']
                          .filter(f => submission.formData?.[f]).length;
                      } else if (submission.type === 'group') {
                        required = 3; completed = ['name','foundingDocument','sourceOfFunds']
                          .filter(f => submission.formData?.[f]).length;
                      } else if (submission.type === 'corporate') {
                        required = 6; completed = ['organizationName','contactPersonName','phone','email','identificationDocument','sourceOfFunds']
                          .filter(f => submission.formData?.[f]).length;
                      }
                      const pct = required > 0 ? Math.round((completed/required)*100) : 0;
                      return (
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ fontWeight: 700, color: pct >= 80 ? '#019819' : pct >= 50 ? '#b7791f' : '#c0392b' }}>
                            {pct}%
                          </div>
                          <div style={{ color: colors.textMuted }}>{completed}/{required} fields</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={reportTdStyle}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(submission);
                      }}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: colors.green,
                        color: 'white',
                        border: 'none',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSubmissions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            rangeStart={startIndex + 1}
            rangeEnd={Math.min(endIndex, filteredSubmissions.length)}
            total={filteredSubmissions.length}
            unit="submissions"
          />
        </div>
      )}
    </div>
  );
};

export default ReportsSubmissionsTab;
