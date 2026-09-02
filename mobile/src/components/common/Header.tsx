// Mobile Top Header Component with Back button, Avatar, Notification trigger

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';
import { useWebSocket } from '../../context/WebSocketContext';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  onNotificationPress?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  onNotificationPress,
  style
}) => {
  const { unreadNotifsCount } = useWebSocket();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftSlot}>
        {showBack && onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-left" size={20} color={colors.textMain} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleSlot}>
          {title ? (
            <Text style={[typography.h3, styles.titleText]} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Icon name="compass" size={16} color={colors.white} />
              </View>
              <Text style={[typography.h3, styles.brandText]}>
                Guidely<Text style={{ color: colors.primary }}>.</Text>
              </Text>
            </View>
          )}
          {subtitle && (
            <Text style={[typography.caption, styles.subtitleText]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSlot}>
        {rightAction}
        {onNotificationPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotificationPress}
            style={styles.bellBtn}
          >
            <Icon name="bell" size={20} color={colors.textMain} />
            {unreadNotifsCount > 0 && (
              <View style={styles.badgeDot}>
                {unreadNotifsCount > 9 ? (
                  <Text style={styles.badgeCountText}>9+</Text>
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    minHeight: 56
  },
  leftSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backBtn: {
    marginRight: spacing.md,
    padding: spacing.xs
  },
  titleSlot: {
    flex: 1
  },
  titleText: {
    color: colors.textMain
  },
  subtitleText: {
    color: colors.textMuted,
    marginTop: 1
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2
  },
  brandIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandText: {
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.5
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeCountText: {
    fontSize: 7,
    fontWeight: '800',
    color: colors.white
  }
});
