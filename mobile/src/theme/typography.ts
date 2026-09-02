// Mobile Typography Tokens for Android

import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.5
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.textMain,
    letterSpacing: -0.3
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.textMain
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.textMain
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textMain
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textMain
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textMain
  },
  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textMain
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textMuted
  },
  captionBold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textMuted
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700'
  }
};
