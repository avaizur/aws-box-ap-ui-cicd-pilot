import styles from './CellRenderers.module.scss';

export default function SecondaryTextCellRenderer({ value }) {
  return <span className={styles.secondaryText}>{value ?? ''}</span>;
}










