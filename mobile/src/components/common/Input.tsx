// Mobile SaaS Input Component

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[typography.captionBold, styles.label]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: colors.surface
          }
        ]}
      >
        {leftIcon && <View style={styles.leftIconSlot}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            typography.body,
            { color: colors.textMain },
            style
          ]}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconSlot}>{rightIcon}</View>}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeSlot}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={[typography.caption, styles.errorText]}>{error}</Text>
      ) : helperText ? (
        <Text style={[typography.caption, styles.helperText]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%'
  },
  label: {
    color: colors.textMain,
    marginBottom: spacing.xs + 2
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 14.5
  },
  leftIconSlot: {
    marginRight: spacing.sm
  },
  rightIconSlot: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  eyeSlot: {
    padding: spacing.xs
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.xs
  },
  helperText: {
    color: colors.textMuted,
    marginTop: spacing.xs
  }
});
