import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color = 'var(--primary)',
  style
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const getHeight = () => {
    switch (size) {
      case 'sm': return '6px';
      case 'lg': return '12px';
      case 'md':
      default:
        return '8px';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', ...style }}>
      <div
        style={{
          flex: 1,
          height: getHeight(),
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', minWidth: '38px', textAlign: 'right' }}>
          {clamped}%
        </span>
      )}
    </div>
  );
};
