import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext.js';
import { Button } from './Button.js';

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  role?: 'STUDENT' | 'MENTOR';
  disabled?: boolean;
  isLoading?: boolean;
  style?: React.CSSProperties;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  disabled = false,
  isLoading = false,
  style
}) => {
  const { showToast } = useToast();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

  // 1. Poll or check for window.google.accounts.id availability
  useEffect(() => {
    if (!clientId) return;

    let checkInterval: any = null;
    let attempts = 0;

    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        clearInterval(checkInterval);
      } else if (attempts >= 40) {
        // Stop checking after ~8 seconds
        clearInterval(checkInterval);
      }
      attempts++;
    };

    checkGsi();
    checkInterval = setInterval(checkGsi, 200);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId]);

  // 2. Initialize and render Google standard button once SDK is available
  useEffect(() => {
    if (!isGsiLoaded || !clientId || !buttonContainerRef.current) return;

    try {
      window.google!.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess(response.credential);
          } else {
            const err = 'No credential received from Google';
            onError ? onError(err) : showToast('error', 'Google Sign-In Failed', err);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Clear previous buttons if re-rendering
      buttonContainerRef.current.innerHTML = '';

      window.google!.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonContainerRef.current.offsetWidth || 380
      });

      setIsInitialized(true);
    } catch (err: any) {
      console.error('Failed to initialize Google Identity Services button:', err);
    }
  }, [isGsiLoaded, clientId, text, onSuccess, onError, showToast]);

  const handleManualClick = () => {
    if (!clientId) {
      showToast(
        'warning',
        'Google Client ID Not Set',
        'Please configure VITE_GOOGLE_CLIENT_ID in client/.env or Vercel environment variables to enable live Google Sign-In.'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err: any) {
        console.error('Google One Tap prompt failed:', err);
      }
    } else {
      showToast('info', 'Connecting to Google', 'Loading Google Identity Services...');
    }
  };

  const labelText =
    text === 'signup_with'
      ? 'Sign up with Google'
      : text === 'continue_with'
      ? 'Continue with Google'
      : 'Sign in with Google';

  return (
    <div style={{ width: '100%', position: 'relative', minHeight: '40px', ...style }}>
      {/* Official Google Identity Services button mount target */}
      <div
        ref={buttonContainerRef}
        style={{
          width: '100%',
          display: isInitialized && clientId ? 'flex' : 'none',
          justifyContent: 'center'
        }}
      />

      {/* Styled fallback button when SDK is still mounting or when client ID is pending */}
      {(!isInitialized || !clientId) && (
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          isLoading={isLoading}
          onClick={handleManualClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DADCE0',
            color: '#3C4043',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 1px 2px rgba(60,64,67,0.08)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{labelText}</span>
        </Button>
      )}
    </div>
  );
};
