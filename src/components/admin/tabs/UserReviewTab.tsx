import React, { useState } from 'react';
import { FloatingInput } from '../../ui/floating-input';
import { FloatingSelect } from '../../ui/floating-select';
import { SelectItem } from '../../ui/select';
import StatCard from '../ui/StatCard';
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

interface UserRecord {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  role?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface UserReviewTabProps {
  users: UserRecord[];
  filteredUsers: UserRecord[];
  paginatedUsers: UserRecord[];
  userSearchTerm: string;
  setUserSearchTerm: (v: string) => void;
  userReviewRoleFilter: string;
  setUserReviewRoleFilter: (v: string) => void;
  userReviewStatusFilter: string;
  setUserReviewStatusFilter: (v: string) => void;
  userReviewItemsPerPage: number;
  handleUserReviewItemsPerPageChange: (n: number) => void;
  availableUserRoles: string[];
  userReviewTotalPages: number;
  safeUserReviewPage: number;
  userReviewStartIndex: number;
  setUserReviewPage: (page: number) => void;
  exportUserReviewToExcel: () => void;
  exportUserReviewToPdf: () => void;
  hasCurrentRole: (role: string) => boolean;
}

const UserReviewTab: React.FC<UserReviewTabProps> = ({
  users,
  filteredUsers,
  paginatedUsers,
  userSearchTerm,
  setUserSearchTerm,
  userReviewRoleFilter,
  setUserReviewRoleFilter,
  userReviewStatusFilter,
  setUserReviewStatusFilter,
  userReviewItemsPerPage,
  handleUserReviewItemsPerPageChange,
  availableUserRoles,
  userReviewTotalPages,
  safeUserReviewPage,
  userReviewStartIndex,
  setUserReviewPage,
  exportUserReviewToExcel,
  exportUserReviewToPdf,
  hasCurrentRole,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div>
      <h3 style={reportHeadingStyle}>User Review</h3>

      {!hasCurrentRole('admin') && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          Access denied. User review is available to admins only.
        </div>
      )}

      {/* Stat Cards */}
      <div style={{
        display: hasCurrentRole('admin') ? 'grid' : 'none',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Active" value={users.filter(u => u.isActive).length} />
        <StatCard label="Admins" value={users.filter(u => ((Array.isArray(u.roles) ? u.roles : [u.role]).filter(Boolean)).includes('admin')).length} />
        <StatCard label="Reset Required" value={users.filter(u => u.mustChangePassword).length} />
      </div>

      {/* Filters and Table */}
      <div style={{
        ...card,
        padding: '24px',
        marginBottom: '20px',
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
            <h4 style={{ ...reportCardHeadingStyle, marginBottom: 0 }}>User Audit Summary</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '260px' }}>
                <FloatingInput
                  label="Search Users"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
              <div style={{ minWidth: '150px' }}>
                <FloatingSelect
                  label="Role"
                  value={userReviewRoleFilter}
                  onValueChange={setUserReviewRoleFilter}
                >
                  <SelectItem value="all">All roles</SelectItem>
                  {availableUserRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </FloatingSelect>
              </div>
              <div style={{ minWidth: '150px' }}>
                <FloatingSelect
                  label="Status"
                  value={userReviewStatusFilter}
                  onValueChange={setUserReviewStatusFilter}
                >
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </FloatingSelect>
              </div>
              <div style={{ minWidth: '140px' }}>
                <FloatingSelect
                  label="Per Page"
                  value={String(userReviewItemsPerPage)}
                  onValueChange={(v) => handleUserReviewItemsPerPageChange(Number(v))}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>
                  ))}
                </FloatingSelect>
              </div>
              <button
                onClick={exportUserReviewToExcel}
                style={{ padding: '9px 18px', backgroundColor: colors.green, color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Export Excel
              </button>
              <button
                onClick={exportUserReviewToPdf}
                style={{ padding: '9px 18px', backgroundColor: 'transparent', color: colors.green, border: `1px solid ${colors.green}`, borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Export PDF
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.tableHeaderBg }}>
                <th style={reportThStyle}>Name</th>
                <th style={reportThStyle}>Username</th>
                <th style={reportThStyle}>Email</th>
                <th style={reportThStyle}>Roles</th>
                <th style={reportThStyle}>Status</th>
                <th style={reportThStyle}>Last Login</th>
                <th style={reportThStyle}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                    {users.length === 0 ? 'No users have been created yet.' : 'No users match the current filters.'}
                  </td>
                </tr>
              ) : paginatedUsers.map((user) => {
                const roles = (Array.isArray(user.roles) && user.roles.length > 0)
                  ? user.roles
                  : (user.role ? [user.role] : []);

                return (
                  <tr key={user._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={reportTdStyle}>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</td>
                    <td style={reportTdStyle}>{user.username}</td>
                    <td style={reportTdStyle}>{user.email}</td>
                    <td style={reportTdStyle}>{roles.length > 0 ? roles.join(', ') : 'N/A'}</td>
                    <td style={reportTdStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        backgroundColor: user.isActive ? '#dff6dd' : '#fde7e9',
                        color: user.isActive ? '#006437' : '#a4262c'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={reportTdStyle}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                    <td style={reportTdStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={safeUserReviewPage}
          totalPages={userReviewTotalPages}
          onPageChange={setUserReviewPage}
          rangeStart={filteredUsers.length === 0 ? 0 : userReviewStartIndex + 1}
          rangeEnd={Math.min(userReviewStartIndex + userReviewItemsPerPage, filteredUsers.length)}
          total={filteredUsers.length}
          unit="users"
        />
      </div>
    </div>
  );
};

export default UserReviewTab;
