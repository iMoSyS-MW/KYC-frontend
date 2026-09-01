import React, { useState } from 'react';
import { KycSubmission, DashboardStats } from '../../types/admin';
import { card, colors } from './theme';
import StatCard from './ui/StatCard';
import StatusBadge from './ui/StatusBadge';
import Pagination from './ui/Pagination';

const PAGE_SIZE = 10;

interface OverviewTabProps {
  stats: DashboardStats;
  submissions: KycSubmission[];
}

const headerCellStyle: React.CSSProperties = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  color: colors.textPrimary,
  borderBottom: `1px solid ${colors.border}`,
};

const cellStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '14px',
  color: colors.textPrimary,
  borderBottom: `1px solid ${colors.border}`,
};

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, submissions }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = submissions.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 700, color: colors.textPrimary }}>
        Recent Submissions
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard label="Total Submissions" value={stats.total} />
        <StatCard label="Pending Review" value={stats.pending} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Needs Info" value={stats.needsInfo} />
      </div>

      <div style={{ ...card, padding: '24px' }}>
        <h4 style={{ margin: '0 0 18px', fontSize: '18px', color: colors.textPrimary }}>
          Recent Submissions
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.tableHeaderBg }}>
                <th style={headerCellStyle}>Type</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(submission => (
                <tr key={submission._id}>
                  <td style={{ ...cellStyle, textTransform: 'capitalize' }}>{submission.type}</td>
                  <td style={cellStyle}>{submission.clientId?.name || 'N/A'}</td>
                  <td style={cellStyle}>
                    <StatusBadge status={submission.status} />
                  </td>
                  <td style={cellStyle}>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...cellStyle, color: colors.textMuted, textAlign: 'center' }}>
                    No submissions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {submissions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            rangeStart={start + 1}
            rangeEnd={Math.min(start + PAGE_SIZE, submissions.length)}
            total={submissions.length}
            unit="submissions"
          />
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
