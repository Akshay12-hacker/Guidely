import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserCheck, Sparkles, LogOut } from 'lucide-react';

export const QuickRoleSwitcher: React.FC = () => {
  const { user, quickLoginAs, logout, isAuthenticated } = useAuth();

  const demoProfiles = [
    { label: 'Akshay (Lead)', email: 'akshay@guidely.dev', role: 'STUDENT', desc: 'SAGE Bhopal' },
    { label: 'Abhimanyu', email: 'abhimanyu@guidely.dev', role: 'STUDENT', desc: 'Core Dev' },
    { label: 'Sapna', email: 'sapna@guidely.dev', role: 'STUDENT', desc: 'AI/ML' },
    { label: 'Prof. Nitin', email: 'nitin.choudhary@sageuniversity.edu.in', role: 'MENTOR', desc: 'Faculty Guide' },
    { label: 'Priya (Google)', email: 'priya.sundaram@gmail.com', role: 'MENTOR', desc: 'Staff Eng' },
    { label: 'Dr. Rohan (MSFT)', email: 'rohan.mehra@microsoft.com', role: 'MENTOR', desc: 'AI Lead' },
    { label: 'Admin (HOD)', email: 'admin@guidely.dev', role: 'ADMIN', desc: 'HOD' }
  ];

  return (
    <aside
      aria-label="Demo environment role switcher"
      style={{
        backgroundColor: '#0F172A',
        color: '#E2E8F0',
        padding: '5px 16px',
        fontSize: '0.74rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 9999,
        borderBottom: '1px solid #1E293B'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(79, 70, 229, 0.3)',
            color: '#C7D2FE',
            padding: '2px 7px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          <Sparkles size={11} />
          Demo Mode
        </span>
        <span style={{ color: '#94A3B8' }}>
          Switch persona:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        {demoProfiles.map((profile) => {
          const isCurrent = user?.email.toLowerCase() === profile.email.toLowerCase();

          return (
            <button
              key={profile.email}
              onClick={() => quickLoginAs(profile.email)}
              title={`${profile.email} (${profile.desc})`}
              style={{
                backgroundColor: isCurrent ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                color: isCurrent ? '#FFFFFF' : '#CBD5E1',
                border: isCurrent ? '1px solid #818CF8' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-xs)',
                padding: '2px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: isCurrent ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
            >
              {isCurrent && <UserCheck size={11} />}
              {profile.label}
            </button>
          );
        })}

        {isAuthenticated && (
          <button
            onClick={logout}
            style={{
              backgroundColor: 'transparent',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-xs)',
              padding: '2px 7px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '4px'
            }}
          >
            <LogOut size={11} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};
