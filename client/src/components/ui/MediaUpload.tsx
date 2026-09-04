import React, { useState, useRef } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { CloudinaryUploadResult } from '../../../../shared/types.js';
import { ProgressBar } from './ProgressBar.js';
import {
  getOptimizedCloudinaryUrl,
  getVideoPosterUrl
} from '../../utils/cloudinary.js';
import {
  UploadCloud,
  Trash2,
  Video as VideoIcon,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface MediaUploadProps {
  label?: string;
  helperText?: string;
  folder?: 'projects' | 'videos' | 'documents' | 'messages' | 'general';
  acceptType?: 'image' | 'video' | 'document' | 'all';
  value?: string;
  publicId?: string;
  projectId?: string;
  onChange?: (result: CloudinaryUploadResult | null) => void;
  maxSizeBytes?: number;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  label,
  helperText,
  folder = 'projects',
  acceptType = 'image',
  value,
  publicId: initialPublicId,
  projectId,
  onChange,
  maxSizeBytes
}) => {
  const { showToast } = useToast();

  const [currentUrl, setCurrentUrl] = useState<string | undefined>(value);
  const [currentPublicId, setCurrentPublicId] = useState<string | undefined>(initialPublicId);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lastUploadedFingerprint, setLastUploadedFingerprint] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<'image' | 'video' | 'raw'>(
    acceptType === 'video' ? 'video' : acceptType === 'document' ? 'raw' : 'image'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptMimes = () => {
    switch (acceptType) {
      case 'image':
        return 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';
      case 'video':
        return 'video/mp4,video/webm,video/quicktime';
      case 'document':
        return 'application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'all':
      default:
        return 'image/*,video/*,.pdf,.doc,.docx,.txt';
    }
  };

  // Cloudinary Free-Tier limits (50MB for video to prevent consuming entire account bandwidth, 10MB for image)
  const getMaxSize = () => {
    if (maxSizeBytes) return maxSizeBytes;
    if (acceptType === 'video') return 50 * 1024 * 1024; // 50MB sensible free-tier limit
    return 10 * 1024 * 1024; // 10MB default
  };

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    const maxSize = getMaxSize();

    // 1. Free-Tier File Size Validation
    if (file.size > maxSize) {
      const mb = (maxSize / (1024 * 1024)).toFixed(0);
      setErrorMsg(`File size exceeds Free-Tier limit of ${mb}MB. Please select an optimized file.`);
      return;
    }

    // 2. Duplicate Prevention: Don't upload the identical file repeatedly
    const fileFingerprint = `${file.name}_${file.size}_${file.lastModified}`;
    if (fileFingerprint === lastUploadedFingerprint && currentUrl) {
      showToast('info', 'File already uploaded', 'This exact file has already been uploaded to Cloudinary.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await api.uploadMedia(file, folder, (pct) => {
        setUploadProgress(Math.max(15, pct));
      }, projectId);

      setUploadProgress(100);
      setCurrentUrl(res.secureUrl || res.url);
      setCurrentPublicId(res.publicId);
      setResourceType(res.resourceType);
      setLastUploadedFingerprint(fileFingerprint);

      if (onChange) {
        onChange(res);
      }
      showToast('success', 'Media uploaded', 'File uploaded and optimized on Cloudinary.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed. Please try again.');
      showToast('error', 'Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    if (currentPublicId) {
      try {
        await api.deleteMedia(currentPublicId, resourceType);
      } catch {
        // Non-blocking
      }
    }

    setCurrentUrl(undefined);
    setCurrentPublicId(undefined);
    setLastUploadedFingerprint(null);
    setErrorMsg(null);
    if (onChange) {
      onChange(null);
    }
    showToast('info', 'Media removed', 'Asset was removed from Cloudinary.');
  };

  const isVideo = resourceType === 'video' || (currentUrl && (currentUrl.endsWith('.mp4') || currentUrl.endsWith('.webm') || currentUrl.includes('/video/')));
  const videoPoster = isVideo && currentUrl ? getVideoPosterUrl(currentUrl, 720) : undefined;
  const optimizedPreviewUrl = !isVideo && currentUrl ? getOptimizedCloudinaryUrl(currentUrl, { width: 600, quality: 'auto:good' }) : currentUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {label}
        </label>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span>Uploading to Cloudinary ({folder})...</span>
            <span>{uploadProgress}%</span>
          </div>
          <ProgressBar value={uploadProgress} size="sm" showLabel={false} />
        </div>
      )}

      {/* Existing Asset Preview */}
      {currentUrl && !isUploading ? (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {isVideo ? (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#000000', maxHeight: '240px' }}>
              <video
                src={currentUrl}
                poster={videoPoster}
                preload="metadata"
                controls
                style={{ width: '100%', maxHeight: '240px', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '200px', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
              <img
                src={optimizedPreviewUrl}
                alt="Cloudinary media preview"
                loading="lazy"
                decoding="async"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', display: 'inline-block' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={14} color="var(--success)" />
              <span>Optimized Cloudinary Asset ({folder})</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={13} /> View Full
              </a>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Replace
              </button>

              <button
                type="button"
                onClick={handleDelete}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Empty / Idle State */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver ? '2px dashed var(--primary)' : '2px dashed var(--border)',
            backgroundColor: isDragOver ? 'var(--primary-light)' : '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}
          >
            {acceptType === 'video' ? <VideoIcon size={20} /> : <UploadCloud size={20} />}
          </div>

          <div>
            <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              {acceptType === 'video' ? 'Upload video file or screen recording' : 'Choose media or drag and drop here'}
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {acceptType === 'video' ? 'MP4, WEBM, or MOV up to 50MB (720p HD)' : 'Images, diagrams, and supported media up to 10MB'}
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptMimes()}
        onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {helperText && (
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
