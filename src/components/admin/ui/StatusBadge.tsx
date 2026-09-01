import React from 'react';
import { statusStyle } from '../theme';

interface StatusBadgeProps {
  status: string;
}

/** Renders a KYC status as a pill. Underscored statuses display as separate words. */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { bg, color } = statusStyle(status);

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      backgroundColor: bg,
      color
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
