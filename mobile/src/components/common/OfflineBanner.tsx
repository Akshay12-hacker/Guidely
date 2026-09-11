// Offline Connectivity Banner for Guidely Mobile
// Monitors network connectivity via @react-native-community/netinfo and renders a non-intrusive warning with Retry action

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { Icon } from '../icons/Icon';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // If connected is false or isInternetReachable is false
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const state = await NetInfo.fetch();
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.leftRow}>
        <Icon name="alert-circle" size={16} color={colors.white} />
        <Text style={[typography.captionBold, styles.bannerText]}>
          No Internet Connection. Working offline.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleRetry}
        disabled={isRetrying}
        style={styles.retryBtn}
        activeOpacity={0.7}
      >
        <Text style={[typography.captionBold, styles.retryText]}>
          {isRetrying ? 'Checking...' : 'Retry'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    zIndex: 9999
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1
  },
  bannerText: {
    color: colors.white,
    fontSize: 12
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm
  },
  retryText: {
    color: colors.white,
    fontSize: 11
  }
});
