// Mobile Project Workspace Card Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { Avatar } from './Avatar';
import { Icon } from '../icons/Icon';
import { Card } from './Card';

export interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  progressPercent: number;
  tasksCompleted?: number;
  totalTasks?: number;
  mentorName?: string;
  mentorAvatar?: string;
  status?: string;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  progressPercent = 0,
  tasksCompleted = 0,
  totalTasks = 0,
  mentorName,
  mentorAvatar,
  status = 'In Progress',
  onPress
}) => {
  return (
    <Card padding="md" style={styles.card}>
      <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
        {/* Top Header */}
        <View style={styles.topRow}>
          <Badge
            variant={progressPercent >= 100 ? 'success' : 'primary'}
          >
            {status}
          </Badge>
          <View style={styles.progressPercentRow}>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={[typography.h3, styles.title]} numberOfLines={2}>
          {title}
        </Text>
        {description && (
          <Text style={[typography.caption, styles.desc]} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressWrap}>
          <ProgressBar value={progressPercent} color={colors.primary} />
        </View>

        {/* Meta Row: Tasks count + Mentor */}
        <View style={styles.metaRow}>
          <View style={styles.tasksMeta}>
            <Icon name="check-circle" size={14} color={colors.primary} />
            <Text style={styles.metaText}>
              {totalTasks > 0 ? `${tasksCompleted} of ${totalTasks} tasks done` : 'Active milestones'}
            </Text>
          </View>

          {mentorName && (
            <View style={styles.mentorMeta}>
              <Avatar name={mentorName} src={mentorAvatar} size="xs" />
              <Text style={styles.mentorText} numberOfLines={1}>
                {mentorName}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Action Trigger */}
      <TouchableOpacity
        style={styles.openBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.openBtnText}>Open Project Workspace</Text>
        <Icon name="chevron-right" size={15} color={colors.primary} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  progressPercentRow: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  title: {
    color: colors.textMain,
    marginTop: 2
  },
  desc: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18
  },
  progressWrap: {
    marginVertical: spacing.sm
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  tasksMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500'
  },
  mentorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  mentorText: {
    fontSize: 12,
    color: colors.textMain,
    maxWidth: 120
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm
  },
  openBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
  }
});
