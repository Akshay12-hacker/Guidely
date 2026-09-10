// Mobile Notification Item Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from '../icons/Icon';

export interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  onPress: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  message,
  createdAt,
  isRead,
  onPress
}) => {
  const getNotificationIcon = (): { name: IconName; color: string; bg: string } => {
    switch (type?.toLowerCase()) {
      case 'session_reminder':
      case 'session_confirmed':
      case 'session':
        return { name: 'calendar', color: colors.primary, bg: colors.primaryLight };
      case 'mentorship_request':
      case 'request_accepted':
      case 'request':
        return { name: 'users', color: colors.success, bg: colors.successLight };
      case 'message':
      case 'chat':
        return { name: 'message-square', color: colors.info, bg: colors.infoLight };
      case 'project':
      case 'task':
        return { name: 'folder-kanban', color: colors.warning, bg: colors.warningLight };
      default:
        return { name: 'bell', color: colors.primary, bg: colors.primaryLight };
    }
  };

  const formatTimeAgo = (isoStr: string) => {
    try {
      const now = Date.now();
      const past = new Date(isoStr).getTime();
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const iconInfo = getNotificationIcon();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.container, !isRead && styles.unreadContainer]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
        <Icon name={iconInfo.name} size={18} color={iconInfo.color} />
      </View>

      <View style={styles.contentCol}>
        <View style={styles.titleRow}>
          <Text
            style={[
              typography.captionBold,
              styles.titleText,
              !isRead && styles.unreadTitleText
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.timeText}>{formatTimeAgo(createdAt)}</Text>
        </View>

        <Text style={[typography.caption, styles.messageText]} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  unreadContainer: {
    backgroundColor: colors.primaryLight + '40'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  contentCol: {
    flex: 1,
    marginRight: spacing.sm
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  titleText: {
    color: colors.textMain,
    flex: 1,
    marginRight: spacing.xs
  },
  unreadTitleText: {
    fontWeight: '700',
    color: colors.primaryDark
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted
  },
  messageText: {
    color: colors.textMuted,
    lineHeight: 18
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  }
});
