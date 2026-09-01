import React from 'react';
import { card, colors } from '../theme';

interface StatCardProps {
  label: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div style={{ ...card, padding: '18px 20px' }}>
    <div style={{ fontSize: '14px', fontWeight: 700, color: colors.textPrimary }}>{label}</div>
    <div style={{ fontSize: '28px', fontWeight: 700, color: colors.textPrimary, marginTop: '10px' }}>
      {value}
    </div>
  </div>
);

export default StatCard;
