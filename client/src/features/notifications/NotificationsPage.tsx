import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import { Notification } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  Star,
  Check
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate?: (route: string, params?: any) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { setUnreadNotifsCount } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadNotifsCount(res.unreadCount);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    } catch {
      // fallback
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifsCount(0);
    } catch {
      // fallback
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SESSION_SCHEDULED':
      case 'SESSION_REMINDER':
      case 'SESSION_CONFIRMED':
        return <Calendar size={18} color="var(--primary)" />;
      case 'NEW_MESSAGE':
        return <MessageSquare size={18} color="var(--info)" />;
      case 'REQUEST_ACCEPTED':
      case 'REQUEST_RECEIVED':
        return <BookOpen size={18} color="var(--warning)" />;
      case 'REVIEW_RECEIVED':
        return <Star size={18} color="#F59E0B" />;
      default:
        return <Bell size={18} color="var(--primary)" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayedNotifications = filter === 'ALL'
    ? notifications
    : notifications.filter(n => !n.isRead);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Notifications & Updates
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Stay updated with meeting invites, proposal responses, and chat alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} leftIcon={<Check size={14} />}>
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs
        activeTab={filter}
        onChange={(tab) => setFilter(tab as any)}
        tabs={[
          { id: 'ALL', label: 'All Notifications', count: notifications.length },
          { id: 'UNREAD', label: 'Unread Only', count: unreadCount }
        ]}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : displayedNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          description="You will be notified when your mentors schedule sessions or update project milestones."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedNotifications.map(notif => (
            <Card
              key={notif.id}
              padding="md"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '14px',
                backgroundColor: notif.isRead ? '#FFFFFF' : 'var(--primary-light)',
                borderColor: notif.isRead ? 'var(--border)' : 'var(--primary-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: notif.isRead ? 'var(--bg-subtle)' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    )}
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {notif.message}
                  </p>

                  <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notif.id)}>
                  Mark Read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
