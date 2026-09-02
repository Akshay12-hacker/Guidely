// Mobile Status Badge / Pill Component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from '../icons/Icon';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'verified'
  | 'accepted'
  | 'completed'
  | 'in_progress'
  | 'pending'
  | 'urgent';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: IconName;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  style,
  textStyle
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight, color: colors.primaryDark, border: colors.primaryBorder };
      case 'success':
      case 'accepted':
      case 'completed':
        return { bg: colors.successLight, color: colors.successDark, border: colors.successBorder, defaultIcon: 'check-circle' as IconName };
      case 'verified':
        return { bg: colors.verifiedLight, color: colors.verified, border: colors.verifiedBorder, defaultIcon: 'shield-check' as IconName };
      case 'warning':
      case 'pending':
        return { bg: colors.warningLight, color: colors.warningDark, border: colors.warningBorder, defaultIcon: 'clock' as IconName };
      case 'danger':
      case 'urgent':
        return { bg: colors.dangerLight, color: colors.dangerDark, border: colors.dangerBorder, defaultIcon: 'alert-circle' as IconName };
      case 'info':
      case 'in_progress':
        return { bg: colors.infoLight, color: colors.info, border: colors.infoBorder };
      case 'neutral':
      default:
        return { bg: colors.surfaceSubtle, color: colors.textMuted, border: colors.border };
    }
  };

  const currentTheme = getTheme();
  const isSm = size === 'sm';
  const iconToRender = icon || currentTheme.defaultIcon;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? spacing.xs + 2 : spacing.sm + 2
        },
        style
      ]}
    >
      {iconToRender && (
        <View style={styles.iconSlot}>
          <Icon name={iconToRender} size={isSm ? 11 : 13} color={currentTheme.color} />
        </View>
      )}
      <Text
        style={[
          typography.badge,
          {
            color: currentTheme.color,
            fontSize: isSm ? 10.5 : 11.5
          },
          textStyle
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  iconSlot: {
    marginRight: 4
  }
});
