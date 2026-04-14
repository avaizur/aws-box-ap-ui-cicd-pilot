import { createContext, useContext, useId } from 'react';
import styles from './Tabs.module.scss';

const TabsContext = createContext(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return ctx;
}

export default function Tabs({ value, onChange, items, children, className = '' }) {
  const baseId = useId();

  const ctx = {
    value,
    onChange,
    getTabId: (tabValue) => `${baseId}-tab-${tabValue}`,
    getPanelId: (tabValue) => `${baseId}-panel-${tabValue}`,
  };

  // JSON-driven usage: <Tabs items={[{ value, label, content }]} ... />
  if (Array.isArray(items) && items.length > 0) {
    return (
      <TabsContext.Provider value={ctx}>
        <div className={`${styles.tabs} ${className}`}>
          <Tabs.List>
            {items.map((item) => (
              <Tabs.Tab key={item.value} value={item.value}>
                {item.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panels>
            {items.map((item) => (
              <Tabs.Panel key={item.value} value={item.value}>
                {item.content}
              </Tabs.Panel>
            ))}
          </Tabs.Panels>
        </div>
      </TabsContext.Provider>
    );
  }

  // JSX-driven usage:
  // <Tabs value={...} onChange={...}>
  //   <Tabs.List>...</Tabs.List>
  //   <Tabs.Panels>...</Tabs.Panels>
  // </Tabs>
  return (
    <TabsContext.Provider value={ctx}>
      <div className={`${styles.tabs} ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children, className = '' }) {
  return (
    <div role="tablist" className={`${styles.list} ${className}`}>
      {children}
    </div>
  );
};

Tabs.Tab = function TabsTab({ value, children, className = '' }) {
  const { value: activeValue, onChange, getTabId, getPanelId } = useTabsContext();
  const isActive = activeValue === value;

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <button
      id={getTabId(value)}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={getPanelId(value)}
      tabIndex={isActive ? 0 : -1}
      className={`${styles.tab} ${isActive ? styles.active : ''} ${className}`}
      onClick={() => onChange(value)}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
};

Tabs.Panels = function TabsPanels({ children, className = '' }) {
  return <div className={`${styles.panels} ${className}`}>{children}</div>;
};

Tabs.Panel = function TabsPanel({ value, children, className = '' }) {
  const { value: activeValue, getTabId, getPanelId } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      id={getPanelId(value)}
      role="tabpanel"
      aria-labelledby={getTabId(value)}
      hidden={!isActive}
      className={`${styles.panel} ${className}`}
    >
      {children}
    </div>
  );
};


