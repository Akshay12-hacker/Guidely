import React, { useState, useEffect } from 'react';
import { mediaCache } from '../../services/mediaCache.js';
import { saveMediaToDevice, shareMedia, isAndroidDevice } from '../../utils/mediaSaver.js';
import { getVideoPosterUrl, formatBytes } from '../../utils/cloudinary.js';
import { useToast } from '../../context/ToastContext.js';
import { ProgressBar } from './ProgressBar.js';
import {
  Download,
  Share2,
  Trash2,
  X,
  CheckCircle2,
  ExternalLink,
  WifiOff,
  HardDrive
} from 'lucide-react';

export interface WhatsAppMediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: 'image' | 'video' | 'raw';
  title?: string;
  senderName?: string;
  timestamp?: string;
  fileSizeBytes?: number;
}

export const WhatsAppMediaViewer: React.FC<WhatsAppMediaViewerProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType = 'image',
  title = 'Shared Media',
  senderName,
  timestamp,
  fileSizeBytes
}) => {
  const { showToast } = useToast();

  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<number>(0);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const isAndroid = isAndroidDevice();

  const isVideo = mediaType === 'video' || mediaUrl?.includes('/video/') || mediaUrl?.endsWith('.mp4') || mediaUrl?.endsWith('.webm');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check local cache upon opening
  useEffect(() => {
    if (!isOpen || !mediaUrl) return;

    let isMounted = true;

    const checkCache = async () => {
      const cached = await mediaCache.isCached(mediaUrl);
      if (!isMounted) return;
      setIsCached(cached);

      if (cached) {
        const cachedUrl = await mediaCache.getCachedBlobUrl(mediaUrl);
        if (isMounted && cachedUrl) {
          setLocalBlobUrl(cachedUrl);
        }
      } else {
        setLocalBlobUrl(null);
      }
    };

    checkCache();

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, mediaUrl, onClose]);

  if (!isOpen || !mediaUrl) return null;

  const displaySrc = localBlobUrl || mediaUrl;
  const videoPoster = isVideo ? getVideoPosterUrl(mediaUrl, 1080) : undefined;

  const handleSaveToDevice = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveProgress(10);

    try {
      const result = await saveMediaToDevice({
        url: mediaUrl,
        filename: title || 'Guidely_Media',
        onProgress: (pct) => setSaveProgress(pct),
        requestPermission: true
      });

      if (result.success) {
        setIsSavedSuccessfully(true);
        setIsCached(true);
        const cachedUrl = await mediaCache.getCachedBlobUrl(mediaUrl);
        if (cachedUrl) setLocalBlobUrl(cachedUrl);

        showToast(
          'success',
          result.isAndroid ? 'Saved to Android Gallery' : 'Saved to Device',
          result.message || 'Media was saved to your device.'
        );
      } else if (result.message !== 'Save cancelled by user') {
        showToast('error', 'Download failed', result.message);
      }
    } catch (err: any) {
      showToast('error', 'Save error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const shared = await shareMedia(mediaUrl, title, `Shared via Guidely Mentorship Platform`);
      if (shared) {
        showToast('info', 'Media Shared', 'Opened device share sheet.');
      } else {
        showToast('success', 'Link Copied', 'Media link copied to clipboard.');
      }
    } catch (err: any) {
      showToast('error', 'Share failed', err.message);
    }
  };

  const handleDeleteLocalCache = async () => {
    try {
      await mediaCache.deleteFromCache(mediaUrl);
      setIsCached(false);
      setIsSavedSuccessfully(false);
      setLocalBlobUrl(null);
      showToast('info', 'Cache Cleared', 'Deleted local cached copy from this device.');
    } catch (err: any) {
      showToast('error', 'Failed to delete cache', err.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 15, 29, 0.94)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              {title}
            </h3>
            {isCached && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                <HardDrive size={11} /> Saved on Device
              </span>
            )}
            {!isOnline && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#F87171',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                <WifiOff size={11} /> Offline
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem', color: '#94A3B8' }}>
            {senderName && <span>From: {senderName}</span>}
            {timestamp && <span>• {timestamp}</span>}
            {fileSizeBytes && <span>• {formatBytes(fileSizeBytes)}</span>}
          </div>
        </div>

        {/* Action icons in top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleShare}
            title="Share media"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <Share2 size={17} />
          </button>

          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            title="Open original in new tab"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={17} />
          </a>

          <button
            type="button"
            onClick={onClose}
            title="Close viewer (ESC)"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Media Stage */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'hidden'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {isVideo ? (
          <div style={{ maxWidth: '90vw', maxHeight: '75vh', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000000' }}>
            <video
              src={displaySrc}
              poster={videoPoster}
              controls
              autoPlay
              playsInline
              style={{ maxWidth: '90vw', maxHeight: '75vh', display: 'block' }}
            />
          </div>
        ) : (
          <img
            src={displaySrc}
            alt={title}
            loading="lazy"
            decoding="async"
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              objectFit: 'contain',
              borderRadius: '6px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
      </div>

      {/* Bottom Floating Control Panel (WhatsApp Style) */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
          {isCached ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399' }}>
              <CheckCircle2 size={16} /> Loaded from local device cache (0 Cloudinary bandwidth used)
            </span>
          ) : (
            <span>Cloudinary Source • Tap Save to keep in local {isAndroid ? 'Gallery' : 'device'}</span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSaving && (
            <div style={{ width: '120px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#E2E8F0', marginBottom: '2px' }}>
                <span>Saving...</span>
                <span>{saveProgress}%</span>
              </div>
              <ProgressBar value={saveProgress} size="sm" showLabel={false} />
            </div>
          )}

          {isCached && (
            <button
              type="button"
              onClick={handleDeleteLocalCache}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} /> Delete from Device
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveToDevice}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: isSavedSuccessfully ? '#059669' : '#4F46E5',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isSavedSuccessfully ? (
              <>
                <CheckCircle2 size={16} /> {isAndroid ? 'Saved to Gallery' : 'Saved'}
              </>
            ) : (
              <>
                <Download size={16} /> {isAndroid ? 'Save to Gallery' : 'Save to Device'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
