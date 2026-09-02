import React from 'react';
import { Compass, Heart, Globe, Code2, Sparkles } from 'lucide-react';

export const Footer: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border)',
        padding: '60px 24px 32px 24px',
        color: 'var(--text-muted)'
      }}
    >
      <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Guidly<span style={{ color: 'var(--primary)' }}>.</span>
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
              Connecting ambitious CSE students with experienced software engineers, architects, and researchers for real human project mentorship.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <li><a href="#find-mentor" onClick={(e) => { e.preventDefault(); onNavigate?.('find-mentor'); }} style={{ color: 'inherit' }}>Find a Mentor</a></li>
              <li><a href="#become-mentor" onClick={(e) => { e.preventDefault(); onNavigate?.('register'); }} style={{ color: 'inherit' }}>Become a Mentor</a></li>
              <li><a href="#project-workspace" onClick={(e) => { e.preventDefault(); onNavigate?.('student-project'); }} style={{ color: 'inherit' }}>Project Workspace</a></li>
              <li><a href="#sessions" onClick={(e) => { e.preventDefault(); onNavigate?.('student-sessions'); }} style={{ color: 'inherit' }}>1-on-1 Video Sessions</a></li>
            </ul>
          </div>

          {/* Technology Domains */}
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Domains
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <li><span>Distributed Systems & Cloud</span></li>
              <li><span>Applied AI & Machine Learning</span></li>
              <li><span>Full-Stack Web Architectures</span></li>
              <li><span>Smart Contract Security & Web3</span></li>
              <li><span>Systems Programming in Rust/C++</span></li>
            </ul>
          </div>

          {/* Colleges & Community */}
          <div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Community
            </h5>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '12px' }}>
              Proudly mentoring engineers from IITs, BITS, NITs, and top engineering institutions worldwide.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Globe size={19} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
              <Code2 size={19} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
              <Sparkles size={19} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.82rem'
          }}
        >
          <p>© 2026 Guidly Platform Inc. Built with clean architecture & human mentorship.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Engineered with</span>
            <Heart size={14} color="var(--danger)" fill="var(--danger)" />
            <span>for the next generation of builders.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
