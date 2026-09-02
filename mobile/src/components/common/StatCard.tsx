// Mobile StatCard KPI Component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from '../icons/Icon';

export interface StatCardProps {
  label: string;
  value: string | number;
  iconName: IconName;
  iconBg?: string;
  iconColor?: string;
  changeText?: string;
  isPositive?: boolean;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  iconBg = colors.primaryLight,
  iconColor = colors.primaryDark,
  changeText,
  isPositive = true,
  style
}) => {
  return (
    <Card padding="md" style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={[typography.captionBold, styles.label]}>{label}</Text>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={18} color={iconColor} />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={[typography.h2, styles.value]}>{value}</Text>
        {changeText ? (
          <View
            style={[
              styles.deltaBadge,
              {
                backgroundColor: isPositive ? colors.successLight : colors.dangerLight,
                borderColor: isPositive ? colors.successBorder : colors.dangerBorder
              }
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                { color: isPositive ? colors.successDark : colors.dangerDark, fontSize: 10.5 }
              ]}
            >
              {changeText}
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2
  },
  label: {
    color: colors.textMuted
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs
  },
  value: {
    color: colors.textMain
  },
  deltaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.xs,
    borderWidth: 1
  }
});
