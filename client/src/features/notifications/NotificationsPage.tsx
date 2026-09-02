import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import { Notification } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  FolderKanban,
  CheckCheck
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { setUnreadNotifsCount } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications();
      const notifList = Array.isArray(data) ? data : (data?.notifications || []);
      setNotifications(notifList);
      const unread = notifList.filter((n: Notification) => !n.isRead).length;
      setUnreadNotifsCount(unread);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifsCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await api.markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    }

    if (notif.link) {
      onNavigate(notif.link.replace('/', ''));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'REQUEST_ACCEPTED':
      case 'REQUEST_REJECTED':
      case 'REQUEST_RECEIVED':
        return <BookOpen size={18} color="var(--primary)" />;
      case 'SESSION_SCHEDULED':
      case 'SESSION_CONFIRMED':
        return <Calendar size={18} color="var(--success)" />;
      case 'NEW_MESSAGE':
        return <MessageSquare size={18} color="#2563EB" />;
      case 'PROJECT_UPDATED':
      case 'TASK_ASSIGNED':
        return <FolderKanban size={18} color="#F59E0B" />;
      default:
        return <Bell size={18} color="var(--primary)" />;
    }
  };

  const filtered = notifications.filter(n => filter === 'ALL' || !n.isRead);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time updates regarding your sessions, projects, and proposals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} leftIcon={<CheckCheck size={16} />}>
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: filter === 'ALL' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            backgroundColor: filter === 'ALL' ? 'var(--primary-light)' : '#FFFFFF',
            color: filter === 'ALL' ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.84rem',
            fontWeight: filter === 'ALL' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: filter === 'UNREAD' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            backgroundColor: filter === 'UNREAD' ? 'var(--primary-light)' : '#FFFFFF',
            color: filter === 'UNREAD' ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.84rem',
            fontWeight: filter === 'UNREAD' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="No notifications"
          description="You're all caught up! New updates will appear here in real-time."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(n => (
            <Card
              key={n.id}
              padding="md"
              hoverable
              onClick={() => handleNotificationClick(n)}
              style={{
                cursor: 'pointer',
                backgroundColor: n.isRead ? '#FFFFFF' : 'var(--primary-light)',
                borderColor: n.isRead ? 'var(--border)' : 'var(--primary-border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)',
                  flexShrink: 0
                }}
              >
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.4 }}>
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '6px'
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
