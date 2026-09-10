// Root App Navigator for Guidely Mobile

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  StatusBar,
  ToastAndroid,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { QuickRoleBar } from '../components/common/QuickRoleBar';
import { BottomTabBar } from '../components/common/BottomTabBar';

// Auth Screens
import { LoginScreen } from '../features/auth/LoginScreen';
import { RegisterScreen } from '../features/auth/RegisterScreen';
import { RoleSelectionScreen } from '../features/auth/RoleSelectionScreen';

// Student Screens
import { StudentOnboardingScreen } from '../features/student/StudentOnboardingScreen';
import { StudentDashboardScreen } from '../features/student/StudentDashboardScreen';

// Mentor Screens
import { MentorOnboardingScreen } from '../features/mentor/MentorOnboardingScreen';
import { MentorDashboardScreen } from '../features/mentor/MentorDashboardScreen';
import { MentorDiscoveryScreen } from '../features/mentor/MentorDiscoveryScreen';
import { MentorProfileScreen } from '../features/mentor/MentorProfileScreen';

// Mentorship Screens
import { StudentRequestsScreen } from '../features/mentorship/StudentRequestsScreen';
import { MentorRequestsScreen } from '../features/mentorship/MentorRequestsScreen';

// Project Workspace
import { ProjectWorkspaceScreen } from '../features/projects/ProjectWorkspaceScreen';

// Sessions & Video Calls
import { SessionsScreen } from '../features/sessions/SessionsScreen';

// Messaging & Chat
import { ConversationsScreen } from '../features/messaging/ConversationsScreen';
import { ChatScreen } from '../features/messaging/ChatScreen';

// Notifications
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';

// Profile
import { ProfileScreen } from '../features/profile/ProfileScreen';

// Admin Screens
import { AdminDashboardScreen } from '../features/admin/AdminDashboardScreen';

// Settings
import { ServerConfigScreen } from '../features/settings/ServerConfigScreen';

import { colors } from '../theme/colors';

export const AppNavigator: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading, selectRole, refreshUser } = useAuth();

  // Navigation Stack State
  const [authScreen, setAuthScreen] = useState<'LOGIN' | 'REGISTER' | 'ROLE_SELECT' | 'SERVER_CONFIG'>('LOGIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubRoute, setActiveSubRoute] = useState<{
    route: string;
    params?: any;
  } | null>(null);

  const lastBackPressTime = useRef<number>(0);

  // Hardware Back Button Handling for Android
  useEffect(() => {
    const backAction = () => {
      if (activeSubRoute) {
        setActiveSubRoute(null);
        return true;
      }
      if (!isAuthenticated && authScreen !== 'LOGIN') {
        setAuthScreen('LOGIN');
        return true;
      }
      if (isAuthenticated && activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return true;
      }

      // On home dashboard: double tap to exit
      const now = Date.now();
      if (now - lastBackPressTime.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPressTime.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit Guidely', ToastAndroid.SHORT);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeSubRoute, isAuthenticated, authScreen, activeTab]);

  // Loading Screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 1. Unauthenticated Flow
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
        <QuickRoleBar onOpenServerConfig={() => setAuthScreen('SERVER_CONFIG')} />

        {authScreen === 'LOGIN' && (
          <LoginScreen
            onNavigateToRegister={() => setAuthScreen('REGISTER')}
            onOpenServerConfig={() => setAuthScreen('SERVER_CONFIG')}
          />
        )}

        {authScreen === 'REGISTER' && (
          <RegisterScreen
            onNavigateToLogin={() => setAuthScreen('LOGIN')}
          />
        )}

        {authScreen === 'ROLE_SELECT' && (
          <RoleSelectionScreen
            onSelectRole={async (role) => {
              await selectRole(role);
            }}
          />
        )}

        {authScreen === 'SERVER_CONFIG' && (
          <ServerConfigScreen
            onBack={() => setAuthScreen('LOGIN')}
          />
        )}
      </View>
    );
  }

  // 2. Onboarding Flow (if user has not completed onboarding)
  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin && profile && !profile.isCompleted && activeSubRoute?.route !== 'dashboard') {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
        <QuickRoleBar onOpenServerConfig={() => setActiveSubRoute({ route: 'server-config' })} />
        {isStudent ? (
          <StudentOnboardingScreen onComplete={refreshUser} />
        ) : (
          <MentorOnboardingScreen onComplete={refreshUser} />
        )}
      </View>
    );
  }

  // 3. Sub-Routes Handler
  const renderSubRoute = () => {
    if (!activeSubRoute) return null;
    const { route, params } = activeSubRoute;

    switch (route) {
      case 'mentor-profile':
        return (
          <MentorProfileScreen
            mentorId={params?.mentorId}
            onBack={() => setActiveSubRoute(null)}
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        );

      case 'project':
        return (
          <ProjectWorkspaceScreen
            projectId={params?.projectId}
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        );

      case 'requests':
        return isStudent ? (
          <StudentRequestsScreen
            onBack={() => setActiveSubRoute(null)}
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        ) : (
          <MentorRequestsScreen
            onBack={() => setActiveSubRoute(null)}
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        );

      case 'chat':
        return (
          <ChatScreen
            conversationId={params?.conversationId}
            counterpartName={params?.counterpartName}
            counterpartAvatar={params?.counterpartAvatar}
            counterpartId={params?.counterpartId}
            onBack={() => setActiveSubRoute(null)}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => setActiveSubRoute(null)}
            onNavigate={(r, p) => {
              setActiveSubRoute(null);
              setActiveTab(r);
            }}
          />
        );

      case 'server-config':
        return (
          <ServerConfigScreen
            onBack={() => setActiveSubRoute(null)}
          />
        );

      case 'onboarding':
        return isStudent ? (
          <StudentOnboardingScreen onComplete={() => setActiveSubRoute(null)} />
        ) : (
          <MentorOnboardingScreen onComplete={() => setActiveSubRoute(null)} />
        );

      default:
        return null;
    }
  };

  // 4. Main Tab Screens Handler
  const renderMainTab = () => {
    if (isAdmin) {
      return (
        <AdminDashboardScreen
          onNavigate={(r) => setActiveTab(r)}
        />
      );
    }

    if (isMentor) {
      switch (activeTab) {
        case 'dashboard':
          return (
            <MentorDashboardScreen
              onNavigate={(r, p) => {
                if (r === 'project') {
                  setActiveSubRoute({ route: 'project', params: p });
                } else {
                  setActiveSubRoute({ route: r, params: p });
                }
              }}
            />
          );
        case 'requests':
          return (
            <MentorRequestsScreen
              onNavigate={(r, p) => {
                if (r === 'project') {
                  setActiveSubRoute({ route: 'project', params: p });
                } else {
                  setActiveSubRoute({ route: r, params: p });
                }
              }}
            />
          );
        case 'sessions':
          return (
            <SessionsScreen
              onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
            />
          );
        case 'messages':
          return (
            <ConversationsScreen
              onSelectConversation={(conversationId, counterpartName, counterpartAvatar, counterpartId) => {
                setActiveSubRoute({
                  route: 'chat',
                  params: { conversationId, counterpartName, counterpartAvatar, counterpartId }
                });
              }}
              onNavigate={(r) => setActiveTab(r)}
            />
          );
        case 'profile':
          return (
            <ProfileScreen
              onOpenServerConfig={() => setActiveSubRoute({ route: 'server-config' })}
              onNavigateToOnboarding={() => setActiveSubRoute({ route: 'onboarding' })}
              onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
            />
          );
        default:
          return (
            <MentorDashboardScreen
              onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
            />
          );
      }
    }

    // Student Tabs
    switch (activeTab) {
      case 'dashboard':
        return (
          <StudentDashboardScreen
            onNavigate={(r, p) => {
              if (r === 'discover' || r === 'sessions' || r === 'messages' || r === 'profile') {
                setActiveTab(r);
              } else if (r === 'project') {
                setActiveSubRoute({ route: 'project', params: p });
              } else {
                setActiveSubRoute({ route: r, params: p });
              }
            }}
          />
        );
      case 'discover':
        return (
          <MentorDiscoveryScreen
            onNavigate={(r, p) => {
              if (r === 'requests') {
                setActiveSubRoute({ route: 'requests' });
              } else {
                setActiveSubRoute({ route: r, params: p });
              }
            }}
          />
        );
      case 'sessions':
        return (
          <SessionsScreen
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        );
      case 'messages':
        return (
          <ConversationsScreen
            onSelectConversation={(conversationId, counterpartName, counterpartAvatar, counterpartId) => {
              setActiveSubRoute({
                route: 'chat',
                params: { conversationId, counterpartName, counterpartAvatar, counterpartId }
              });
            }}
            onNavigate={(r) => setActiveTab(r)}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onOpenServerConfig={() => setActiveSubRoute({ route: 'server-config' })}
            onNavigateToOnboarding={() => setActiveSubRoute({ route: 'onboarding' })}
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        );
      default:
        return (
          <StudentDashboardScreen
            onNavigate={(r, p) => setActiveSubRoute({ route: r, params: p })}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      {/* Demo Switcher Sticky Bar */}
      <QuickRoleBar
        onOpenServerConfig={() => setActiveSubRoute({ route: 'server-config' })}
      />

      {/* Main Content (SubRoute or Active Tab) */}
      <View style={styles.contentArea}>
        {activeSubRoute ? renderSubRoute() : renderMainTab()}
      </View>

      {/* Persistent Bottom Tab Bar (Visible when on main tabs) */}
      {!activeSubRoute && (
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentArea: {
    flex: 1
  }
});
