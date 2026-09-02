// 1-Tap Mobile Demo Role & Server Switcher Bar

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../icons/Icon';

export const QuickRoleBar: React.FC<{ onOpenServerConfig?: () => void }> = ({ onOpenServerConfig }) => {
  const { user, quickLoginAs, logout, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const demoUsers = [
    { label: 'Aarav (Student)', email: 'aarav.sharma@iitd.ac.in', role: 'STUDENT' },
    { label: 'Priya (Google)', email: 'priya.sundaram@gmail.com', role: 'MENTOR' },
    { label: 'Dr. Rohan (MSFT)', email: 'rohan.mehra@microsoft.com', role: 'MENTOR' },
    { label: 'Admin', email: 'admin@guidely.dev', role: 'ADMIN' }
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.barHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.pillTrigger}
        >
          <Icon name="sparkles" size={12} color="#A5B4FC" />
          <Text style={[typography.captionBold, styles.triggerText]}>
            Demo Switcher {user?.fullName ? `(${user.fullName.split(' ')[0]})` : (user?.email ? `(${user.email.split('@')[0]})` : '')}
          </Text>
          <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={12} color="#A5B4FC" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenServerConfig}
          style={styles.serverConfigBtn}
        >
          <Icon name="settings" size={13} color="#94A3B8" />
          <Text style={[typography.caption, { color: '#94A3B8', fontSize: 11 }]}>
            Server IP
          </Text>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {demoUsers.map(demo => {
            const isCurrent = user?.email.toLowerCase() === demo.email.toLowerCase();
            return (
              <TouchableOpacity
                key={demo.email}
                activeOpacity={0.8}
                onPress={() => quickLoginAs(demo.email)}
                style={[
                  styles.roleChip,
                  isCurrent && styles.activeRoleChip
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: isCurrent ? colors.white : '#CBD5E1', fontSize: 11 }
                  ]}
                >
                  {demo.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {isAuthenticated && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={logout}
              style={styles.logoutChip}
            >
              <Text style={[typography.captionBold, { color: '#F87171', fontSize: 11 }]}>
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pillTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    gap: 4
  },
  triggerText: {
    color: '#A5B4FC',
    fontSize: 11
  },
  serverConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    paddingBottom: 2
  },
  roleChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#334155'
  },
  activeRoleChip: {
    backgroundColor: colors.primary,
    borderColor: '#818CF8'
  },
  logoutChip: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#7F1D1D'
  }
});
