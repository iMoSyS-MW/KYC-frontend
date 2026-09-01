import React from 'react';
import { KycSubmission } from '../../../types/admin';
import { FloatingSelect } from '../../ui/floating-select';
import { SelectItem } from '../../ui/select';
import StatCard from '../ui/StatCard';
import {
  reportHeadingStyle,
  reportCardHeadingStyle,
  reportThStyle,
  reportTdStyle,
  card,
  colors,
} from '../theme';

interface FollowUpColor {
  bg: string;
  fg: string;
}

interface FollowUpInfo {
  label: string;
  color: FollowUpColor;
  reason: string | null;
  requestedAt: string | null;
  daysPending: number | null;
}

interface FollowupsTabProps {
  filteredFollowups: KycSubmission[];
  submissions: KycSubmission[];
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  lifecycleFilter: string;
  setLifecycleFilter: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  getFollowUpInfo: (s: KycSubmission) => FollowUpInfo;
  exportToExcel: () => void;
}

const FollowupsTab: React.FC<FollowupsTabProps> = ({
  filteredFollowups,
  submissions,
  typeFilter,
  setTypeFilter,
  lifecycleFilter,
  setLifecycleFilter,
  searchTerm,
  setSearchTerm,
  getFollowUpInfo,
  exportToExcel,
}) => {
  return (
    <div>
      <h3 style={reportHeadingStyle}>Follow-ups Report</h3>
      <p style={{ margin: '0 0 20px', color: colors.textMuted, fontSize: '14px' }}>
        Submissions requiring follow-up action, including those with missing information, expired reviews, or pending updates.
      </p>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <StatCard label="Needs Info" value={submissions.filter(s => s.status === 'needs_info').length} />
        <StatCard label="Expired" value={submissions.filter(s => s.kycLifecycle?.expired).length} />
        <StatCard label="Due Soon" value={submissions.filter(s => s.kycLifecycle?.dueSoon).length} />
        <StatCard label="Pending Update" value={submissions.filter(s => s.kycLifecycle?.pendingUpdate).length} />
      </div>

      {/* Filter Controls */}
      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <FloatingSelect
              label="Follow-up Type"
              value={lifecycleFilter}
              onValueChange={setLifecycleFilter}
            >
              <SelectItem value="all">All Follow-ups</SelectItem>
              <SelectItem value="needs_info">Needs Info</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
              <SelectItem value="pending_update">Pending Update</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
            </FloatingSelect>
          </div>

          <div>
            <FloatingSelect
              label="KYC Type"
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </FloatingSelect>
          </div>

          <div>
            <button
              onClick={() => {
                setLifecycleFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'transparent',
                color: colors.green,
                border: `1px solid ${colors.green}`,
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Clear Filters
            </button>
          </div>

          <div>
            <button
              onClick={exportToExcel}
              disabled={filteredFollowups.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: filteredFollowups.length > 0 ? colors.green : '#c9c9c9',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: filteredFollowups.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Follow-ups Table */}
      <div style={{ ...card, padding: '24px', overflowX: 'auto' }}>
        <h4 style={{ ...reportCardHeadingStyle, marginBottom: '16px' }}>Follow-up Items</h4>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.tableHeaderBg }}>
              <th style={reportThStyle}>Status</th>
              <th style={reportThStyle}>Client</th>
              <th style={reportThStyle}>Type</th>
              <th style={reportThStyle}>Reason</th>
              <th style={reportThStyle}>Days Pending</th>
            </tr>
          </thead>
          <tbody>
            {filteredFollowups.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...reportTdStyle, textAlign: 'center', color: colors.textMuted, padding: '30px' }}>
                  No follow-ups found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredFollowups.map(submission => {
                const info = getFollowUpInfo(submission);
                return (
                  <tr key={submission._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={reportTdStyle}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: info.color.bg,
                        color: info.color.fg
                      }}>
                        {info.label}
                      </span>
                    </td>
                    <td style={{ ...reportTdStyle, fontWeight: 700 }}>
                      {submission.clientId?.name || 'N/A'}
                    </td>
                    <td style={{ ...reportTdStyle, textTransform: 'capitalize' }}>
                      {submission.type}
                    </td>
                    <td style={{ ...reportTdStyle, maxWidth: '300px' }}>
                      {info.reason || 'N/A'}
                    </td>
                    <td style={{ ...reportTdStyle, fontWeight: 700 }}>
                      {info.daysPending !== null ? info.daysPending : 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: colors.greenSoft,
        borderRadius: '10px',
        border: `1px solid ${colors.border}`,
        fontSize: '14px',
        color: colors.greenDark
      }}>
        <strong>Follow-up Types:</strong>
        <ul style={{ margin: '10px 0 0 20px' }}>
          <li><strong>Needs Info:</strong> Submission requires additional information from client</li>
          <li><strong>Expired:</strong> KYC has passed its review date and needs immediate update</li>
          <li><strong>Due Soon:</strong> KYC review date approaching within the alert window</li>
          <li><strong>Pending Update:</strong> Client has submitted an update awaiting review</li>
        </ul>
      </div>
    </div>
  );
};

export default FollowupsTab;
