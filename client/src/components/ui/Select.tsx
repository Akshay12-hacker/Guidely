import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  id,
  className = '',
  style,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : generatedId);
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      {label && (
        <label htmlFor={selectId} style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        style={style}
        className={`guidely-select ${error ? 'guidely-select-error' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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

Select.displayName = 'Select';
