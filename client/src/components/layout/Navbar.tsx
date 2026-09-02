import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import { Avatar } from '../ui/Avatar.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import {
  Compass,
  Bell,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Layers,
  Menu,
  X,
  Shield,
  FolderKanban,
  Calendar,
  Search
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute, onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadNotifsCount } = useWebSocket();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Left: Brand Logo & Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Menu size={22} />
          </button>
        )}

        <div
          onClick={() => onNavigate(isAuthenticated ? (user?.role === 'ADMIN' ? 'admin' : user?.role === 'MENTOR' ? 'mentor-dashboard' : 'student-dashboard') : 'landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
            }}
          >
            <Compass size={22} />
          </div>
          <span style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Guidly<span style={{ color: 'var(--primary)' }}>.</span>
          </span>
        </div>

        {/* Search quick button */}
        {isAuthenticated && (
          <div
            onClick={() => onNavigate('find-mentor')}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '20px'
            }}
            className="search-shortcut"
          >
            <Search size={15} />
            <span>Search mentors, topics, tech...</span>
          </div>
        )}
      </div>

      {/* Right Navigation & Profile Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isAuthenticated ? (
          <>
            {/* Quick Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {user?.role === 'STUDENT' && (
                <button
                  onClick={() => onNavigate('find-mentor')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: currentRoute === 'find-mentor' ? 'var(--primary-light)' : 'transparent',
                    color: currentRoute === 'find-mentor' ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Compass size={17} />
                  <span>Find Mentor</span>
                </button>
              )}

              {user?.role === 'STUDENT' && (
                <button
                  onClick={() => onNavigate('student-project')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: currentRoute.includes('project') ? 'var(--primary-light)' : 'transparent',
                    color: currentRoute.includes('project') ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FolderKanban size={17} />
                  <span>My Project</span>
                </button>
              )}

              {/* Sessions Icon */}
              <button
                onClick={() => onNavigate(user?.role === 'MENTOR' ? 'mentor-sessions' : 'student-sessions')}
                title="Mentoring Sessions"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentRoute.includes('sessions') ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Calendar size={20} />
              </button>

              {/* Messages Icon */}
              <button
                onClick={() => onNavigate('messages')}
                title="Direct Messages"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentRoute === 'messages' ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <MessageSquare size={20} />
              </button>

              {/* Notifications Icon */}
              <button
                onClick={() => onNavigate('notifications')}
                title="Notifications"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentRoute === 'notifications' ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={20} />
                {unreadNotifsCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--danger)',
                      border: '2px solid #FFFFFF'
                    }}
                  />
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <div
                onClick={() => setIsProfileOpen(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Avatar name={user?.fullName || 'User'} src={user?.avatarUrl} size="sm" isOnline={true} isVerified={user?.role === 'MENTOR'} />
                <div style={{ display: 'none', flexDirection: 'column', alignItems: 'flex-start' }} className="user-info-text">
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user?.fullName}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {isProfileOpen && (
                <div
                  className="animate-scale-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {user?.fullName}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </p>
                    <div style={{ marginTop: '6px' }}>
                      <Badge variant={user?.role === 'ADMIN' ? 'danger' : user?.role === 'MENTOR' ? 'verified' : 'primary'} size="sm">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate(user?.role === 'MENTOR' ? 'mentor-profile' : user?.role === 'STUDENT' ? 'student-profile' : 'admin');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserIcon size={16} color="var(--text-muted)" />
                    Profile & Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      onNavigate('landing');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} color="var(--danger)" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
              Log in
            </Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('register')}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
