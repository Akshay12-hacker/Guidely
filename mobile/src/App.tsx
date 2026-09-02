// Guidely Mobile App Root Entry Point

import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppNavigator } from './navigation/AppNavigator';
import { colors } from './theme/colors';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WebSocketProvider>
          <SafeAreaView style={styles.root}>
            <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
            <AppNavigator />
          </SafeAreaView>
        </WebSocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  }
});
