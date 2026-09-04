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
  const generatedId = React.useId();
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : generatedId);
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={textareaId} style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        style={style}
        className={`guidely-textarea ${error ? 'guidely-textarea-error' : ''} ${className}`}
        {...props}
      />
      {error ? (
        <span id={errorId} style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '2px', fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
