import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderVariant?: 'default' | 'highlight' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  borderVariant = 'default',
  style,
  className = '',
  ...props
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none': return '0px';
      case 'sm': return '16px';
      case 'lg': return '32px';
      case 'md':
      default:
        return '24px';
    }
  };

  const getBorderColor = () => {
    switch (borderVariant) {
      case 'highlight': return 'var(--primary-border)';
      case 'subtle': return '#F1F5F9';
      case 'default':
      default:
        return 'var(--border)';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: hoverable ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        padding: getPaddingStyle(),
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        ...style
      }}
      className={`guidely-card ${hoverable ? 'hoverable-card' : ''} ${className}`}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--border-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = getBorderColor();
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};
