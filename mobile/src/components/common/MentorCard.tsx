// Mobile Mentor Card Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Chip } from './Chip';
import { Icon } from '../icons/Icon';
import { Card } from './Card';

export interface MentorCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  company?: string;
  rating?: number;
  reviewsCount?: number;
  skills?: string[];
  matchScore?: number;
  matchReason?: string;
  isVerified?: boolean;
  onPress: () => void;
  onRequestPress?: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  name,
  avatarUrl,
  headline,
  company,
  rating = 4.9,
  reviewsCount = 12,
  skills = [],
  matchScore,
  matchReason,
  isVerified = true,
  onPress,
  onRequestPress
}) => {
  const displaySkills = skills.slice(0, 3);
  const remainingCount = skills.length - displaySkills.length;

  return (
    <Card padding="md" style={styles.card}>
      <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
        {/* Top Row: Avatar + Info + Rating */}
        <View style={styles.topRow}>
          <Avatar name={name} src={avatarUrl} size="lg" />
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={[typography.h3, styles.nameText]} numberOfLines={1}>
                {name}
              </Text>
              {isVerified && (
                <Icon name="shield-check" size={16} color={colors.verified} style={{ marginLeft: 4 }} />
              )}
            </View>

            {headline ? (
              <Text style={[typography.caption, styles.headlineText]} numberOfLines={2}>
                {headline}
              </Text>
            ) : company ? (
              <Text style={[typography.caption, styles.headlineText]} numberOfLines={1}>
                Engineer at {company}
              </Text>
            ) : null}

            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>
                {rating.toFixed(1)}{' '}
                <Text style={styles.reviewsCount}>({reviewsCount} reviews)</Text>
              </Text>
            </View>
          </View>

          {matchScore !== undefined && matchScore > 0 && (
            <Badge
              variant="success"
              style={styles.matchBadge}
            >
              {`${matchScore}% Match`}
            </Badge>
          )}
        </View>

        {/* AI Match Reason snippet if available */}
        {matchReason && (
          <View style={styles.matchReasonBox}>
            <Icon name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.matchReasonText} numberOfLines={2}>
              {matchReason}
            </Text>
          </View>
        )}

        {/* Skills Chips */}
        {displaySkills.length > 0 && (
          <View style={styles.skillsRow}>
            {displaySkills.map((skill, index) => (
              <Chip key={index} label={skill} variant="tag" />
            ))}
            {remainingCount > 0 && (
              <Chip label={`+${remainingCount}`} variant="tag" />
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Actions Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.75}
          style={styles.profileBtn}
        >
          <Text style={styles.profileBtnText}>View Profile</Text>
        </TouchableOpacity>

        {onRequestPress && (
          <TouchableOpacity
            onPress={onRequestPress}
            activeOpacity={0.75}
            style={styles.requestBtn}
          >
            <Icon name="send" size={14} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.requestBtnText}>Request</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.xs
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nameText: {
    color: colors.textMain,
    fontWeight: '700'
  },
  headlineText: {
    color: colors.textMuted,
    marginTop: 2
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
    marginLeft: 4
  },
  reviewsCount: {
    color: colors.textMuted,
    fontWeight: '400'
  },
  matchBadge: {
    alignSelf: 'flex-start'
  },
  matchReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    gap: 6
  },
  matchReasonText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 16
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.sm
  },
  profileBtn: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle
  },
  profileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary
  },
  requestBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white
  }
});
