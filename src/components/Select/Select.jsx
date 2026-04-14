import { useState } from 'react';
import styles from './Select.module.scss';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = '',
  required = false,
  error = '',
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`${styles.selectWrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.error : ''} ${focused ? styles.focused : ''}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
