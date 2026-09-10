// Mobile Mentorship Session Card Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Icon } from '../icons/Icon';
import { Card } from './Card';

export interface SessionCardProps {
  id: string;
  topic: string;
  counterpartName: string;
  counterpartAvatar?: string;
  counterpartRole?: 'Mentor' | 'Student';
  scheduledAt: string;
  durationMinutes?: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  meetingUrl?: string;
  onJoinMeeting?: () => void;
  onLeaveReview?: () => void;
  onPress?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  topic,
  counterpartName,
  counterpartAvatar,
  counterpartRole = 'Mentor',
  scheduledAt,
  durationMinutes = 45,
  status,
  meetingUrl,
  onJoinMeeting,
  onLeaveReview,
  onPress
}) => {
  const formatSessionDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const formatSessionTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'danger';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'neutral';
      default:
        return 'primary';
    }
  };

  return (
    <Card padding="md" style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {/* Header: Status & Duration */}
        <View style={styles.headerRow}>
          <Badge
            variant={getStatusVariant()}
          >
            {status.replace('_', ' ')}
          </Badge>
          <View style={styles.durationBadge}>
            <Icon name="clock" size={12} color={colors.textMuted} />
            <Text style={styles.durationText}>{durationMinutes} mins</Text>
          </View>
        </View>

        {/* Topic Title */}
        <Text style={[typography.h3, styles.topicText]} numberOfLines={2}>
          {topic}
        </Text>

        {/* Counterpart Row */}
        <View style={styles.counterpartRow}>
          <Avatar name={counterpartName} src={counterpartAvatar} size="sm" />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={[typography.captionBold, styles.nameText]} numberOfLines={1}>
              {counterpartName}
            </Text>
            <Text style={[typography.caption, styles.roleText]}>
              {counterpartRole}
            </Text>
          </View>
        </View>

        {/* Time Info Box */}
        <View style={styles.timeBox}>
          <View style={styles.timeItem}>
            <Icon name="calendar" size={14} color={colors.primary} />
            <Text style={styles.timeItemText}>{formatSessionDate(scheduledAt)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeItem}>
            <Icon name="clock" size={14} color={colors.primary} />
            <Text style={styles.timeItemText}>{formatSessionTime(scheduledAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Footer */}
      {(onJoinMeeting || onLeaveReview) && (
        <View style={styles.footerRow}>
          {status === 'COMPLETED' && onLeaveReview ? (
            <TouchableOpacity
              onPress={onLeaveReview}
              activeOpacity={0.8}
              style={styles.reviewBtn}
            >
              <Icon name="star" size={14} color={colors.warning} style={{ marginRight: 6 }} />
              <Text style={styles.reviewBtnText}>Leave Review</Text>
            </TouchableOpacity>
          ) : (status === 'SCHEDULED' || status === 'IN_PROGRESS') && onJoinMeeting ? (
            <TouchableOpacity
              onPress={onJoinMeeting}
              activeOpacity={0.8}
              style={[
                styles.joinBtn,
                status === 'IN_PROGRESS' && styles.joinBtnActive
              ]}
            >
              <Icon name="video" size={15} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.joinBtnText}>
                {status === 'IN_PROGRESS' ? 'Join Live Meeting' : 'Join Video Call'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  durationText: {
    fontSize: 12,
    color: colors.textMuted
  },
  topicText: {
    color: colors.textMain,
    marginVertical: 4
  },
  counterpartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs
  },
  nameText: {
    color: colors.textMain
  },
  roleText: {
    color: colors.textMuted,
    fontSize: 11
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  timeItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMain
  },
  timeDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md
  },
  footerRow: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'flex-end'
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md
  },
  joinBtnActive: {
    backgroundColor: colors.danger
  },
  joinBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600'
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md
  },
  reviewBtnText: {
    color: colors.textMain,
    fontSize: 13,
    fontWeight: '600'
  }
});
