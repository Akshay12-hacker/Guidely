import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  style,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : generatedId);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {leftIcon && (
          <div style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          style={{
            paddingLeft: leftIcon ? '36px' : '12px',
            paddingRight: rightIcon ? '36px' : '12px',
            ...style
          }}
          className={`guidely-input ${error ? 'guidely-input-error' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </div>
        )}
      </div>
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

Input.displayName = 'Input';
