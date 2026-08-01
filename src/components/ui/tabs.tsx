import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTabId, onChange }) => {
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId || (items[0] ? items[0].id : '')
  );

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    if (onChange) onChange(tabId);
  };

  const activeTab = items.find((item) => item.id === activeTabId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Tab Headers */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              style={{
                position: 'relative',
                paddingBottom: '12px',
                fontSize: '15px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                opacity: tab.disabled ? 0.5 : 1,
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: 'var(--color-pistachio-dark)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      {activeTab && (
        <div role="tabpanel" className="animate-fade-in">
          {activeTab.content}
        </div>
      )}
    </div>
  );
};
