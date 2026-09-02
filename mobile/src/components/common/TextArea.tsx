// Mobile Multi-line TextArea Component

import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
  containerStyle?: ViewStyle;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  rows = 4,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const minHeight = Math.max(90, rows * 22);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[typography.captionBold, styles.label]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: colors.surface,
            minHeight
          }
        ]}
      >
        <TextInput
          style={[
            styles.input,
            typography.body,
            { color: colors.textMain, minHeight: minHeight - 16 },
            style
          ]}
          placeholderTextColor={colors.textSubtle}
          multiline
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
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
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md
  },
  input: {
    padding: 0,
    fontSize: 14.5,
    lineHeight: 20
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
