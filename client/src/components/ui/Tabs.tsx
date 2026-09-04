import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline'
}) => {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pills' ? '6px' : '20px',
        borderBottom: variant === 'underline' ? '1px solid var(--border)' : 'none',
        overflowX: 'auto',
        paddingBottom: variant === 'underline' ? '0px' : '4px',
        scrollbarWidth: 'none'
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--border)',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '1px 5px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 2px',
              fontSize: '0.88rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'color 0.15s ease, border-color 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '1px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
