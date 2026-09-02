import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserCheck, Sparkles } from 'lucide-react';

export const QuickRoleSwitcher: React.FC = () => {
  const { user, quickLoginAs, logout, isAuthenticated } = useAuth();

  const demoProfiles = [
    { label: 'Akshay (Lead)', email: 'akshay@guidely.dev', role: 'STUDENT', desc: 'SAGE Bhopal, Cyber Security' },
    { label: 'Abhimanyu (Student)', email: 'abhimanyu@guidely.dev', role: 'STUDENT', desc: 'SAGE Bhopal, Cyber Security' },
    { label: 'Sapna (Student)', email: 'sapna@guidely.dev', role: 'STUDENT', desc: 'SAGE Bhopal, AI & ML' },
    { label: 'Prof. Nitin (Guide)', email: 'nitin.choudhary@sageuniversity.edu.in', role: 'MENTOR', desc: 'Assistant Professor' },
    { label: 'Priya (Google)', email: 'priya.sundaram@gmail.com', role: 'MENTOR', desc: 'Google Staff Eng' },
    { label: 'Dr. Rohan (MSFT)', email: 'rohan.mehra@microsoft.com', role: 'MENTOR', desc: 'Microsoft AI Lead' },
    { label: 'Admin (HOD)', email: 'admin@guidely.dev', role: 'ADMIN', desc: 'Dr Gourav Shrivastava' }
  ];

  return (
    <div
      style={{
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        padding: '6px 16px',
        fontSize: '0.78rem',
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
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            color: '#A5B4FC',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 600
          }}
        >
          <Sparkles size={13} />
          Demo Mode
        </span>
        <span style={{ color: '#94A3B8' }}>
          Switch test identities instantly:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {demoProfiles.map((profile) => {
          const isCurrent = user?.email.toLowerCase() === profile.email.toLowerCase();

          return (
            <button
              key={profile.email}
              onClick={() => quickLoginAs(profile.email)}
              style={{
                backgroundColor: isCurrent ? 'var(--primary)' : '#1E293B',
                color: isCurrent ? '#FFFFFF' : '#CBD5E1',
                border: isCurrent ? '1px solid #818CF8' : '1px solid #334155',
                borderRadius: 'var(--radius-xs)',
                padding: '3px 10px',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: isCurrent ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = '#334155';
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) e.currentTarget.style.backgroundColor = '#1E293B';
              }}
            >
              {isCurrent && <UserCheck size={12} />}
              {profile.label}
            </button>
          );
        })}

        {isAuthenticated && (
          <button
            onClick={logout}
            style={{
              backgroundColor: 'transparent',
              color: '#F87171',
              border: '1px solid #7F1D1D',
              borderRadius: 'var(--radius-xs)',
              padding: '3px 8px',
              fontSize: '0.76rem',
              cursor: 'pointer',
              fontWeight: 600,
              marginLeft: '4px'
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};
