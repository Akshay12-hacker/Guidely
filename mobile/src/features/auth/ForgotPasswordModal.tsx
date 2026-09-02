// Mobile Forgot Password Dialog Modal

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/auth.service';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/icons/Icon';

export interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onClose }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestToken = async () => {
    if (!email.trim()) {
      showToast('warning', 'Email Required', 'Please enter your registered email.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setDemoToken(res.demoResetToken);
      setStep('RESET');
      showToast('success', 'Reset Token Generated', 'Enter your new password below.');
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!demoToken || !newPassword) {
      showToast('warning', 'Fields Required', 'Please fill in token and new password.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(demoToken, newPassword);
      setStep('DONE');
      showToast('success', 'Password Reset Successful! 🎉');
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('REQUEST');
    setEmail('');
    setDemoToken('');
    setNewPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={step === 'DONE' ? 'Password Updated' : 'Reset Password'}
      subtitle={step === 'DONE' ? 'Your account security credentials have been updated.' : 'Enter your registered email to reset your account password.'}
    >
      {step === 'REQUEST' && (
        <View style={styles.form}>
          <Input
            label="Registered Email"
            placeholder="you@college.ac.in"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            size="md"
            onPress={handleRequestToken}
            isLoading={isLoading}
            fullWidth
            style={{ marginTop: spacing.sm }}
          >
            Send Reset Instructions
          </Button>
        </View>
      )}

      {step === 'RESET' && (
        <View style={styles.form}>
          <View style={styles.tokenBanner}>
            <Text style={[typography.caption, { color: colors.info, lineHeight: 18 }]}>
              Demo reset token generated and filled automatically:
            </Text>
          </View>
          <Input
            label="Reset Token"
            value={demoToken}
            onChangeText={setDemoToken}
          />
          <Input
            label="New Password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
          />
          <Button
            size="md"
            onPress={handleResetPassword}
            isLoading={isLoading}
            fullWidth
            style={{ marginTop: spacing.sm }}
          >
            Set New Password
          </Button>
        </View>
      )}

      {step === 'DONE' && (
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <Icon name="check" size={32} color={colors.success} />
          </View>
          <Text style={[typography.body, { textAlign: 'center', color: colors.textMuted, marginTop: spacing.sm }]}>
            You can now log in using your new credentials.
          </Text>
          <Button
            size="md"
            onPress={handleClose}
            fullWidth
            style={{ marginTop: spacing.lg }}
          >
            Back to Sign In
          </Button>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingTop: spacing.xs
  },
  tokenBanner: {
    backgroundColor: colors.infoLight,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  doneContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md
  },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
