import React, { useState, useEffect } from 'react';
import { mediaCache } from '../../services/mediaCache.js';
import { saveMediaToDevice, isAndroidDevice } from '../../utils/mediaSaver.js';
import { formatBytes } from '../../utils/cloudinary.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Download,
  CheckCircle2,
  Loader2,
  Trash2
} from 'lucide-react';

interface MediaSaveButtonProps {
  mediaUrl: string;
  filename?: string;
  fileSizeBytes?: number;
  size?: 'sm' | 'md';
  variant?: 'subtle' | 'pill' | 'iconOnly';
  onSaved?: () => void;
}

export const MediaSaveButton: React.FC<MediaSaveButtonProps> = ({
  mediaUrl,
  filename,
  fileSizeBytes,
  size = 'sm',
  variant = 'pill',
  onSaved
}) => {
  const { showToast } = useToast();
  const [isCached, setIsCached] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const isAndroid = isAndroidDevice();

  useEffect(() => {
    let active = true;
    mediaCache.isCached(mediaUrl).then((cached) => {
      if (active) setIsCached(cached);
    });
    return () => {
      active = false;
    };
  }, [mediaUrl]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;

    setIsSaving(true);
    setProgress(15);

    try {
      const result = await saveMediaToDevice({
        url: mediaUrl,
        filename: filename || 'Guidely_Media',
        onProgress: (pct) => setProgress(pct),
        requestPermission: true
      });

      if (result.success) {
        setIsCached(true);
        if (onSaved) onSaved();
        showToast(
          'success',
          result.isAndroid ? 'Saved to Gallery' : 'Saved to Device',
          result.message || 'Media file is now available offline.'
        );
      } else if (result.message !== 'Save cancelled by user') {
        showToast('error', 'Save Failed', result.message);
      }
    } catch (err: any) {
      showToast('error', 'Save Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCache = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await mediaCache.deleteFromCache(mediaUrl);
      setIsCached(false);
      showToast('info', 'Cache Removed', 'Local copy deleted from device.');
    } catch {
      // Ignore
    }
  };

  if (variant === 'iconOnly') {
    return (
      <button
        type="button"
        onClick={handleSave}
        title={isCached ? 'Saved on device' : isAndroid ? 'Save to Gallery' : 'Save to device'}
        style={{
          background: isCached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.4)',
          border: 'none',
          borderRadius: '50%',
          width: size === 'sm' ? '28px' : '34px',
          height: size === 'sm' ? '28px' : '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isCached ? '#10B981' : '#FFFFFF',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(4px)'
        }}
      >
        {isSaving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isCached ? (
          <CheckCircle2 size={15} />
        ) : (
          <Download size={14} />
        )}
      </button>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: size === 'sm' ? '3px 9px' : '6px 12px',
          borderRadius: '16px',
          backgroundColor: isCached ? 'var(--success-light, #ECFDF5)' : 'var(--bg-subtle, #F1F5F9)',
          border: isCached ? '1px solid var(--success-border, #A7F3D0)' : '1px solid var(--border, #E2E8F0)',
          color: isCached ? 'var(--success, #059669)' : 'var(--text-main, #334155)',
          fontSize: size === 'sm' ? '0.74rem' : '0.82rem',
          fontWeight: 600,
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease'
        }}
        title={isCached ? 'Already saved on device' : isAndroid ? 'Save to Android Gallery' : 'Save to device'}
      >
        {isSaving ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            <span>{progress}%</span>
          </>
        ) : isCached ? (
          <>
            <CheckCircle2 size={13} />
            <span>{isAndroid ? 'In Gallery' : 'Saved'}</span>
          </>
        ) : (
          <>
            <Download size={13} />
            <span>{isAndroid ? 'Save to Gallery' : 'Save to Device'}</span>
            {fileSizeBytes && <span style={{ color: 'var(--text-muted)' }}>({formatBytes(fileSizeBytes)})</span>}
          </>
        )}
      </button>

      {isCached && (
        <button
          type="button"
          onClick={handleDeleteCache}
          title="Delete local copy from device cache"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            color: 'var(--text-subtle, #94A3B8)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};
