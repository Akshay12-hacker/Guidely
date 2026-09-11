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
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister
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

  const [isGoogleModalVisible, setIsGoogleModalVisible] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomRole, setGoogleCustomRole] = useState<'STUDENT' | 'MENTOR'>('STUDENT');

  const handleGoogleSignInPress = () => {
    setIsGoogleModalVisible(true);
  };

  const handlePerformGoogleAuth = async (authEmail: string, authName: string, role: 'STUDENT' | 'MENTOR') => {
    setIsLoading(true);
    setIsGoogleModalVisible(false);
    try {
      await googleLogin(authEmail, authName, role);
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
              onPress={handleGoogleSignInPress}
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
                  One-Tap Seeded Accounts
                </Text>
              </View>
              <View style={styles.demoButtonsRow}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => quickLoginAs('akshay@guidely.dev')}
                  style={styles.demoBtn}
                >
                  🎓 Akshay (Student)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => quickLoginAs('priya.sundaram@gmail.com')}
                  style={styles.demoBtn}
                >
                  👩‍💻 Priya (Mentor)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => quickLoginAs('admin@guidely.dev')}
                  style={styles.demoBtn}
                >
                  🛡️ Admin
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

      {/* Google Account Selector Dialog */}
      {isGoogleModalVisible && (
        <View style={styles.googleModalOverlay}>
          <View style={styles.googleModalCard}>
            <View style={styles.googleModalHeader}>
              <Icon name="globe" size={24} color={colors.primary} />
              <Text style={[typography.h3, { color: colors.textMain, marginTop: spacing.xs }]}>
                Sign in with Google
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                Select an account or enter your Google credentials to continue to Guidely.
              </Text>
            </View>

            <View style={styles.googleAccountsList}>
              <TouchableOpacity
                style={styles.googleAccountItem}
                onPress={() => handlePerformGoogleAuth('akshay@guidely.dev', 'Akshay Ramkishor Rahangdale', 'STUDENT')}
                activeOpacity={0.7}
              >
                <View style={styles.googleAvatarCircle}>
                  <Text style={{ fontWeight: '700', color: colors.primary }}>A</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[typography.bodyBold, { color: colors.textMain }]}>Akshay Rahangdale</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>akshay@guidely.dev</Text>
                </View>
                <Badge variant="primary" size="sm">Student</Badge>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleAccountItem}
                onPress={() => handlePerformGoogleAuth('priya.sundaram@gmail.com', 'Priya Sundaram', 'MENTOR')}
                activeOpacity={0.7}
              >
                <View style={styles.googleAvatarCircle}>
                  <Text style={{ fontWeight: '700', color: colors.primary }}>P</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[typography.bodyBold, { color: colors.textMain }]}>Priya Sundaram</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>priya.sundaram@gmail.com</Text>
                </View>
                <Badge variant="success" size="sm">Mentor</Badge>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Input
                label="Or use another Google email:"
                placeholder="you@gmail.com"
                value={googleCustomEmail}
                onChangeText={setGoogleCustomEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md }}>
                <TouchableOpacity
                  onPress={() => setGoogleCustomRole('STUDENT')}
                  style={[styles.roleSelectChip, googleCustomRole === 'STUDENT' && styles.roleSelectChipActive]}
                >
                  <Text style={[typography.captionBold, { color: googleCustomRole === 'STUDENT' ? colors.primary : colors.textMuted }]}>
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGoogleCustomRole('MENTOR')}
                  style={[styles.roleSelectChip, googleCustomRole === 'MENTOR' && styles.roleSelectChipActive]}
                >
                  <Text style={[typography.captionBold, { color: googleCustomRole === 'MENTOR' ? colors.primary : colors.textMuted }]}>
                    Mentor
                  </Text>
                </TouchableOpacity>
              </View>
              {googleCustomEmail.trim().length > 0 && (
                <Button
                  size="md"
                  variant="primary"
                  onPress={() => {
                    const name = googleCustomEmail.split('@')[0];
                    handlePerformGoogleAuth(googleCustomEmail.trim(), name, googleCustomRole);
                  }}
                  fullWidth
                  style={{ marginBottom: spacing.sm }}
                >
                  Continue with this email
                </Button>
              )}
            </View>

            <Button
              variant="outline"
              size="sm"
              onPress={() => setIsGoogleModalVisible(false)}
              fullWidth
            >
              Cancel
            </Button>
          </View>
        </View>
      )}
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
  },
  googleModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 9999
  },
  googleModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.lg
  },
  googleModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  googleAccountsList: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  googleAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border
  },
  googleAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleSelectChip: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border
  },
  roleSelectChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary
  }
});
