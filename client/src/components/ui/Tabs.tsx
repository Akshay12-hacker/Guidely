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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pills' ? '8px' : '24px',
        borderBottom: variant === 'underline' ? '1px solid var(--border)' : 'none',
        overflowX: 'auto',
        paddingBottom: variant === 'underline' ? '0px' : '4px'
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 6px',
                    fontSize: '0.74rem'
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
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 4px',
              fontSize: '0.92rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: isActive ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'color 0.15s ease, border-color 0.15s ease'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 8px',
                  fontSize: '0.76rem',
                  fontWeight: 600
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
