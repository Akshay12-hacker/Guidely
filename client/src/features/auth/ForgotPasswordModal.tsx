import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Mail, CheckCircle2, KeyRound } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setDemoToken(res.demoResetToken);
      setStep('RESET');
      showToast('success', 'Reset Token Generated', 'Use the token to set a new password below.');
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoToken || !newPassword) return;
    setIsLoading(true);
    try {
      await api.resetPassword(demoToken, newPassword);
      setStep('DONE');
      showToast('success', 'Password Reset Successful!', 'You can now sign in with your new password.');
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'DONE' ? 'Password Reset Complete' : 'Reset Your Password'}
      subtitle={step === 'DONE' ? undefined : 'Enter your registered email to reset your account password.'}
    >
      {step === 'REQUEST' && (
        <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@college.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            required
          />
          <Button type="submit" isLoading={isLoading} style={{ marginTop: '6px' }}>
            Send Reset Instructions
          </Button>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: 'var(--info-light)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--info-text)' }}>
            Reset token generated for verification:
          </div>
          <Input
            label="Reset Token"
            value={demoToken}
            onChange={(e) => setDemoToken(e.target.value)}
            leftIcon={<KeyRound size={16} />}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} style={{ marginTop: '6px' }}>
            Update Password
          </Button>
        </form>
      )}

      {step === 'DONE' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
          <CheckCircle2 size={40} color="var(--success)" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Password Updated Successfully!</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Your account credentials have been updated. You can now log in.
          </p>
          <Button onClick={onClose} style={{ marginTop: '8px' }}>
            Back to Sign In
          </Button>
        </div>
      )}
    </Modal>
  );
};
