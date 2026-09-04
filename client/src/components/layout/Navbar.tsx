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
  Menu,
  X,
  FolderKanban,
  Calendar,
  Search,
  ChevronDown,
  Camera
} from 'lucide-react';
import { ProfilePhotoModal } from '../ui/ProfilePhotoModal.js';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute, onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadNotifsCount } = useWebSocket();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
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

  const handleBrandClick = () => {
    if (!isAuthenticated) {
      onNavigate('landing');
    } else if (user?.role === 'ADMIN') {
      onNavigate('admin');
    } else if (user?.role === 'MENTOR') {
      onNavigate('mentor-dashboard');
    } else {
      onNavigate('student-dashboard');
    }
  };

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
        padding: '0 20px',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Left: Sidebar toggle + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation sidebar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.15s ease, color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <div
          onClick={handleBrandClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Compass size={19} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Guidly
          </span>
        </div>

        {/* Global search trigger for authenticated users */}
        {isAuthenticated && (
          <button
            onClick={() => onNavigate('find-mentor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '12px'
            }}
            className="search-shortcut"
          >
            <Search size={14} />
            <span>Search mentors & tech...</span>
          </button>
        )}
      </div>

      {/* Right Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isAuthenticated ? (
          <>
            {/* Quick action buttons (desktop) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    padding: '6px 10px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Compass size={16} />
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
                    padding: '6px 10px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FolderKanban size={16} />
                  <span>Project</span>
                </button>
              )}

              {/* Sessions Icon */}
              <button
                onClick={() => onNavigate(user?.role === 'MENTOR' ? 'mentor-sessions' : 'student-sessions')}
                title="Mentoring Sessions"
                aria-label="Mentoring sessions"
                style={{
                  background: currentRoute.includes('sessions') ? 'var(--primary-light)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentRoute.includes('sessions') ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Calendar size={18} />
              </button>

              {/* Messages Icon */}
              <button
                onClick={() => onNavigate('messages')}
                title="Direct Messages"
                aria-label="Direct messages"
                style={{
                  background: currentRoute === 'messages' ? 'var(--primary-light)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentRoute === 'messages' ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MessageSquare size={18} />
              </button>

              {/* Notifications Icon with unread dot */}
              <button
                onClick={() => onNavigate('notifications')}
                title="Notifications"
                aria-label="Notifications"
                style={{
                  background: currentRoute === 'notifications' ? 'var(--primary-light)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: currentRoute === 'notifications' ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '7px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadNotifsCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--danger)',
                      border: '1.5px solid #FFFFFF'
                    }}
                  />
                )}
              </button>
            </div>

            <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

            {/* User Profile Dropdown Menu */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setIsProfileOpen(prev => !prev)}
                aria-expanded={isProfileOpen}
                aria-label="User menu"
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Avatar
                  name={user?.fullName || 'User'}
                  src={user?.avatarUrl}
                  size="sm"
                  isOnline={true}
                  isVerified={user?.role === 'MENTOR'}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user?.role?.toLowerCase()}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {isProfileOpen && (
                <div
                  className="animate-scale-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <p style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {user?.fullName}
                    </p>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      gap: '8px',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserIcon size={15} color="var(--text-muted)" />
                    Profile & Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsPhotoModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Camera size={15} color="var(--primary)" />
                    Update Profile Photo
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
                      gap: '8px',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={15} color="var(--danger)" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
              Sign in
            </Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('register')}>
              Get Started
            </Button>
          </div>
        )}
      </div>

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </header>
  );
};
