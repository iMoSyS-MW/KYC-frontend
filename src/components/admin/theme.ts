/**
 * Shared visual tokens for the admin screens, so cards, tables and badges stay
 * consistent across tabs instead of each block carrying its own hex values.
 * Greens follow the Old Mutual palette already defined in App.tsx's MUI theme.
 */
import type { CSSProperties } from 'react';

export const colors = {
  green: '#006437',
  greenDark: '#00331b',
  greenSoft: '#e3f1e8',
  pageBg: '#e8e8e8',
  cardBg: '#ffffff',
  border: '#e4e4e4',
  tableHeaderBg: '#f1f1f1',
  textPrimary: '#1a1a1a',
  textMuted: '#6b6b6b',
};

export const statusColors: Record<string, { bg: string; color: string }> = {
  approved: { bg: '#d4edda', color: '#155724' },
  rejected: { bg: '#f8d7da', color: '#721c24' },
  needs_info: { bg: '#d1ecf1', color: '#0c5460' },
  under_review: { bg: '#e2e3f0', color: '#3b3f7a' },
  escalated: { bg: '#ffe0b2', color: '#7a3d00' },
  pending: { bg: '#fff3cd', color: '#856404' },
};

export function statusStyle(status: string) {
  return statusColors[status] ?? statusColors.pending;
}

export const card: CSSProperties = {
  backgroundColor: colors.cardBg,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

// Shared styles for report/audit screens
export const reportHeadingStyle: CSSProperties = {
  margin: '0 0 20px',
  fontSize: '20px',
  color: '#1a1a1a',
};

export const reportCardHeadingStyle: CSSProperties = {
  margin: '0 0 16px',
  fontSize: '17px',
  color: '#1a1a1a',
};

export const reportThStyle: CSSProperties = {
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  color: '#1a1a1a',
  borderBottom: '1px solid #e4e4e4',
};

export const reportTdStyle: CSSProperties = {
  padding: '12px 14px',
  fontSize: '14px',
  color: '#1a1a1a',
};

export const accessPillStyle: CSSProperties = {
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};
