import React from 'react';
import { Compass, Heart, Globe, Code2, Sparkles } from 'lucide-react';

export const Footer: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border)',
        padding: '48px 24px 28px 24px',
        color: 'var(--text-muted)'
      }}
    >
      <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass size={16} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Guidly
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
              Connecting ambitious CSE students with verified software engineers, architects, and researchers for real human project mentorship.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li><button onClick={() => onNavigate?.('find-mentor')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Find a Mentor</button></li>
              <li><button onClick={() => onNavigate?.('register')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Become a Mentor</button></li>
              <li><button onClick={() => onNavigate?.('student-project')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>Project Workspace</button></li>
              <li><button onClick={() => onNavigate?.('student-sessions')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>1-on-1 Video Syncs</button></li>
            </ul>
          </div>

          {/* Technology Domains */}
          <div>
            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Specializations
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li><span>Distributed Systems & Cloud</span></li>
              <li><span>Applied AI & Machine Learning</span></li>
              <li><span>Full-Stack Web Architectures</span></li>
              <li><span>Smart Contract Auditing & Web3</span></li>
              <li><span>High-Throughput Go & Rust</span></li>
            </ul>
          </div>

          {/* Colleges & Community */}
          <div>
            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Community
            </h5>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '12px' }}>
              Mentoring students from top universities and engineering colleges worldwide.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Globe size={18} color="var(--text-muted)" />
              <Code2 size={18} color="var(--text-muted)" />
              <Sparkles size={18} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8rem'
          }}
        >
          <p>© 2026 Guidly Platform Inc. Built for engineering builders.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Engineered with</span>
            <Heart size={13} color="var(--danger)" fill="var(--danger)" />
            <span>for the next generation of engineers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
