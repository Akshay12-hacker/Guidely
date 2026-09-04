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
      case 'lg': return '28px';
      case 'md':
      default:
        return '20px';
    }
  };

  const getBorderColor = () => {
    switch (borderVariant) {
      case 'highlight': return 'var(--primary-border)';
      case 'subtle': return 'var(--border-subtle)';
      case 'default':
      default:
        return 'var(--border)';
    }
  };

  return (
    <div
      style={{
        padding: getPaddingStyle(),
        borderColor: getBorderColor(),
        ...style
      }}
      className={`guidely-card ${hoverable ? 'guidely-card-hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
