import TopBar from '../TopBar/TopBar';
import Sidebar from '../Sidebar/Sidebar';
import styles from './PageLayout.module.scss';

export default function PageLayout({ children, title }) {
  return (
    <div className={styles.pageContainer}>
      <TopBar />
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.usableBody}>
          {title && <h2 className={styles.pageTitle}>{title}</h2>}
          {children}
        </div>
      </main>
    </div>
  );
}
