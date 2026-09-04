import React from 'react';

export const LoadingSkeleton: React.FC<{
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}> = ({
  height = '20px',
  width = '100%',
  borderRadius = 'var(--radius-sm)',
  style
}) => {
  return (
    <div
      className="skeleton-pulse"
      style={{
        height,
        width,
        borderRadius,
        ...style
      }}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LoadingSkeleton width="40px" height="40px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <LoadingSkeleton width="50%" height="14px" />
          <LoadingSkeleton width="30%" height="11px" />
        </div>
      </div>
      <LoadingSkeleton width="100%" height="32px" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <LoadingSkeleton width="70px" height="22px" borderRadius="var(--radius-xs)" />
        <LoadingSkeleton width="70px" height="22px" borderRadius="var(--radius-xs)" />
      </div>
    </div>
  );
};
