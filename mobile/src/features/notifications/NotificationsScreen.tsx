// Mobile In-App Notifications Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useWebSocket } from '../../context/WebSocketContext';
import { notificationService } from '../../services/notification.service';
import { Notification } from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon, IconName } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRelativeTime } from '../../utils/formatters';

export interface NotificationsScreenProps {
  onBack?: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack, onNavigate }) => {
  const { setUnreadNotifsCount } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadNotifsCount(data.unreadCount || 0);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [setUnreadNotifsCount]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifs();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifsCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationPress = async (n: Notification) => {
    if (!n.isRead) {
      await notificationService.markRead(n.id);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    }

    if (n.link) {
      if (n.link.includes('projects') || n.link.includes('workspace')) {
        onNavigate('project');
      } else if (n.link.includes('sessions')) {
        onNavigate('sessions');
      } else if (n.link.includes('requests')) {
        onNavigate('requests');
      } else if (n.link.includes('messages') || n.link.includes('chat')) {
        onNavigate('messages');
      }
    }
  };

  const getNotifIcon = (type: string): { name: IconName; color: string; bg: string } => {
    switch (type) {
      case 'REQUEST_ACCEPTED':
      case 'VERIFICATION_APPROVED':
        return { name: 'check-circle', color: colors.successDark, bg: colors.successLight };
      case 'REQUEST_RECEIVED':
      case 'SESSION_REQUESTED':
        return { name: 'calendar', color: colors.primary, bg: colors.primaryLight };
      case 'NEW_MESSAGE':
        return { name: 'message-square', color: colors.info, bg: colors.infoLight };
      case 'REQUEST_INFO':
      case 'SESSION_REMINDER':
        return { name: 'clock', color: colors.warningDark, bg: colors.warningLight };
      default:
        return { name: 'bell', color: colors.primary, bg: colors.primaryLight };
    }
  };

  const filtered = filterUnreadOnly ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={!!onBack}
        onBack={onBack}
        title="Notifications"
        subtitle="Platform alerts, meeting reminders and updates"
        rightAction={
          notifications.some(n => !n.isRead) ? (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                Mark All Read
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setFilterUnreadOnly(false)}
          style={[styles.filterChip, !filterUnreadOnly && styles.activeFilterChip]}
        >
          <Text style={[typography.captionBold, { color: !filterUnreadOnly ? colors.primary : colors.textMuted }]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterUnreadOnly(true)}
          style={[styles.filterChip, filterUnreadOnly && styles.activeFilterChip]}
        >
          <Text style={[typography.captionBold, { color: filterUnreadOnly ? colors.primary : colors.textMuted }]}>
            Unread ({notifications.filter(n => !n.isRead).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {isLoading ? (
          <View>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            iconName="bell"
            title="All Clear!"
            description="You don't have any notifications right now."
          />
        ) : (
          filtered.map(item => {
            const iconInfo = getNotifIcon(item.type);
            return (
              <Card
                key={item.id}
                padding="md"
                style={[
                  styles.notifCard,
                  !item.isRead && styles.unreadNotifCard
                ]}
                onPress={() => handleNotificationPress(item)}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
                    <Icon name={iconInfo.name} size={18} color={iconInfo.color} />
                  </View>

                  <View style={styles.notifInfo}>
                    <View style={styles.notifHeaderRow}>
                      <Text style={[typography.bodyBold, styles.notifTitle]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[typography.caption, styles.timeText]}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>

                    <Text style={[typography.body, styles.notifMessage]} numberOfLines={2}>
                      {item.message}
                    </Text>
                  </View>

                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle
  },
  activeFilterChip: {
    backgroundColor: colors.primaryLight
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  notifCard: {
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  unreadNotifCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF'
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifInfo: {
    flex: 1,
    marginLeft: spacing.md,
    paddingRight: spacing.xs
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  notifTitle: {
    color: colors.textMain,
    flex: 1
  },
  timeText: {
    color: colors.textSubtle,
    fontSize: 10.5,
    marginLeft: 6
  },
  notifMessage: {
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
    fontSize: 13
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 6
  }
});
