// Mobile Avatar Component with online indicator and verified shield

import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { formatInitials, getAvatarColor } from '../../utils/formatters';
import { Icon } from '../icons/Icon';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isVerified?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  isOnline,
  isVerified,
  style
}) => {
  const getDimension = () => {
    switch (size) {
      case 'xs': return 28;
      case 'sm': return 36;
      case 'lg': return 56;
      case 'xl': return 74;
      case 'md':
      default:
        return 44;
    }
  };

  const dim = getDimension();
  const initials = formatInitials(name);
  const colorTheme = getAvatarColor(name);

  return (
    <View style={[{ width: dim, height: dim, position: 'relative' }, style]}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={[
            styles.image,
            { width: dim, height: dim, borderRadius: dim / 2 }
          ]}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: colorTheme.bg
            }
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              { color: colorTheme.text, fontSize: dim * 0.38 }
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* Online indicator dot */}
      {isOnline !== undefined && (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(9, dim * 0.28),
              height: Math.max(9, dim * 0.28),
              borderRadius: 99,
              backgroundColor: isOnline ? colors.success : colors.textSubtle
            }
          ]}
        />
      )}

      {/* Verified Shield Badge */}
      {isVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: Math.max(14, dim * 0.32),
              height: Math.max(14, dim * 0.32)
            }
          ]}
        >
          <Icon name="shield-check" size={Math.max(10, dim * 0.24)} color={colors.white} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.surface
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface
  },
  initialsText: {
    fontWeight: '700'
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.surface
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.verified,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface
  }
});
