import { useState } from 'react';
import styles from './Textarea.module.scss';

export default function Textarea({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  rows = 4,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`${styles.textareaWrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.error : ''} ${focused ? styles.focused : ''}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
