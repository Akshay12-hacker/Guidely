// Mobile Error State Component with Retry Action

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not load this content. Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try Again',
  secondaryAction,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Icon name="alert-circle" size={32} color={colors.danger} />
      </View>

      <Text style={[typography.h3, styles.title]}>{title}</Text>
      <Text style={[typography.body, styles.message]}>{message}</Text>

      <View style={styles.actionRow}>
        {onRetry && (
          <Button
            onPress={onRetry}
            variant="primary"
            size="md"
            leftIcon={<Icon name="refresh" size={16} color={colors.white} />}
          >
            {retryLabel}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onPress={secondaryAction.onPress}
            variant="outline"
            size="md"
          >
            {secondaryAction.label}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    minHeight: 260
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: spacing.lg
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm
  }
});
