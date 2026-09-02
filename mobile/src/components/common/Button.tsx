// Mobile SaaS Button Component

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false
}) => {
  const getContainerStyles = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: 'transparent',
      opacity: disabled ? 0.6 : 1
    };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.xs + 2;
        base.paddingHorizontal = spacing.md;
        base.minHeight = 36;
        break;
      case 'lg':
        base.paddingVertical = spacing.md + 2;
        base.paddingHorizontal = spacing.xxl;
        base.minHeight = 52;
        break;
      case 'md':
      default:
        base.paddingVertical = spacing.sm + 2;
        base.paddingHorizontal = spacing.lg;
        base.minHeight = 44;
        break;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.secondaryLight;
        base.borderColor = colors.border;
        break;
      case 'outline':
        base.backgroundColor = colors.surface;
        base.borderColor = colors.border;
        break;
      case 'ghost':
        base.backgroundColor = colors.transparent;
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        break;
      case 'success':
        base.backgroundColor = colors.success;
        break;
      case 'primary':
      default:
        base.backgroundColor = colors.primary;
        base = { ...base, ...shadows.sm };
        break;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textSubtle;
    switch (variant) {
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.textMain;
      case 'danger':
      case 'success':
      case 'primary':
      default:
        return colors.white;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[getContainerStyles(), style]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text
            style={[
              typography.button,
              { color: getTextColor(), fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14.5 },
              textStyle
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftIconContainer: {
    marginRight: spacing.sm
  },
  rightIconContainer: {
    marginLeft: spacing.sm
  }
});
