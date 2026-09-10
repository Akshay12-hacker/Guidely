// Mobile Search Bar Component with Clear button and Filter trigger

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  filterActive?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search mentors, topics, skills...',
  onClear,
  onFilterPress,
  filterActive = false,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrap}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.input, typography.body]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearBtn}
          >
            <Icon name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.8}
          style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
        >
          <Icon
            name="filter"
            size={18}
            color={filterActive ? colors.primary : colors.textMain}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 46
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.textMain,
    height: '100%'
  },
  clearBtn: {
    padding: spacing.xs
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  }
});
