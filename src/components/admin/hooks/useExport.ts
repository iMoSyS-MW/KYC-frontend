import * as XLSX from 'xlsx';
import { KycSubmission } from '../../../types/admin';

export function useExport() {
  const escapeHtml = (value: any) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const exportRowsToExcel = (rows: Record<string, any>[], sheetName: string, filePrefix: string) => {
    if (rows.length === 0) {
      return { success: false, message: 'No data available to export.' };
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0] || {});
    worksheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 2, 18) }));
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${filePrefix}_${currentDate}.xlsx`);
    return { success: true, message: 'Export completed successfully.' };
  };

  const exportRowsToPdf = (title: string, headers: string[], rows: string[][]) => {
    if (rows.length === 0) {
      return { success: false, message: 'No data available to export.' };
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      return { success: false, message: 'Please allow pop-ups to export PDF.' };
    }

    const tableHeaderHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
    const tableRowsHtml = rows.map((row) => `
      <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1 { margin-bottom: 6px; }
            p { color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d0d0d0; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
            th { background: #f4f6f8; }
            tr:nth-child(even) { background: #fafafa; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <p>Generated on ${escapeHtml(new Date().toLocaleString())}</p>
          <table>
            <thead><tr>${tableHeaderHtml}</tr></thead>
            <tbody>${tableRowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
    return { success: true, message: 'PDF export opened in new window.' };
  };

  const exportSingleSubmissionToExcel = (submission: KycSubmission) => {
    const baseData: Record<string, any> = {
      'Submission ID': submission._id,
      'Client Name': submission.clientId?.name || 'N/A',
      'Type': submission.type,
      'Status': submission.status,
      'Submitted At': new Date(submission.submittedAt).toLocaleString(),
    };

    if (submission.formData) {
      Object.entries(submission.formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          baseData[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      });
    }

    return exportRowsToExcel([baseData], 'Submission', 'submission');
  };

  const exportToExcel = (filteredSubmissions: KycSubmission[]) => {
    const rows = filteredSubmissions.map(submission => ({
      'ID': submission._id,
      'Client Name': submission.clientId?.name || 'N/A',
      'Type': submission.type,
      'Status': submission.status,
      'Submitted At': new Date(submission.submittedAt).toLocaleString(),
      'Documents': submission.documents?.length || 0,
    }));

    return exportRowsToExcel(rows, 'Submissions', 'submissions');
  };

  const exportUserReviewToExcel = (filteredUsers: any[]) => {
    const rows = filteredUsers.map((user) => {
      const roles = (Array.isArray(user.roles) && user.roles.length > 0)
        ? user.roles
        : (user.role ? [user.role] : []);

      return {
        Name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        Username: user.username,
        Email: user.email,
        Roles: roles.join(', ') || 'N/A',
        'Access Types': Array.isArray(user.accessTypes) && user.accessTypes.length > 0 ? user.accessTypes.join(', ') : 'N/A',
        Status: user.isActive ? 'Active' : 'Inactive',
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'
      };
    });

    return exportRowsToExcel(rows, 'User Review', 'user_review');
  };

  const exportUserReviewToPdf = (filteredUsers: any[]) => {
    const rows = filteredUsers.map((user) => {
      const roles = (Array.isArray(user.roles) && user.roles.length > 0)
        ? user.roles
        : (user.role ? [user.role] : []);

      return [
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        user.username || 'N/A',
        user.email || 'N/A',
        roles.join(', ') || 'N/A',
        user.isActive ? 'Active' : 'Inactive',
        user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'
      ];
    });

    return exportRowsToPdf(
      'User Review Report',
      ['Name', 'Username', 'Email', 'Roles', 'Status', 'Last Login', 'Created At'],
      rows
    );
  };

  const exportUserActivityToExcel = (filteredUserActivityEntries: any[]) => {
    const rows = filteredUserActivityEntries.map((entry) => ({
      When: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'N/A',
      Action: entry.action || 'N/A',
      Actor: entry.actorUserId?.username || entry.actorUserId?.email || 'System',
      Target: entry.targetUserId?.username || entry.targetUserId?.email || '—',
      Description: entry.description || '—',
      'IP Address': entry.ipAddress || '—'
    }));

    return exportRowsToExcel(rows, 'User Activity', 'user_activity');
  };

  const exportUserActivityToPdf = (filteredUserActivityEntries: any[]) => {
    const rows = filteredUserActivityEntries.map((entry) => [
      entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'N/A',
      entry.action || 'N/A',
      entry.actorUserId?.username || entry.actorUserId?.email || 'System',
      entry.targetUserId?.username || entry.targetUserId?.email || '—',
      entry.description || '—',
      entry.ipAddress || '—'
    ]);

    return exportRowsToPdf(
      'User Activity Report',
      ['When', 'Action', 'Actor', 'Target', 'Description', 'IP Address'],
      rows
    );
  };

  return {
    exportRowsToExcel,
    exportRowsToPdf,
    exportSingleSubmissionToExcel,
    exportToExcel,
    exportUserReviewToExcel,
    exportUserReviewToPdf,
    exportUserActivityToExcel,
    exportUserActivityToPdf,
  };
}
