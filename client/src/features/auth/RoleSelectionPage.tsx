import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { GraduationCap, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';

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
        padding: '40px 20px',
        backgroundColor: 'var(--bg-body)'
      }}
    >
      <div style={{ maxWidth: '840px', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'center' }}>
        <div>
          <Badge variant="primary" style={{ marginBottom: '10px' }}>Personalize Your Journey</Badge>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            How do you plan to use Guidly?
          </h2>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '520px', margin: '6px auto 0 auto' }}>
            Choose your primary role to configure your onboarding checklist and dashboard tools.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Student Card */}
          <Card
            hoverable
            padding="lg"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'left',
              gap: '20px'
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}
              >
                <GraduationCap size={22} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                I am a Student Builder
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                Have an ambitious idea? Find an experienced engineer who can help you build it into real software.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Connect 1-on-1 with verified industry engineers',
                  'Dedicated workspace with goals, milestones, and tasks',
                  'In-depth architecture reviews and concurrency debugging',
                  'Build an authentic resume-defining capstone project'
                ].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="md"
              onClick={() => onSelectRole('STUDENT')}
              rightIcon={<ArrowRight size={16} />}
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
              gap: '20px'
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}
              >
                <Briefcase size={22} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                I am an Industry Mentor
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                Share your real-world experience and guide motivated students through production engineering practices.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Review student proposals and accept matched capstones',
                  'Set your preferred schedule and mentoring topics',
                  'Conduct video code reviews and architecture consultations',
                  'Earn verified mentor badges and student reviews'
                ].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="md"
              variant="secondary"
              onClick={() => onSelectRole('MENTOR')}
              rightIcon={<ArrowRight size={16} />}
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
