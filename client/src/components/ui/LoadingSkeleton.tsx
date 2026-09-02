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
    <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LoadingSkeleton width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <LoadingSkeleton width="60%" height="16px" />
          <LoadingSkeleton width="40%" height="12px" />
        </div>
      </div>
      <LoadingSkeleton width="100%" height="40px" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <LoadingSkeleton width="80px" height="24px" borderRadius="9999px" />
        <LoadingSkeleton width="80px" height="24px" borderRadius="9999px" />
        <LoadingSkeleton width="80px" height="24px" borderRadius="9999px" />
      </div>
    </div>
  );
};
