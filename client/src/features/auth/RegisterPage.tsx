import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card } from '../../components/ui/Card.js';
import { Compass, Mail, Lock, User, GraduationCap, Briefcase } from 'lucide-react';
import { GoogleAuthButton } from '../../components/ui/GoogleAuthButton.js';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, googleLogin } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'MENTOR'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, fullName, role);
      if (role === 'STUDENT') {
        onNavigate('student-onboarding');
      } else {
        onNavigate('mentor-onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      showToast('error', 'Registration Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await googleLogin(credential, role);
      if (res?.profile && res.profile.isCompleted === true) {
        onNavigate('dashboard');
      } else {
        onNavigate(res?.user?.role === 'MENTOR' || role === 'MENTOR' ? 'mentor-onboarding' : 'student-onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign up failed');
      showToast('error', 'Google Sign up Failed', err.message);
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
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            Create your Guidly Account
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Join a community of builders and verified industry mentors
          </p>
        </div>

        {/* Register Card */}
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
            {/* Role Switcher */}
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                I am joining as a:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: role === 'STUDENT' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: role === 'STUDENT' ? 'var(--primary-light)' : '#FFFFFF',
                    color: role === 'STUDENT' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <GraduationCap size={16} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('MENTOR')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: role === 'MENTOR' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: role === 'MENTOR' ? 'var(--primary-light)' : '#FFFFFF',
                    color: role === 'MENTOR' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Briefcase size={16} />
                  Mentor
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User size={16} />}
              required
            />

            <Input
              label="College or Work Email"
              type="email"
              placeholder="you@college.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Button type="submit" size="md" isLoading={isLoading} style={{ width: '100%', marginTop: '4px' }}>
              Create {role === 'STUDENT' ? 'Student' : 'Mentor'} Account
            </Button>
          </form>

          <div style={{ position: 'relative', margin: '18px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border)' }} />
            <span style={{ position: 'relative', backgroundColor: '#FFFFFF', padding: '0 10px', fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Or Sign Up With
            </span>
          </div>

          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            text="signup_with"
            role={role}
            isLoading={isLoading}
          />
        </Card>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign in →
          </button>
        </div>
      </div>
    </div>
  );
};
