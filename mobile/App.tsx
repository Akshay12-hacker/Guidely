// Guidely Mobile App Root Entry Point
// Production native startup sequence with SplashScreen lifecycle & offline monitoring

import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import NetInfo from '@react-native-community/netinfo';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';
import { WebSocketProvider } from './src/context/WebSocketContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { OfflineBanner } from './src/components/common/OfflineBanner';
import { apiConfig } from './src/api/config';
import { colors } from './src/theme/colors';

// Keep the native splash screen visible until initialization finishes
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading in dev or already prevented */
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Initialize API config and dynamic network endpoints
        await apiConfig.init();

        // 2. Pre-check network state
        await NetInfo.fetch();

        // 3. Configure Android native bottom navigation bar
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync(colors.surface).catch(() => {});
          await NavigationBar.setButtonStyleAsync('dark').catch(() => {});
        }
      } catch (e) {
        console.warn('App initialization warning:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // Hide native splash screen once initial tree has rendered
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ToastProvider>
        <AuthProvider>
          <WebSocketProvider>
            <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
              <StatusBar style="dark" backgroundColor={colors.surface} translucent={false} />
              <OfflineBanner />
              <AppNavigator />
            </SafeAreaView>
          </WebSocketProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  }
});

