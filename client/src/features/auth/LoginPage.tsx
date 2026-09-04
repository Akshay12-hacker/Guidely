import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card } from '../../components/ui/Card.js';
import { Compass, Mail, Lock, Sparkles } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal.js';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, googleLogin, quickLoginAs } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      onNavigate('student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      showToast('error', 'Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSimulatedLogin = async () => {
    if (!email) {
      setError('Please enter your email above to continue with Google sign in.');
      showToast('warning', 'Missing Email', 'Please enter your email address above.');
      return;
    }
    setIsLoading(true);
    try {
      const namePart = email.split('@')[0].replace(/[\._]/g, ' ');
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      await googleLogin(email.trim(), name, 'STUDENT');
      onNavigate('student-dashboard');
    } catch (err: any) {
      showToast('error', 'Google Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        backgroundColor: 'var(--bg-body)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            onClick={() => onNavigate('landing')}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '14px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Compass size={22} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Welcome back to Guidly
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to access your mentoring workspace
          </p>
        </div>

        {/* Login Card */}
        <Card padding="lg" style={{ boxShadow: 'var(--shadow-md)' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '9px 12px',
                color: 'var(--danger-text)',
                fontSize: '0.82rem',
                marginBottom: '16px',
                fontWeight: 500
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@college.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />
            </div>

            <Button type="submit" size="md" isLoading={isLoading} style={{ width: '100%', marginTop: '4px' }}>
              Sign In
            </Button>
          </form>

          <div style={{ position: 'relative', margin: '18px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border)' }} />
            <span style={{ position: 'relative', backgroundColor: '#FFFFFF', padding: '0 10px', fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Or Continue With
            </span>
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleSimulatedLogin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Sign in with Google
          </Button>

          {/* Quick Demo Logins inside card */}
          <div
            style={{
              marginTop: '18px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Sparkles size={12} color="var(--primary)" />
              <span>Instant Test Identities</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <Button size="sm" variant="secondary" onClick={() => quickLoginAs('akshay@guidely.dev')}>
                Student (Akshay)
              </Button>
              <Button size="sm" variant="secondary" onClick={() => quickLoginAs('priya.sundaram@gmail.com')}>
                Mentor (Priya)
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign up now →
          </button>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
};
