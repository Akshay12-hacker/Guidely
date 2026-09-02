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
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
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
          style={{
            width: '100%',
            padding: leftIcon ? (rightIcon ? '10px 38px 10px 38px' : '10px 14px 10px 38px') : (rightIcon ? '10px 38px 10px 14px' : '10px 14px'),
            fontSize: '0.92rem',
            borderRadius: 'var(--radius-sm)',
            border: error ? '1.5px solid var(--danger)' : '1px solid var(--border)',
            backgroundColor: '#FFFFFF',
            color: 'var(--text-main)',
            outline: 'none',
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
        {rightIcon && (
          <div style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{helperText}</span>
      ) : null}
    </div>
  );
});
