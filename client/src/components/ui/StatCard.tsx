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
    <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
        <span style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          {value}
        </span>
        {changeText && (
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: isPositive ? 'var(--success-text)' : 'var(--danger-text)',
              backgroundColor: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              lineHeight: 1.4
            }}
          >
            {changeText}
          </span>
        )}
      </div>
    </Card>
  );
};
