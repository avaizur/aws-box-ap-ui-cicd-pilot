import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Sidebar.module.scss';

export function MenuIcon({ type }) {
  // Simple inline SVGs to avoid extra icon dependencies.
  switch (type) {
    case 'customers':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
          />
        </svg>
      );
    case 'jobs':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 4h4c1.1 0 2 .9 2 2v1h3c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3V6c0-1.1.9-2 2-2Zm4 3V6h-4v1h4Zm-9 3v10h16V10H5Z"
          />
        </svg>
      );
    case 'parts':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            fill="currentColor"
            d="M21 8V7l-3-3H6L3 7v1H2v13h20V8h-1ZM7 5h10l2 2H5l2-2Zm-2 6h14v9H5v-9Z"
          />
        </svg>
      );
    case 'initiative':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
                <path
        fill='currentColor'
        d='M3 3h18v18H3V3zm8 2H5v4h6V5zm8 0h-6v4h6V5zM11 11H5v4h6v-4zm8 0h-6v4h6v-4zM11 17H5v2h6v-2zm8 0h-6v2h6v-2z'
      />
        </svg>
      );
    case 'createInitiative':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 17h-2v-2h2Zm2.07-7.75-.9.92A3 3 0 0 0 13 14h-2v-.5a4 4 0 0 1 1.17-2.83l1.24-1.27A2 2 0 1 0 10 7h2a2 2 0 1 1 3.07 2.25Z"
          />

        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"
          />
        </svg>
      );
    case 'builder':
      return (
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 4h18v16H3V4zm2 2v12h14V6H5zm2 2h6v2H7V8zm0 4h4v2H7v-2zm8-4h2v6h-2V8z"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const menuItems = [
    // { path: '/customers', label: 'Customers', icon: 'customers' },
    // { path: '/jobs', label: 'Jobs', icon: 'jobs' },
    // { path: '/parts', label: 'Parts', icon: 'parts' },
    { path: '/initiatives/create', label: 'Create Initiative', icon: 'createInitiative' },
    { path: '/initiatives', label: 'Initiatives', icon: 'initiative' },
    { path: '/builder', label: 'Builder', icon: 'builder' },
  ];

  if (isAdmin) {
    menuItems.push({ path: '/users', label: 'Users', icon: 'users' });
  }

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.path}>
            {item.path === '/builder' ? (
              <a
                href={item.path}
                target="_blank"
                rel="noreferrer"
                className={styles.menuItem}
              >
                <MenuIcon type={item.icon} />
                <span className={styles.label}>{item.label}</span>
              </a>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                <MenuIcon type={item.icon} />
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
