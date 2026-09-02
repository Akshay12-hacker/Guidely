import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { GraduationCap, Briefcase, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface RoleSelectionPageProps {
  onSelectRole: (role: 'STUDENT' | 'MENTOR') => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-body)'
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', gap: '36px', textAlign: 'center' }}>
        <div>
          <Badge variant="primary" style={{ marginBottom: '12px' }}>Personalize Your Experience</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            How do you plan to use Guidly?
          </h2>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '580px', margin: '8px auto 0 auto' }}>
            Choose your primary role to customize your onboarding and dashboard workspace.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {/* Student Card */}
          <Card
            hoverable
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'left',
              gap: '24px',
              border: '2px solid var(--border)'
            }}
          >
            <div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <GraduationCap size={28} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                I am a Student Builder
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                "Have an idea? Find someone who can help you build it."
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Connect 1-on-1 with verified engineers from top tech companies',
                  'Structured project workspace with goals, milestones, and tasks',
                  'Real code reviews, architecture guidance, and debugging help',
                  'Build a resume-defining project that impresses recruiters'
                ].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => onSelectRole('STUDENT')}
              rightIcon={<ArrowRight size={18} />}
              style={{ width: '100%' }}
            >
              Continue as Student →
            </Button>
          </Card>

          {/* Mentor Card */}
          <Card
            hoverable
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'left',
              gap: '24px',
              border: '2px solid var(--border)'
            }}
          >
            <div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#ECFDF5',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Briefcase size={28} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                I am an Industry Mentor
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                "Share your experience and help students build real projects."
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Guide motivated CSE students on real software engineering projects',
                  'Set your own availability schedule and mentoring topics',
                  'Conduct video code reviews and architecture consulting',
                  'Receive verified mentor badges and public mentee reviews'
                ].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => onSelectRole('MENTOR')}
              rightIcon={<ArrowRight size={18} />}
              style={{ width: '100%' }}
            >
              Continue as Mentor →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
