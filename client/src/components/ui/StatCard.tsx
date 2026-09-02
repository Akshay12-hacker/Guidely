import React from 'react';
import { Card } from './Card.js';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  changeText?: string;
  isPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg = 'var(--primary-light)',
  iconColor = 'var(--primary)',
  changeText,
  isPositive = true
}) => {
  return (
    <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {changeText && (
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: isPositive ? 'var(--success)' : 'var(--danger)',
              backgroundColor: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            {changeText}
          </span>
        )}
      </div>
    </Card>
  );
};
