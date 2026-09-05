import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '../../utils/cloudinary.js';
import { formatInitials } from '../../utils/formatters.js';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isVerified?: boolean;
  style?: React.CSSProperties;
}

const PALETTES = [
  { bg: '#EEF2FF', text: '#4338CA' },
  { bg: '#ECFDF5', text: '#065F46' },
  { bg: '#EFF6FF', text: '#1D4ED8' },
  { bg: '#F5F3FF', text: '#6D28D9' },
  { bg: '#FFFBEB', text: '#92400E' },
  { bg: '#FDF2F8', text: '#9D174D' },
  { bg: '#F0FDF4', text: '#15803D' }
];

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isOnline,
  isVerified,
  style
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const getDimension = () => {
    switch (size) {
      case 'xs': return 26;
      case 'sm': return 32;
      case 'lg': return 48;
      case 'xl': return 64;
      case 'md':
      default:
        return 38;
    }
  };

  const dim = getDimension();
  const initials = formatInitials(name, 'U');

  const hash = (name || 'U').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];

  const optimizedSrc = src
    ? getOptimizedCloudinaryUrl(src, {
        width: dim * 2, // 2x for Retina sharp rendering
        height: dim * 2,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good'
      })
    : undefined;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', width: dim, height: dim, flexShrink: 0, ...style }}>
      {optimizedSrc && !imgFailed ? (
        <img
          src={optimizedSrc}
          alt={name}
          loading="lazy"
          decoding="async"
          style={{
            width: dim,
            height: dim,
            borderRadius: 'var(--radius-full)',
            objectFit: 'cover',
            border: '1px solid rgba(0,0,0,0.06)',
            backgroundColor: '#F1F5F9'
          }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          style={{
            width: dim,
            height: dim,
            borderRadius: 'var(--radius-full)',
            backgroundColor: palette.bg,
            color: palette.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: Math.max(10, Math.floor(dim * 0.38)),
            border: '1px solid rgba(0,0,0,0.05)',
            userSelect: 'none'
          }}
        >
          {initials}
        </div>
      )}

      {/* Online indicator */}
      {isOnline !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: Math.max(8, Math.floor(dim * 0.26)),
            height: Math.max(8, Math.floor(dim * 0.26)),
            borderRadius: '50%',
            backgroundColor: isOnline ? 'var(--success)' : 'var(--text-subtle)',
            border: '2px solid #FFFFFF'
          }}
          title={isOnline ? 'Online' : 'Offline'}
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
            border: '1.5px solid #FFFFFF',
            boxShadow: 'var(--shadow-xs)'
          }}
          title="Verified Industry Mentor"
        >
          <ShieldCheck size={Math.max(10, Math.floor(dim * 0.28))} />
        </span>
      )}
    </div>
  );
};
