import React from 'react';
import { KycSubmission } from '../../../types/admin';
import StatCard from '../ui/StatCard';
import { card, colors, reportHeadingStyle, reportThStyle, reportTdStyle } from '../theme';

interface ExpirationData {
  expired: KycSubmission[];
  expiringSoon: KycSubmission[];
}

interface ReportsRenewalTabProps {
  expirationData: ExpirationData;
  expiryFilter: string;
  setExpiryFilter: (filter: 'all' | 'expired' | 'expiring') => void;
  submissions: KycSubmission[];
}

const ReportsRenewalTab: React.FC<ReportsRenewalTabProps> = ({
  expirationData,
  expiryFilter,
  setExpiryFilter,
  submissions,
}) => {
  const { expired, expiringSoon } = expirationData;
  const totalAction = expired.length + expiringSoon.length;

  const getDaysUntilExpiry = (submission: KycSubmission): number | null => {
    const expiryDate = submission.formData?.idExpiryDate || submission.formData?.expiryDate;
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getFilteredSubmissions = (): KycSubmission[] => {
    if (expiryFilter === 'expired') return expired;
    if (expiryFilter === 'expiring') return expiringSoon;
    return [...expired, ...expiringSoon];
  };

  const filtered = getFilteredSubmissions();

  return (
    <div>
      <h3 style={reportHeadingStyle}>KYC Renewal / Expiry Report</h3>
      <p style={{ margin: '-12px 0 20px', color: colors.textMuted, fontSize: '14px' }}>
        Track KYC submissions that are expired or expiring soon (within 30 days)
      </p>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <StatCard label="Expired" value={expired.length} />
        <StatCard label="Expiring Soon (≤30 days)" value={expiringSoon.length} />
        <StatCard label="Total Requiring Action" value={totalAction} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {([
          ['all', `All (${totalAction})`],
          ['expired', `Expired (${expired.length})`],
          ['expiring', `Expiring Soon (${expiringSoon.length})`],
        ] as const).map(([key, label]) => {
          const active = expiryFilter === key;
          return (
            <button
              key={key}
              onClick={() => setExpiryFilter(key)}
              style={{
                padding: '8px 18px',
                backgroundColor: active ? colors.green : 'transparent',
                color: active ? 'white' : colors.green,
                border: `1px solid ${colors.green}`,
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Expiry Table */}
      <div style={{ ...card, padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.tableHeaderBg }}>
              <th style={reportThStyle}>Client</th>
              <th style={reportThStyle}>Type</th>
              <th style={reportThStyle}>Status</th>
              <th style={reportThStyle}>Expiry Date</th>
              <th style={reportThStyle}>Days Until Expiry</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                  No submissions found.
                </td>
              </tr>
            ) : (
              filtered.map(submission => {
                const days = getDaysUntilExpiry(submission);
                const isExpired = days === null || days < 0;
                const expiryDate = submission.formData?.idExpiryDate || submission.formData?.expiryDate;

                return (
                  <tr key={submission._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ ...reportTdStyle, fontWeight: 700 }}>
                      {submission.clientId?.name || 'N/A'}
                    </td>
                    <td style={{ ...reportTdStyle, textTransform: 'capitalize' }}>
                      {submission.type}
                    </td>
                    <td style={reportTdStyle}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: isExpired ? '#f8d7da' : '#fff3cd',
                        color: isExpired ? '#721c24' : '#856404'
                      }}>
                        {isExpired ? 'Expired' : 'Expiring Soon'}
                      </span>
                    </td>
                    <td style={reportTdStyle}>
                      {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{
                      ...reportTdStyle,
                      fontWeight: 700,
                      color: isExpired ? '#c0392b' : days !== null && days <= 30 ? '#b7791f' : '#019819'
                    }}>
                      {days !== null ? (isExpired ? `${Math.abs(days)} days ago` : `${days} days`) : 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsRenewalTab;
