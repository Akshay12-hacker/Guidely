// Mobile Sign In Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onOpenServerConfig: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onOpenServerConfig
}) => {
  const { login, googleLogin, quickLoginAs } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast('warning', 'Missing Fields', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!email.trim()) {
      showToast('warning', 'Missing Email', 'Please enter your email address above to continue with Google.');
      return;
    }
    setIsLoading(true);
    try {
      const namePart = email.split('@')[0].replace(/[\._]/g, ' ');
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      await googleLogin(email.trim(), name, 'STUDENT');
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Icon name="compass" size={28} color={colors.white} />
            </View>
            <Text style={[typography.h1, styles.title]}>
              Welcome to Guidely<Text style={{ color: colors.primary }}>.</Text>
            </Text>
            <Text style={[typography.body, styles.subtitle]}>
              Sign in to continue your project mentorship journey
            </Text>
          </View>

          {/* Form Card */}
          <Card padding="lg" style={styles.formCard}>
            <Input
              label="College or Work Email"
              placeholder="you@college.ac.in"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Icon name="users" size={18} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Icon name="lock" size={18} color={colors.textMuted} />}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsForgotModalVisible(true)}
              style={styles.forgotBtn}
            >
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              size="lg"
              onPress={handleLogin}
              isLoading={isLoading}
              fullWidth
              style={styles.signInBtn}
            >
              Sign In
            </Button>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={[typography.caption, styles.dividerText]}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              variant="outline"
              size="md"
              onPress={handleGoogleSignIn}
              fullWidth
              leftIcon={<Icon name="globe" size={18} color={colors.primary} />}
            >
              Sign in with Google
            </Button>

            {/* Quick Demo Test Accounts Box */}
            <View style={styles.demoBox}>
              <View style={styles.demoHeader}>
                <Icon name="sparkles" size={14} color={colors.primary} />
                <Text style={[typography.captionBold, { color: colors.textMain }]}>
                  One-Tap Demo Logins
                </Text>
              </View>
              <View style={styles.demoButtonsRow}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => quickLoginAs('aarav.sharma@iitd.ac.in')}
                  style={styles.demoBtn}
                >
                  🎓 Aarav (Student)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => quickLoginAs('priya.sundaram@gmail.com')}
                  style={styles.demoBtn}
                >
                  👩‍💻 Priya (Google)
                </Button>
              </View>
            </View>
          </Card>

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ForgotPasswordModal
        visible={isForgotModalVisible}
        onClose={() => setIsForgotModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 280
  },
  formCard: {
    padding: spacing.xl,
    ...shadows.lg
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.xs
  },
  signInBtn: {
    marginBottom: spacing.lg
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
    color: colors.textSubtle,
    fontSize: 10.5
  },
  demoBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  demoBtn: {
    flex: 1
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg
  }
});
