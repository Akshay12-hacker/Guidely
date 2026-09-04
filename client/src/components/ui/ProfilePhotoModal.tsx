import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { Avatar } from './Avatar.js';
import { ProgressBar } from './ProgressBar.js';
import {
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdated?: (newAvatarUrl: string) => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  onPhotoUpdated
}) => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    // Validate size (5MB max)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg(`Image size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 5MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMsg(null);

    try {
      const res = await api.uploadProfilePhoto(selectedFile, (pct) => {
        setUploadProgress(Math.max(15, pct));
      });

      setUploadProgress(100);

      // Update AuthContext user so header, navbar, and sidebar avatars update immediately
      if (res.user) {
        updateCurrentUser(res.user);
      } else if (user) {
        updateCurrentUser({
          ...user,
          avatarUrl: res.secureUrl || res.url
        });
      }

      showToast('success', 'Profile photo updated', 'Your new photo is now live and optimized on Cloudinary.');
      if (onPhotoUpdated) {
        onPhotoUpdated(res.secureUrl || res.url);
      }

      setTimeout(() => {
        handleReset();
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload image. Please try again.');
      showToast('error', 'Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.avatarUrl && !previewUrl) return;

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await api.deleteProfilePhoto();
      if (res.user) {
        updateCurrentUser(res.user);
      } else if (user) {
        updateCurrentUser({
          ...user,
          avatarUrl: undefined,
          avatarPublicId: undefined
        });
      }

      handleReset();
      showToast('info', 'Profile photo removed', 'Your avatar will now show your initials.');
      if (onPhotoUpdated) {
        onPhotoUpdated('');
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove photo.');
      showToast('error', 'Removal failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatarSrc = previewUrl || user?.avatarUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Profile Photo" maxWidth="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Current / Preview Avatar Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              name={user?.fullName || 'User'}
              src={displayAvatarSrc}
              size="xl"
            />
            {previewUrl && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Pending preview"
              >
                <CheckCircle2 size={14} />
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {user?.fullName || 'User'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {selectedFile ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)` : displayAvatarSrc ? 'Custom profile photo active' : 'Default initials avatar'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              Cloudinary Face Crop • Auto Format (WebP/AVIF) • CDN Cached
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Uploading to Cloudinary & optimizing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <ProgressBar value={uploadProgress} size="sm" showLabel={false} />
          </div>
        )}

        {/* Dropzone Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver ? '2px dashed var(--primary)' : '2px dashed var(--border)',
            backgroundColor: isDragOver ? 'var(--primary-light)' : '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}
          >
            <Camera size={22} />
          </div>

          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              Click to select or drag and drop image here
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              JPEG, PNG, WEBP, or GIF • Maximum file size 5MB
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px' }}>
          <div>
            {(user?.avatarUrl || previewUrl) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                style={{ color: 'var(--danger)' }}
                leftIcon={<Trash2 size={15} />}
              >
                {isDeleting ? 'Removing...' : 'Remove Photo'}
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isUploading}
              >
                Cancel
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              leftIcon={<UploadCloud size={16} />}
            >
              {isUploading ? 'Uploading...' : 'Save Photo'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
