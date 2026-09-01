import React from 'react';
import { Pencil, KeyRound, Trash2 } from 'lucide-react';
import { FloatingInput } from '../../ui/floating-input';
import {
  reportHeadingStyle,
  reportCardHeadingStyle,
  reportThStyle,
  reportTdStyle,
  accessPillStyle,
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
  accessTypes?: string[];
  isActive: boolean;
  mustChangePassword?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface UserManagementTabProps {
  users: UserRecord[];
  filteredUsers: UserRecord[];
  userSearchTerm: string;
  setUserSearchTerm: (v: string) => void;
  userActionLoading: boolean;
  openUserModal: (user?: UserRecord) => void;
  handleDeleteUser: (id: string) => void;
  handleResetUserPassword: (user: UserRecord) => void;
  isCurrentUserRecord: (user: UserRecord) => boolean;
  hasCurrentRole: (role: string) => boolean;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  filteredUsers,
  userSearchTerm,
  setUserSearchTerm,
  userActionLoading,
  openUserModal,
  handleDeleteUser,
  handleResetUserPassword,
  isCurrentUserRecord,
  hasCurrentRole,
}) => {
  return (
    <div>
      <h3 style={reportHeadingStyle}>User Management</h3>

      {!hasCurrentRole('admin') && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          Access denied. User management is available to admins only.
        </div>
      )}

      <div style={{
        ...card,
        padding: '24px',
        marginBottom: '20px',
        display: hasCurrentRole('admin') ? 'block' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, ...reportCardHeadingStyle, marginBottom: 0 }}>System Users</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '280px' }}>
              <FloatingInput
                label="Search Users"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => openUserModal()}
              disabled={userActionLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: colors.green,
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: userActionLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: userActionLoading ? 0.7 : 1
              }}
            >
              Add New User
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.tableHeaderBg }}>
                <th style={reportThStyle}>Username</th>
                <th style={reportThStyle}>Email</th>
                <th style={reportThStyle}>Role</th>
                <th style={reportThStyle}>KYC Access</th>
                <th style={reportThStyle}>Status</th>
                <th style={reportThStyle}>Last Login</th>
                <th style={reportThStyle}>Created</th>
                <th style={reportThStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                    {users.length === 0 ? 'No users have been created yet.' : 'No users match the current search.'}
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={reportTdStyle}>{user.username}</td>
                  <td style={reportTdStyle}>{user.email}</td>
                  <td style={reportTdStyle}>
                    {(() => {
                      const roles = (Array.isArray(user.roles) && user.roles.length > 0)
                        ? user.roles
                        : (user.role ? [user.role] : []);
                      return roles.length > 0 ? roles.join(', ') : 'N/A';
                    })()}
                  </td>
                  <td style={reportTdStyle}>
                    {user.accessTypes && user.accessTypes.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {user.accessTypes.includes('all') ||
                         (user.accessTypes.includes('individual') &&
                          user.accessTypes.includes('group') &&
                          user.accessTypes.includes('corporate')) ? (
                          <span style={{ ...accessPillStyle, backgroundColor: '#e3f1e8', color: '#006437' }}>
                            Full Access
                          </span>
                        ) : (
                          <>
                            {user.accessTypes.includes('individual') && (
                              <span style={{ ...accessPillStyle, backgroundColor: '#eef0f6', color: '#3b3f7a' }}>
                                Individual
                              </span>
                            )}
                            {user.accessTypes.includes('group') && (
                              <span style={{ ...accessPillStyle, backgroundColor: '#e3f1e8', color: '#1f6b3a' }}>
                                Group
                              </span>
                            )}
                            {user.accessTypes.includes('corporate') && (
                              <span style={{ ...accessPillStyle, backgroundColor: '#fdf0d9', color: '#7a4d00' }}>
                                Corporate
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: colors.textMuted, fontSize: '12px' }}>No Access</span>
                    )}
                  </td>
                  <td style={reportTdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                        color: user.isActive ? '#155724' : '#721c24',
                        width: 'fit-content'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.mustChangePassword && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          width: 'fit-content'
                        }}>
                          Password Reset Required
                        </span>
                      )}
                      {isCurrentUserRecord(user) && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: '#d1ecf1',
                          color: '#0c5460',
                          width: 'fit-content'
                        }}>
                          Current User
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...reportTdStyle, color: colors.textMuted, fontSize: '13px' }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td style={reportTdStyle}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={reportTdStyle}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openUserModal(user)}
                        disabled={userActionLoading}
                        title="Edit user"
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          color: colors.green,
                          border: `1px solid ${colors.green}`,
                          borderRadius: '8px',
                          cursor: userActionLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: userActionLoading ? 0.7 : 1
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleResetUserPassword(user)}
                        disabled={userActionLoading || isCurrentUserRecord(user) || !user.isActive}
                        title={isCurrentUserRecord(user)
                          ? 'Use Change Password for your own account'
                          : (!user.isActive ? 'Reactivate the user before resetting password' : 'Reset password')}
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          color: colors.green,
                          border: `1px solid ${colors.green}`,
                          borderRadius: '8px',
                          cursor: (userActionLoading || isCurrentUserRecord(user) || !user.isActive) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (userActionLoading || isCurrentUserRecord(user) || !user.isActive) ? 0.6 : 1
                        }}
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={userActionLoading || isCurrentUserRecord(user)}
                        title={isCurrentUserRecord(user) ? 'You cannot delete your own account' : 'Delete user'}
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          color: '#c0392b',
                          border: '1px solid #c0392b',
                          borderRadius: '8px',
                          cursor: (userActionLoading || isCurrentUserRecord(user)) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (userActionLoading || isCurrentUserRecord(user)) ? 0.6 : 1
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTab;
