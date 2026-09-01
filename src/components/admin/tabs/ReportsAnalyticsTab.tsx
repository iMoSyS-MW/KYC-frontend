import React from 'react';
import { KycSubmission, DashboardStats } from '../../../types/admin';
import { card, colors, reportHeadingStyle, reportCardHeadingStyle, reportThStyle, reportTdStyle } from '../theme';

interface CompletenessEntry {
  total: number;
  complete: number;
  completenessRate: number;
  avgCompleteness: number;
}

interface FieldStats {
  [field: string]: { total: number; completed: number; missing: number };
}

interface AnalyticsData {
  statusData: { name: string; value: number; color: string }[];
  typeData: { name: string; value: number; color: string }[];
  monthlyData: { month: string; total: number; approved: number; pending: number; rejected: number }[];
  productData: { name: string; value: number }[];
  countryData: { name: string; value: number }[];
  avgProcessingTime: number;
  processingTimes: number[];
}

interface ReportsAnalyticsTabProps {
  completenessData: {
    individual: CompletenessEntry;
    group: CompletenessEntry;
    corporate: CompletenessEntry;
  };
  fieldCompletenessData: {
    individual: FieldStats;
    group: FieldStats;
    corporate: FieldStats;
  };
  analyticsData: AnalyticsData;
  submissions: KycSubmission[];
  stats: DashboardStats;
}

const ReportsAnalyticsTab: React.FC<ReportsAnalyticsTabProps> = ({
  completenessData,
  fieldCompletenessData,
  analyticsData,
  submissions,
  stats,
}) => {
  return (
    <div>
      <h3 style={reportHeadingStyle}>Advanced Analytics &amp; Reports</h3>

      {/* Data Completeness Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {([
          ['Individual KYC', completenessData.individual],
          ['Group KYC', completenessData.group],
          ['Corporate KYC', completenessData.corporate],
        ] as const).map(([label, d]) => (
          <div key={label} style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: colors.textPrimary }}>{label}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: colors.textPrimary, marginTop: '8px' }}>
              {d.completenessRate}%
            </div>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
              {d.complete}/{d.total} fields complete
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics Tables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Data Completeness Analysis */}
        <div style={{ ...card, padding: '24px' }}>
          <h4 style={reportCardHeadingStyle}>Data Completeness Analysis</h4>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {([
              ['Individual KYC', completenessData.individual],
              ['Group KYC', completenessData.group],
              ['Corporate KYC', completenessData.corporate],
            ] as const).map(([label, d]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span><strong>{label}:</strong></span>
                <span>{d.completenessRate}% complete ({d.complete}/{d.total})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Missing Fields */}
        <div style={{ ...card, padding: '24px' }}>
          <h4 style={reportCardHeadingStyle}>Top Missing Fields</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.tableHeaderBg }}>
                <th style={reportThStyle}>Field</th>
                <th style={reportThStyle}>Type</th>
                <th style={reportThStyle}>Missing</th>
                <th style={reportThStyle}>Completion %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fieldCompletenessData.individual)
                .sort(([,a], [,b]) => b.missing - a.missing)
                .slice(0, 5)
                .map(([field, stats]) => (
                  <tr key={field} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={reportTdStyle}>{field}</td>
                    <td style={reportTdStyle}>Individual</td>
                    <td style={{ ...reportTdStyle, color: '#c0392b', fontWeight: 700 }}>{stats.missing}</td>
                    <td style={reportTdStyle}>
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
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

export default ReportsAnalyticsTab;
