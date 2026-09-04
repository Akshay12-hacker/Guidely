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
  Users,
  CheckCircle,
  FileWarning,
  Star,
  BarChart3,
  BookOpen,
  HelpCircle
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
    { id: 'student-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'find-mentor', label: 'Find Mentor', icon: <Compass size={18} /> },
    { id: 'student-project', label: 'My Project', icon: <FolderKanban size={18} /> },
    { id: 'student-sessions', label: 'Sessions', icon: <Calendar size={18} /> },
    { id: 'student-requests', label: 'Requests', icon: <BookOpen size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: unreadNotifsCount },
    { id: 'student-profile', label: 'Profile & Bio', icon: <User size={18} /> }
  ];

  const mentorNav: NavItem[] = [
    { id: 'mentor-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'mentor-requests', label: 'Requests', icon: <BookOpen size={18} /> },
    { id: 'mentor-students', label: 'Active Students', icon: <Users size={18} /> },
    { id: 'mentor-sessions', label: 'Sessions', icon: <Calendar size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: unreadNotifsCount },
    { id: 'mentor-profile', label: 'Mentor Profile', icon: <User size={18} /> }
  ];

  const adminNav: NavItem[] = [
    { id: 'admin-overview', label: 'Overview & KPIs', icon: <BarChart3 size={18} /> },
    { id: 'admin-users', label: 'Users Directory', icon: <Users size={18} /> },
    { id: 'admin-verifications', label: 'Verification Queue', icon: <CheckCircle size={18} /> },
    { id: 'admin-reports', label: 'Reports & Issues', icon: <FileWarning size={18} /> },
    { id: 'admin-reviews', label: 'Reviews Moderation', icon: <Star size={18} /> }
  ];

  const currentNav = user?.role === 'ADMIN' ? adminNav : user?.role === 'MENTOR' ? mentorNav : studentNav;

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Sidebar navigation"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 12px',
        flexShrink: 0,
        height: 'calc(100vh - var(--header-height))',
        position: 'sticky',
        top: 'var(--header-height)',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ padding: '0 10px 10px 10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {user?.role === 'ADMIN' ? 'Governance' : user?.role === 'MENTOR' ? 'Mentor Workspace' : 'Student Workspace'}
        </div>

        {currentNav.map((item) => {
          const isActive = currentRoute === item.id ||
            (item.id === 'student-dashboard' && currentRoute === 'dashboard') ||
            (item.id === 'mentor-dashboard' && currentRoute === 'dashboard');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                transition: 'background-color 0.15s ease, color 0.15s ease'
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
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}>
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
                    padding: '1px 6px',
                    fontSize: '0.7rem',
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

      {/* Guidance footnote */}
      <div
        style={{
          backgroundColor: 'var(--bg-body)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          border: '1px solid var(--border)',
          marginTop: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <HelpCircle size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Guidly Engineering
          </span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {user?.role === 'STUDENT'
            ? 'Collaborate with verified mentors on system architecture, milestones, and code reviews.'
            : user?.role === 'MENTOR'
            ? 'Schedule 1-on-1 video sessions and unblock students through real architecture reviews.'
            : 'Moderate verified credentials and maintain academic integrity.'}
        </p>
      </div>
    </aside>
  );
};
