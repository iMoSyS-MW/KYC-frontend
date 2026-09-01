import React from 'react';
import { KycSubmission } from '../../../types/admin';
import StatCard from '../ui/StatCard';
import { card, colors, reportHeadingStyle, reportCardHeadingStyle } from '../theme';

interface AnalyticsData {
  statusData: { name: string; value: number; color: string }[];
  typeData: { name: string; value: number; color: string }[];
  monthlyData: { month: string; total: number; approved: number; pending: number; rejected: number }[];
  productData: { name: string; value: number }[];
  countryData: { name: string; value: number }[];
  avgProcessingTime: number;
  processingTimes: number[];
}

interface ReportsTurnaroundTabProps {
  analyticsData: AnalyticsData;
  submissions: KycSubmission[];
  exportRowsToExcel: (rows: Record<string, any>[], sheetName: string, filePrefix: string) => void;
}

const ReportsTurnaroundTab: React.FC<ReportsTurnaroundTabProps> = ({
  analyticsData,
  submissions,
  exportRowsToExcel,
}) => {
  const completedSubmissions = submissions.filter(
    s => s.status === 'approved' || s.status === 'rejected'
  );

  const processingTimes = analyticsData.processingTimes;
  const avgTime = analyticsData.avgProcessingTime;
  const fastest = processingTimes.length > 0 ? Math.min(...processingTimes) : 0;
  const slowest = processingTimes.length > 0 ? Math.max(...processingTimes) : 0;

  const getDistribution = () => {
    const buckets = [
      { label: '1-3 days', min: 1, max: 3, count: 0 },
      { label: '4-7 days', min: 4, max: 7, count: 0 },
      { label: '8-14 days', min: 8, max: 14, count: 0 },
      { label: '15+ days', min: 15, max: Infinity, count: 0 },
    ];

    processingTimes.forEach(days => {
      const bucket = buckets.find(b => days >= b.min && days <= b.max);
      if (bucket) bucket.count++;
    });

    return buckets;
  };

  const distribution = getDistribution();
  const maxCount = Math.max(...distribution.map(b => b.count), 1);

  const handleExport = () => {
    const rows = completedSubmissions.map(s => {
      const submitted = new Date(s.submittedAt);
      const resolved = new Date(s.updatedAt);
      const days = Math.round((resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ID: s._id,
        Client: s.clientId?.name || 'N/A',
        Type: s.type,
        Status: s.status,
        Submitted: submitted.toLocaleDateString(),
        Resolved: resolved.toLocaleDateString(),
        'Processing Days': days,
      };
    });
    exportRowsToExcel(rows, 'Turnaround Times', 'turnaround-times');
  };

  return (
    <div>
      <h3 style={reportHeadingStyle}>Turnaround Time Report</h3>
      <p style={{ margin: '-12px 0 20px', color: colors.textMuted, fontSize: '14px' }}>
        Analysis of processing times for completed KYC submissions (approved or rejected)
      </p>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <StatCard label="Completed Submissions" value={processingTimes.length} />
        <StatCard label="Average Processing Time" value={`${avgTime} days`} />
        <StatCard
          label="Fastest Processing"
          value={`${fastest} days`}
        />
        <StatCard
          label="Slowest Processing"
          value={`${slowest} days`}
        />
      </div>

      {/* Processing Time Distribution */}
      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
        <h4 style={reportCardHeadingStyle}>Processing Time Distribution</h4>
        {processingTimes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {distribution.map(bucket => (
              <div key={bucket.label} style={{
                backgroundColor: colors.tableHeaderBg,
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: bucket.count > 0 ? colors.green : '#c9c9c9' }}>
                  {bucket.count}
                </div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '5px' }}>
                  {bucket.label}
                </div>
                {maxCount > 0 && (
                  <div style={{
                    marginTop: '8px',
                    height: '8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(bucket.count / maxCount) * 100}%`,
                      height: '100%',
                      backgroundColor: colors.green,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: colors.textMuted, padding: '40px' }}>
            No processing time data available. Submissions must be approved or rejected to calculate turnaround.
          </p>
        )}
      </div>

      {/* Export Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleExport}
          disabled={completedSubmissions.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: completedSubmissions.length > 0 ? colors.green : '#c9c9c9',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: completedSubmissions.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Export to Excel
        </button>
      </div>

      {/* Help Text */}
      <div style={{
        padding: '15px',
        backgroundColor: colors.greenSoft,
        borderRadius: '10px',
        border: `1px solid ${colors.border}`,
        fontSize: '14px',
        color: colors.greenDark
      }}>
        <strong>Note:</strong> Processing time is calculated from submission date to the date when the status was changed to "Approved" or "Rejected".
        The simulated data shown in the analytics overview is for demonstration. This report uses actual timestamps from the submissions.
      </div>
    </div>
  );
};

export default ReportsTurnaroundTab;
