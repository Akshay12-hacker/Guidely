import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isVerified?: boolean;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline,
  isVerified,
  style
}) => {
  const getDimension = () => {
    switch (size) {
      case 'xs': return 28;
      case 'sm': return 36;
      case 'lg': return 56;
      case 'xl': return 80;
      case 'md':
      default:
        return 44;
    }
  };

  const dim = getDimension();
  const initials = name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Pick deterministic pastel hue based on name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: dim, height: dim, flexShrink: 0, ...style }}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: dim,
            height: dim,
            borderRadius: 'var(--radius-full)',
            objectFit: 'cover',
            border: '2px solid #FFFFFF',
            boxShadow: 'var(--shadow-xs)',
            backgroundColor: '#F1F5F9'
          }}
          onError={(e) => {
            // fallback to initials on broken image
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          style={{
            width: dim,
            height: dim,
            borderRadius: 'var(--radius-full)',
            backgroundColor: `hsl(${hue}, 65%, 92%)`,
            color: `hsl(${hue}, 75%, 35%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: dim * 0.38,
            border: '2px solid #FFFFFF',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          {initials}
        </div>
      )}

      {/* Online indicator dot */}
      {isOnline !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(10, dim * 0.26),
            height: Math.max(10, dim * 0.26),
            borderRadius: '50%',
            backgroundColor: isOnline ? 'var(--success)' : 'var(--text-subtle)',
            border: '2px solid #FFFFFF'
          }}
        />
      )}

      {/* Verified Mentor Shield */}
      {isVerified && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            borderRadius: '50%',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-xs)',
            border: '1.5px solid #FFFFFF'
          }}
          title="Verified Industry Mentor"
        >
          <ShieldCheck size={Math.max(10, dim * 0.28)} />
        </span>
      )}
    </div>
  );
};
