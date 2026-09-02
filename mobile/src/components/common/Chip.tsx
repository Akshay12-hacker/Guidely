// Mobile Filter & Skill Tag Chip Component

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filter' | 'tag';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'filter',
  style,
  textStyle
}) => {
  const isTag = variant === 'tag';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? colors.primaryLight
            : isTag
            ? colors.surfaceSubtle
            : colors.surface,
          borderColor: selected
            ? colors.primary
            : isTag
            ? colors.surfaceSubtle
            : colors.border
        },
        style
      ]}
    >
      <Text
        style={[
          typography.captionBold,
          {
            color: selected ? colors.primary : colors.textMain,
            fontSize: isTag ? 11.5 : 12.5
          },
          textStyle
        ]}
      >
        {label}
      </Text>
      {selected && (
        <View style={styles.checkSlot}>
          <Icon name="check" size={11} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    marginRight: spacing.xs + 2,
    marginBottom: spacing.xs + 2
  },
  checkSlot: {
    marginLeft: 4
  }
});
