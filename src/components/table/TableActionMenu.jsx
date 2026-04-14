import { useState, useRef, useEffect } from 'react';
import styles from './TableActionMenu.module.scss';

export default function TableActionMenu({ items = [], row }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      // Calculate position after a short delay to ensure menu is rendered
      const timer = setTimeout(() => {
        if (!buttonRef.current || !menuRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate available space
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const spaceRight = viewportWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;

        // Get actual menu dimensions
        const menuHeight = menuRect.height || 100;
        const menuWidth = menuRect.width || 150;

        // Determine vertical position (fixed positioning is relative to viewport)
        let top = buttonRect.bottom + 4;
        let bottom = 'auto';
        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
          top = 'auto';
          bottom = viewportHeight - buttonRect.top + 4;
        }

        // Determine horizontal position - align to left of button by default
        let left = buttonRect.left - menuWidth;
        let right = 'auto';
        if (spaceLeft < menuWidth && spaceRight >= menuWidth) {
          // If not enough space on left, align to right of button
          left = buttonRect.right;
          right = 'auto';
        } else if (spaceLeft < menuWidth && spaceRight < menuWidth) {
          // If both sides are tight, align to viewport edge
          left = Math.max(4, viewportWidth - menuWidth - 4);
        }

        setMenuStyle({
          position: 'fixed',
          top: typeof top === 'number' ? `${top}px` : top,
          bottom: typeof bottom === 'number' ? `${bottom}px` : bottom,
          left: typeof left === 'number' ? `${left}px` : left,
          right: typeof right === 'number' ? `${right}px` : right,
          zIndex: 10000,
        });
      }, 0);

      return () => clearTimeout(timer);
    } else {
      setMenuStyle({});
    }
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (item, e) => {
    e.stopPropagation();
    if (item.onClick && item.enabled !== false) {
      item.onClick(row);
      setIsOpen(false);
    }
  };

  const visibleItems = items.filter((item) => item.visible !== false);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.menuWrapper}>
      <button
        ref={buttonRef}
        className={styles.menuButton}
        onClick={handleToggle}
        title="Actions"
        type="button"
      >
        ⋯
      </button>
      {isOpen && (
        <div ref={menuRef} className={styles.menu} style={menuStyle}>
          {visibleItems.map((item, index) => (
            <div
              key={index}
              className={`${styles.menuItem} ${item.enabled === false ? styles.disabled : ''}`}
              onClick={(e) => handleMenuItemClick(item, e)}
            >
              {item.render ? item.render(row) : item.label || item.jsx}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

