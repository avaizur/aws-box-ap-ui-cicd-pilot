import styles from './MessagePanel.module.scss';

/**
 * MessagePanel component for displaying errors, warnings, and success messages
 * @param {Object|string} message - Either an ErrorResponse object or a simple message string
 * @param {string} type - Type of message: 'error', 'warning', or 'success' (defaults to 'error')
 */
export default function MessagePanel({ message, type = 'error' }) {
  // If message is a string, use it as the main message
  // If message is an object (ErrorResponse), extract the message and errors
  const mainMessage = typeof message === 'string' ? message : message?.message || '';
  const errors = typeof message === 'object' && message?.errors ? message.errors : [];
  
  // Determine type from ErrorResponse status if not explicitly provided
  let messageType = type;
  if (typeof message === 'object' && message?.status) {
    if (message.status >= 400 && message.status < 500) {
      messageType = 'error';
    } else if (message.status >= 500) {
      messageType = 'error';
    }
  }

  // Don't render if there's no message
  if (!mainMessage && errors.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.messagePanel} ${styles[messageType]}`}>
      {mainMessage && (
        <div className={styles.mainMessage}>{mainMessage}</div>
      )}
      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((error, index) => (
            <li key={index} className={styles.errorItem}>
              {error.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

