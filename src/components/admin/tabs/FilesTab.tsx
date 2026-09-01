import React from 'react';
import { KycSubmission } from '../../../types/admin';
import StatCard from '../ui/StatCard';
import { card, colors, reportHeadingStyle, reportCardHeadingStyle, reportThStyle, reportTdStyle } from '../theme';

interface FilesTabProps {
  submissions: KycSubmission[];
  downloadFile: (path: string, name: string) => void;
}

const FilesTab: React.FC<FilesTabProps> = ({ submissions, downloadFile }) => {
  const allDocuments = submissions.flatMap(sub => 
    (sub.documents || []).map(doc => ({
      ...doc,
      submissionId: sub._id,
      clientName: sub.clientId?.name || 'N/A',
      submissionType: sub.type,
      submittedAt: sub.submittedAt,
    }))
  );

  const totalFiles = allDocuments.length;
  const estimatedStorage = Math.round(totalFiles * 2.5);

  return (
    <div>
      <h3 style={reportHeadingStyle}>File Management</h3>

      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
        <h4 style={reportCardHeadingStyle}>Document Storage</h4>
        <p style={{ margin: '0 0 20px', color: colors.textMuted, fontSize: '14px' }}>
          Manage uploaded KYC documents
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <StatCard label="Total Files" value={totalFiles} />
          <StatCard label="Estimated Storage" value={`~${estimatedStorage} MB`} />
          <StatCard label="Submissions with Docs" value={submissions.filter(s => s.documents && s.documents.length > 0).length} />
          <StatCard label="Avg Docs per Submission" value={submissions.length > 0 ? Math.round(totalFiles / submissions.length * 10) / 10 : 0} />
        </div>
      </div>

      {/* Documents Table */}
      <div style={{ ...card, padding: '24px', overflowX: 'auto' }}>
        <h4 style={reportCardHeadingStyle}>All Uploaded Documents</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.tableHeaderBg }}>
              <th style={reportThStyle}>File Name</th>
              <th style={reportThStyle}>Client</th>
              <th style={reportThStyle}>Type</th>
              <th style={reportThStyle}>Submitted</th>
              <th style={reportThStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allDocuments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '18px 12px', textAlign: 'center', color: '#6c757d' }}>
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              allDocuments.map((doc, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={reportTdStyle}>
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                  </td>
                  <td style={reportTdStyle}>{doc.clientName}</td>
                  <td style={{ ...reportTdStyle, textTransform: 'capitalize' }}>{doc.submissionType}</td>
                  <td style={reportTdStyle}>
                    {new Date(doc.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={reportTdStyle}>
                    <button
                      onClick={() => downloadFile(doc.path, doc.name)}
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
                      Preview
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FilesTab;
