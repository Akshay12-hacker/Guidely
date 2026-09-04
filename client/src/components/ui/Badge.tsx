import React from 'react';
import { Check, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'verified'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'in_progress'
  | 'urgent';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  style
}) => {
  const getStyles = (): { bg: string; color: string; border: string; defaultIcon?: React.ReactNode } => {
    switch (variant) {
      case 'primary':
        return { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--primary-border)' };
      case 'success':
      case 'accepted':
      case 'completed':
        return { bg: 'var(--success-light)', color: 'var(--success-text)', border: 'var(--success-border)', defaultIcon: <Check size={11} /> };
      case 'verified':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', defaultIcon: <ShieldCheck size={12} /> };
      case 'warning':
      case 'pending':
        return { bg: 'var(--warning-light)', color: 'var(--warning-text)', border: 'var(--warning-border)', defaultIcon: <Clock size={11} /> };
      case 'danger':
      case 'urgent':
        return { bg: 'var(--danger-light)', color: 'var(--danger-text)', border: 'var(--danger-border)', defaultIcon: <AlertCircle size={11} /> };
      case 'info':
      case 'in_progress':
        return { bg: 'var(--info-light)', color: 'var(--info-text)', border: 'var(--info-border)' };
      case 'neutral':
      default:
        return { bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: 'var(--border)' };
    }
  };

  const { bg, color, border, defaultIcon } = getStyles();
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSm ? '2px 7px' : '3px 9px',
        fontSize: isSm ? '0.72rem' : '0.78rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        ...style
      }}
    >
      {icon || defaultIcon}
      {children}
    </span>
  );
};
