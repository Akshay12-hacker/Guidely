// Mobile Animated ProgressBar Component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color = colors.primary,
  style
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const getHeight = () => {
    switch (size) {
      case 'sm': return 6;
      case 'lg': return 12;
      case 'md':
      default:
        return 8;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height: getHeight() }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              height: getHeight()
            }
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[typography.captionBold, styles.label]}>
          {clamped}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  track: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  fill: {
    borderRadius: radius.full
  },
  label: {
    marginLeft: spacing.sm,
    color: colors.textMain,
    minWidth: 32,
    textAlign: 'right'
  }
});
