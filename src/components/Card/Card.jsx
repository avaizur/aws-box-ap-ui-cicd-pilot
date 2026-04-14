import styles from './Card.module.scss';

export default function Card({ children, title, className = '', noPadding = false }) {
  return (
    <div className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${className}`}>
      {title && (
        <div className={styles.titleBox}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
