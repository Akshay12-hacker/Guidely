import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  id,
  className = '',
  style,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label htmlFor={textareaId} style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '0.92rem',
          borderRadius: 'var(--radius-sm)',
          border: error ? '1.5px solid var(--danger)' : '1px solid var(--border)',
          backgroundColor: '#FFFFFF',
          color: 'var(--text-main)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = 'var(--primary)';
          e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
        className={className}
        {...props}
      />
      {error ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
});
