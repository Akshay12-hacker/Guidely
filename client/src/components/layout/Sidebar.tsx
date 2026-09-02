import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import {
  LayoutDashboard,
  Compass,
  FolderKanban,
  Calendar,
  MessageSquare,
  Bell,
  User,
  Shield,
  Users,
  CheckCircle,
  FileWarning,
  Star,
  BarChart3,
  BookOpen,
  HelpCircle,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, isOpen = true }) => {
  const { user } = useAuth();
  const { unreadNotifsCount } = useWebSocket();

  const studentNav: NavItem[] = [
    { id: 'student-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'find-mentor', label: 'Find Mentor', icon: <Compass size={19} /> },
    { id: 'student-project', label: 'My Project', icon: <FolderKanban size={19} /> },
    { id: 'student-sessions', label: 'Sessions', icon: <Calendar size={19} /> },
    { id: 'student-requests', label: 'Requests', icon: <BookOpen size={19} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={19} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={19} />, badge: unreadNotifsCount },
    { id: 'student-profile', label: 'Profile & Bio', icon: <User size={19} /> }
  ];

  const mentorNav: NavItem[] = [
    { id: 'mentor-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'mentor-requests', label: 'Mentorship Requests', icon: <BookOpen size={19} /> },
    { id: 'mentor-students', label: 'Active Students', icon: <Users size={19} /> },
    { id: 'mentor-sessions', label: 'Sessions', icon: <Calendar size={19} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={19} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={19} />, badge: unreadNotifsCount },
    { id: 'mentor-profile', label: 'Mentor Profile', icon: <User size={19} /> }
  ];

  const adminNav: NavItem[] = [
    { id: 'admin-overview', label: 'Overview & KPIs', icon: <BarChart3 size={19} /> },
    { id: 'admin-users', label: 'Users Directory', icon: <Users size={19} /> },
    { id: 'admin-verifications', label: 'Verification Queue', icon: <CheckCircle size={19} /> },
    { id: 'admin-reports', label: 'Reports & Issues', icon: <FileWarning size={19} /> },
    { id: 'admin-reviews', label: 'Reviews Moderation', icon: <Star size={19} /> }
  ];

  const currentNav = user?.role === 'ADMIN' ? adminNav : user?.role === 'MENTOR' ? mentorNav : studentNav;

  if (!isOpen) return null;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        flexShrink: 0,
        height: 'calc(100vh - var(--header-height))',
        position: 'sticky',
        top: 'var(--header-height)',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '0 12px 14px 12px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {user?.role === 'ADMIN' ? 'Platform Governance' : user?.role === 'MENTOR' ? 'Mentor Workspace' : 'Student Workspace'}
        </div>

        {currentNav.map((item) => {
          const isActive = currentRoute === item.id || (item.id === 'student-dashboard' && currentRoute === 'dashboard') || (item.id === 'mentor-dashboard' && currentRoute === 'dashboard');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-subtle)', display: 'flex' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Pro Tip Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--border)',
          marginTop: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <HelpCircle size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Guidly Mentorship
          </span>
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {user?.role === 'STUDENT'
            ? 'Collaborate with your mentor on architecture, milestones, and real code reviews.'
            : user?.role === 'MENTOR'
            ? 'Schedule video sessions and guide students through complex system design.'
            : 'Moderate verified credentials and ensure platform integrity.'}
        </p>
      </div>
    </aside>
  );
};
