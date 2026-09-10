// Mobile Bottom Navigation Tab Bar with active pill & badge counters

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from '../icons/Icon';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';

export interface TabItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: number;
}

export interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  const { user } = useAuth();
  const { unreadNotifsCount } = useWebSocket();

  const studentTabs: TabItem[] = [
    { id: 'dashboard', label: 'Home', icon: 'compass' },
    { id: 'discover', label: 'Discover', icon: 'users' },
    { id: 'messages', label: 'Messages', icon: 'message-square' },
    { id: 'sessions', label: 'Sessions', icon: 'calendar' },
    { id: 'profile', label: 'Profile', icon: 'users' }
  ];

  const mentorTabs: TabItem[] = [
    { id: 'dashboard', label: 'Home', icon: 'compass' },
    { id: 'requests', label: 'Students', icon: 'users' },
    { id: 'messages', label: 'Messages', icon: 'message-square' },
    { id: 'sessions', label: 'Sessions', icon: 'calendar' },
    { id: 'profile', label: 'Profile', icon: 'users' }
  ];

  const adminTabs: TabItem[] = [
    { id: 'dashboard', label: 'KPIs', icon: 'bar-chart' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'verifications', label: 'Verify', icon: 'shield-check' },
    { id: 'reports', label: 'Reports', icon: 'alert-circle' },
    { id: 'reviews', label: 'Reviews', icon: 'star' }
  ];

  const currentTabs = user?.role === 'ADMIN' ? adminTabs : user?.role === 'MENTOR' ? mentorTabs : studentTabs;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {currentTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => onTabPress(tab.id)}
              style={styles.tabButton}
            >
              <View
                style={[
                  styles.iconWrap,
                  isActive && styles.activeIconWrap
                ]}
              >
                <Icon
                  name={tab.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                {tab.badge && tab.badge > 0 ? (
                  <View style={styles.badgeDot}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  typography.caption,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive ? '700' : '500',
                    fontSize: 11,
                    marginTop: 2
                  }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    ...shadows.lg
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
    height: Platform.OS === 'android' ? 58 : 50
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.full,
    position: 'relative'
  },
  activeIconWrap: {
    backgroundColor: colors.primaryLight
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 6,
    backgroundColor: colors.danger,
    borderRadius: 99,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800'
  }
});
