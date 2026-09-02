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
        return { bg: 'var(--success-light)', color: '#065F46', border: 'var(--success-border)', defaultIcon: <Check size={12} /> };
      case 'verified':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', defaultIcon: <ShieldCheck size={13} /> };
      case 'warning':
      case 'pending':
        return { bg: 'var(--warning-light)', color: '#92400E', border: 'var(--warning-border)', defaultIcon: <Clock size={12} /> };
      case 'danger':
      case 'urgent':
        return { bg: 'var(--danger-light)', color: '#991B1B', border: 'var(--danger-border)', defaultIcon: <AlertCircle size={12} /> };
      case 'info':
      case 'in_progress':
        return { bg: 'var(--info-light)', color: '#075985', border: 'var(--info-border)' };
      case 'neutral':
      default:
        return { bg: 'var(--bg-subtle)', color: 'var(--text-muted)', border: 'var(--border)' };
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
        padding: isSm ? '2px 8px' : '4px 10px',
        fontSize: isSm ? '0.74rem' : '0.82rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {icon || defaultIcon}
      {children}
    </span>
  );
};
