// Mobile Server Host & Network Configuration Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiConfig } from '../../api/config';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Chip } from '../../components/common/Chip';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ServerConfigScreenProps {
  onBack: () => void;
}

export const ServerConfigScreen: React.FC<ServerConfigScreenProps> = ({ onBack }) => {
  const { updateServerHost } = useAuth();
  const { showToast } = useToast();

  const [host, setHost] = useState(apiConfig.host);
  const [port, setPort] = useState(apiConfig.port);
  const [isTesting, setIsTesting] = useState(false);
  const [pingStatus, setPingStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setPingStatus('IDLE');
    try {
      const testUrl = `http://${host.trim()}:${port.trim()}/api/mentors`;
      const res = await fetch(testUrl, { method: 'GET' });
      if (res.ok) {
        setPingStatus('SUCCESS');
        showToast('success', 'Connection Verified! 🟢', `Successfully reached server at ${host}:${port}`);
      } else {
        setPingStatus('FAILED');
        showToast('warning', 'Server Reachable with Warning', `HTTP Status ${res.status}`);
      }
    } catch (e: any) {
      setPingStatus('FAILED');
      showToast('error', 'Connection Failed', `Could not connect to ${host}:${port}. Ensure backend is running.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!host.trim()) return;
    await updateServerHost(host.trim());
    onBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        onBack={onBack}
        title="Server & Network Settings"
        subtitle="Configure backend API and WebSocket endpoints"
      />

      <View style={styles.content}>
        <Card padding="lg" style={styles.card}>
          <Text style={[typography.h4, { color: colors.textMain, marginBottom: spacing.xs }]}>
            Backend Server Host IP
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 }]}>
            Configure the host address to connect from Android emulators, physical phones, or cloud deployments.
          </Text>

          {/* Preset Quick Chips */}
          <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            QUICK PRESETS:
          </Text>
          <View style={styles.presetsRow}>
            <Chip
              label="Emulator (10.0.2.2)"
              selected={host === '10.0.2.2'}
              onPress={() => setHost('10.0.2.2')}
            />
            <Chip
              label="Localhost (127.0.0.1)"
              selected={host === 'localhost' || host === '127.0.0.1'}
              onPress={() => setHost('127.0.0.1')}
            />
            <Chip
              label="LAN Wi-Fi (192.168.1.100)"
              selected={host.startsWith('192.168')}
              onPress={() => setHost('192.168.1.100')}
            />
          </View>

          <Input
            label="Host / IP Address"
            placeholder="10.0.2.2 or 192.168.1.x"
            value={host}
            onChangeText={setHost}
            autoCapitalize="none"
          />

          <Input
            label="Port Number"
            placeholder="5000"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />

          {/* Current URL Previews */}
          <View style={styles.urlBox}>
            <Text style={[typography.captionBold, { color: colors.primaryDark }]}>HTTP API URL:</Text>
            <Text style={[typography.caption, { color: colors.textMain, marginTop: 1 }]}>
              http://{host}:{port}/api
            </Text>

            <View style={{ height: 6 }} />

            <Text style={[typography.captionBold, { color: colors.primaryDark }]}>WebSocket URL:</Text>
            <Text style={[typography.caption, { color: colors.textMain, marginTop: 1 }]}>
              ws://{host}:{port}/ws
            </Text>
          </View>

          {/* Test & Save Actions */}
          <View style={styles.actionsRow}>
            <Button
              size="md"
              variant="outline"
              onPress={handleTestConnection}
              isLoading={isTesting}
              leftIcon={<Icon name="refresh" size={14} color={colors.textMain} />}
              style={{ flex: 1 }}
            >
              Test Ping
            </Button>
            <Button
              size="md"
              variant="primary"
              onPress={handleSave}
              style={{ flex: 1 }}
            >
              Save & Apply
            </Button>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg
  },
  card: {
    ...shadows.md
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md
  },
  urlBox: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs
  }
});
