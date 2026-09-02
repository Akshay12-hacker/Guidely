// Mobile Sign Up Screen with Role Selection

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
import { UserRole } from '../../types';

export interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register, googleLogin } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      showToast('warning', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      showToast('warning', 'Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await register(email.trim(), password, fullName.trim(), role);
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!email.trim() || !fullName.trim()) {
      showToast('warning', 'Missing Details', 'Please provide your Full Name and Email above to continue with Google.');
      return;
    }
    setIsLoading(true);
    try {
      await googleLogin(email.trim(), fullName.trim(), role);
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
              Create Account
            </Text>
            <Text style={[typography.body, styles.subtitle]}>
              Join a community of engineering builders & industry mentors
            </Text>
          </View>

          {/* Form Card */}
          <Card padding="lg" style={styles.formCard}>
            {/* Role Switcher */}
            <Text style={[typography.captionBold, styles.sectionLabel]}>
              I WANT TO JOIN AS:
            </Text>
            <View style={styles.rolePickerRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRole('STUDENT')}
                style={[
                  styles.roleCard,
                  role === 'STUDENT' && styles.activeRoleCard
                ]}
              >
                <Icon
                  name="graduation-cap"
                  size={20}
                  color={role === 'STUDENT' ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    typography.bodyBold,
                    { color: role === 'STUDENT' ? colors.primary : colors.textMain, marginTop: 4 }
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRole('MENTOR')}
                style={[
                  styles.roleCard,
                  role === 'MENTOR' && styles.activeRoleCard
                ]}
              >
                <Icon
                  name="briefcase"
                  size={20}
                  color={role === 'MENTOR' ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    typography.bodyBold,
                    { color: role === 'MENTOR' ? colors.primary : colors.textMain, marginTop: 4 }
                  ]}
                >
                  Mentor
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Full Name"
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Icon name="users" size={18} color={colors.textMuted} />}
            />

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
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Icon name="lock" size={18} color={colors.textMuted} />}
            />

            <Button
              size="lg"
              onPress={handleRegister}
              isLoading={isLoading}
              fullWidth
              style={styles.signUpBtn}
            >
              Sign Up as {role === 'STUDENT' ? 'Student' : 'Mentor'}
            </Button>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={[typography.caption, styles.dividerText]}>OR SIGN UP WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              variant="outline"
              size="md"
              onPress={handleGoogleSignUp}
              fullWidth
              leftIcon={<Icon name="globe" size={18} color={colors.primary} />}
            >
              Sign up with Google
            </Button>
          </Card>

          {/* Footer Login Link */}
          <View style={styles.footerRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  sectionLabel: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontSize: 11
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  roleCard: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle
  },
  activeRoleCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  signUpBtn: {
    marginTop: spacing.xs,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg
  }
});
