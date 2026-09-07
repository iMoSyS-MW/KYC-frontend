import React, { useState } from 'react';
import { FloatingInput } from '../../ui/floating-input';
import { FloatingSelect } from '../../ui/floating-select';
import { SelectItem } from '../../ui/select';
import Pagination from '../ui/Pagination';
import { ChevronDown, Filter } from 'lucide-react';
import {
  reportHeadingStyle,
  reportCardHeadingStyle,
  reportThStyle,
  reportTdStyle,
  card,
  colors,
} from '../theme';

interface ActivityEntry {
  _id?: string;
  action?: string;
  actorUserId?: { username?: string; email?: string };
  targetUserId?: { username?: string; email?: string };
  description?: string;
  ipAddress?: string;
  createdAt?: string;
}

interface UserActivityTabProps {
  userActivityEntries: ActivityEntry[];
  filteredUserActivityEntries: ActivityEntry[];
  paginatedUserActivityEntries: ActivityEntry[];
  userActivityLoading: boolean;
  userActivitySearch: string;
  setUserActivitySearch: (v: string) => void;
  userActivityActionFilter: string;
  setUserActivityActionFilter: (v: string) => void;
  userActivityItemsPerPage: number;
  handleUserActivityItemsPerPageChange: (n: number) => void;
  availableUserActions: string[];
  userActivityTotalPages: number;
  safeUserActivityPage: number;
  userActivityStartIndex: number;
  setUserActivityPage: (page: number) => void;
  exportUserActivityToExcel: () => void;
  exportUserActivityToPdf: () => void;
  loadUserActivity: () => void;
  hasCurrentRole: (role: string) => boolean;
}

const UserActivityTab: React.FC<UserActivityTabProps> = ({
  userActivityEntries,
  filteredUserActivityEntries,
  paginatedUserActivityEntries,
  userActivityLoading,
  userActivitySearch,
  setUserActivitySearch,
  userActivityActionFilter,
  setUserActivityActionFilter,
  userActivityItemsPerPage,
  handleUserActivityItemsPerPageChange,
  availableUserActions,
  userActivityTotalPages,
  safeUserActivityPage,
  userActivityStartIndex,
  setUserActivityPage,
  exportUserActivityToExcel,
  exportUserActivityToPdf,
  loadUserActivity,
  hasCurrentRole,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div>
      <h3 style={reportHeadingStyle}>User Activity</h3>

      {!hasCurrentRole('admin') && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          Access denied. User activity is available to admins only.
        </div>
      )}

      <div style={{
        ...card,
        padding: '24px',
        display: hasCurrentRole('admin') ? 'block' : 'none'
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <h4 style={{ ...reportCardHeadingStyle, marginBottom: 0 }}>Recent User Actions</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '240px' }}>
                <FloatingInput
                  label="Search Activity"
                  value={userActivitySearch}
                  onChange={(e) => setUserActivitySearch(e.target.value)}
                />
              </div>
              <div style={{ minWidth: '160px' }}>
                <FloatingSelect
                  label="Action"
                  value={userActivityActionFilter}
                  onValueChange={setUserActivityActionFilter}
                >
                  <SelectItem value="all">All actions</SelectItem>
                  {availableUserActions.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </FloatingSelect>
              </div>
              <div style={{ minWidth: '140px' }}>
                <FloatingSelect
                  label="Per Page"
                  value={String(userActivityItemsPerPage)}
                  onValueChange={(v) => handleUserActivityItemsPerPageChange(Number(v))}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>
                  ))}
                </FloatingSelect>
              </div>
              <button
                onClick={exportUserActivityToExcel}
                style={{ padding: '9px 18px', backgroundColor: colors.green, color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Export Excel
              </button>
              <button
                onClick={exportUserActivityToPdf}
                style={{ padding: '9px 18px', backgroundColor: 'transparent', color: colors.green, border: `1px solid ${colors.green}`, borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Export PDF
              </button>
              <button
                onClick={loadUserActivity}
                disabled={userActivityLoading}
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'transparent',
                  color: colors.green,
                  border: `1px solid ${colors.green}`,
                  borderRadius: '999px',
                  cursor: userActivityLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  opacity: userActivityLoading ? 0.7 : 1
                }}
              >
                {userActivityLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.tableHeaderBg }}>
                <th style={reportThStyle}>When</th>
                <th style={reportThStyle}>Action</th>
                <th style={reportThStyle}>Actor</th>
                <th style={reportThStyle}>Target</th>
                <th style={reportThStyle}>Description</th>
                <th style={reportThStyle}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {userActivityLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                    Loading user activity...
                  </td>
                </tr>
              ) : filteredUserActivityEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                    {userActivityEntries.length === 0 ? 'No user activity has been logged yet.' : 'No activity matches the current filters.'}
                  </td>
                </tr>
              ) : paginatedUserActivityEntries.map((entry, i) => (
                <tr key={entry._id || i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ ...reportTdStyle, whiteSpace: 'nowrap' }}>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'N/A'}</td>
                  <td style={reportTdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#e3f1e8',
                      color: '#006437'
                    }}>
                      {String(entry.action || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={reportTdStyle}>{entry.actorUserId?.username || entry.actorUserId?.email || 'System'}</td>
                  <td style={reportTdStyle}>{entry.targetUserId?.username || entry.targetUserId?.email || '\u2014'}</td>
                  <td style={reportTdStyle}>{entry.description || '\u2014'}</td>
                  <td style={reportTdStyle}>{entry.ipAddress || '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={safeUserActivityPage}
          totalPages={userActivityTotalPages}
          onPageChange={setUserActivityPage}
          rangeStart={filteredUserActivityEntries.length === 0 ? 0 : userActivityStartIndex + 1}
          rangeEnd={Math.min(userActivityStartIndex + userActivityItemsPerPage, filteredUserActivityEntries.length)}
          total={filteredUserActivityEntries.length}
          unit="activities"
        />
      </div>
    </div>
  );
};

export default UserActivityTab;
