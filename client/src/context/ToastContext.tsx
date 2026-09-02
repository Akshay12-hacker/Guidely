import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const bgMap = {
            success: 'var(--success-light)',
            error: 'var(--danger-light)',
            warning: 'var(--warning-light)',
            info: 'var(--info-light)'
          };
          const borderMap = {
            success: 'var(--success-border)',
            error: 'var(--danger-border)',
            warning: 'var(--warning-border)',
            info: 'var(--info-border)'
          };
          const textMap = {
            success: '#065F46',
            error: '#991B1B',
            warning: '#92400E',
            info: '#075985'
          };
          const iconMap = {
            success: <CheckCircle2 size={20} color="var(--success)" />,
            error: <AlertCircle size={20} color="var(--danger)" />,
            warning: <AlertTriangle size={20} color="var(--warning)" />,
            info: <Info size={20} color="var(--info)" />
          };

          return (
            <div
              key={toast.id}
              className="animate-scale-in"
              style={{
                backgroundColor: bgMap[toast.type],
                border: `1px solid ${borderMap[toast.type]}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                pointerEvents: 'auto'
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '1px' }}>
                {iconMap[toast.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: textMap[toast.type] }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{ fontSize: '0.82rem', color: textMap[toast.type], marginTop: '2px', opacity: 0.9 }}>
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: textMap[toast.type],
                  opacity: 0.6,
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
