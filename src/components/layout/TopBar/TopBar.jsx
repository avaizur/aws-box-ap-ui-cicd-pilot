import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../Button/Button';
import topbarBrand from '../../../assets/images/dxc.png';
import styles from './TopBar.module.scss';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <img src={topbarBrand} alt="" className={styles.brandMark}  />
        <h1 className={styles.appName}>AWS BOX Management</h1>
      </div>
      <div className={styles.right}>
        {user && (
          <>
            <span className={styles.userName}>{user.displayName}</span>
            <Button variant="text" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
