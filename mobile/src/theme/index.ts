import { colors } from './colors';
import { spacing, radius, shadows } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  typography
};

export type Theme = typeof theme;
export { colors, spacing, radius, shadows, typography };
