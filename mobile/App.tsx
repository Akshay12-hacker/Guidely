// Guidely Mobile App Root Entry Point

import React, { useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';
import { WebSocketProvider } from './src/context/WebSocketContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setBackgroundColorAsync(colors.surface).catch(() => {});
        NavigationBar.setButtonStyleAsync('dark').catch(() => {});
      } catch (e) {}
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <WebSocketProvider>
            <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
              <StatusBar style="dark" backgroundColor={colors.surface} translucent={false} />
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
