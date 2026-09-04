import React from 'react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import {
  Compass,
  ArrowRight,
  Terminal,
  Cpu,
  Users,
  CheckCircle2,
  Star,
  Sparkles,
  GitBranch,
  Clock,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export const LandingPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const featuredMentors = [
    {
      name: 'Priya Sundaram',
      title: 'Staff Software Engineer',
      company: 'Google India',
      college: 'IIT Madras',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      skills: ['Go', 'Distributed Systems', 'Kubernetes', 'gRPC'],
      rating: 4.95,
      studentsHelped: 19
    },
    {
      name: 'Dr. Rohan Mehra',
      title: 'Principal AI Researcher',
      company: 'Microsoft IDC',
      college: 'IIT Bombay',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      skills: ['PyTorch', 'Vision Transformers', 'Deep Learning'],
      rating: 4.98,
      studentsHelped: 27
    },
    {
      name: 'Vikram Aditya',
      title: 'Lead Frontend Architect',
      company: 'Razorpay',
      college: 'BITS Pilani',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      skills: ['TypeScript', 'React', 'WebRTC', 'Node.js'],
      rating: 4.90,
      studentsHelped: 15
    },
    {
      name: 'Sneha Iyer',
      title: 'Senior Protocol Engineer',
      company: 'Polygon Labs',
      college: 'IIIT Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skills: ['Solidity', 'Foundry', 'Smart Contract Audits'],
      rating: 4.88,
      studentsHelped: 11
    }
  ];

  const testimonials = [
    {
      studentName: 'Aarav Sharma',
      college: 'IIT Delhi • Final Year CSE',
      projectTitle: 'Distributed Task Queue in Go & Raft',
      mentorName: 'Priya Sundaram (Google)',
      content: 'I had a high-level concept for a distributed queue but had no experience handling worker crash timeouts or leader leases. Priya reviewed my code over 1-on-1 video calls, taught me production Go channel primitives, and helped me build an architecture that stood out in engineering interviews.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    {
      studentName: 'Ananya Patel',
      college: 'DTU Delhi • CSE',
      projectTitle: 'Chest X-Ray ViT Classification',
      mentorName: 'Dr. Rohan Mehra (Microsoft)',
      content: 'Having Dr. Rohan as my mentor was the difference between an abandoned GitHub repository and an accepted conference paper. He challenged my training pipeline, resolved validation loss divergence, and guided my experimental methodology.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      studentName: 'Rohan Verma',
      college: 'VIT Vellore • Information Technology',
      projectTitle: 'Real-time WebRTC Collaborative Suite',
      mentorName: 'Vikram Aditya (Razorpay)',
      content: 'NAT traversal and CRDT state synchronization felt overwhelming until Vikram broke it down into structured milestones. The milestone tracker and async code review kept me accountable every single week.',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '72px 24px 64px 24px',
          background: 'radial-gradient(ellipse at top, #EEF2FF 0%, #FFFFFF 65%)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <Sparkles size={14} />
            <span>Human Mentorship for Computer Science Students</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: '820px',
              marginBottom: '16px'
            }}
          >
            Build real software with engineers from <span style={{ color: 'var(--primary)' }}>top tech firms</span>.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              color: 'var(--text-muted)',
              maxWidth: '640px',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}
          >
            Connect 1-on-1 with experienced software architects and researchers who guide your capstone projects through architecture, tech stacks, and real-world code reviews.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '44px' }}>
            <Button size="lg" onClick={() => onNavigate('find-mentor')} rightIcon={<ArrowRight size={17} />}>
              Find a Mentor
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate('register')}>
              Become a Mentor
            </Button>
          </div>

          {/* Product Preview Card */}
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              textAlign: 'left'
            }}
          >
            {/* Window bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-body)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '6px' }}>
                  workspace.guidely.dev/project/distributed-task-queue
                </span>
              </div>
              <Badge variant="in_progress" size="sm">Active Sprint • 65%</Badge>
            </div>

            {/* Dashboard Mock Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Distributed Task Queue in Go & Raft
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Mentor: <strong>Priya Sundaram</strong> (Staff Engineer, Google) • Student: <strong>Aarav Sharma</strong> (IIT Delhi)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge variant="primary" size="sm">Go</Badge>
                  <Badge variant="primary" size="sm">gRPC</Badge>
                  <Badge variant="primary" size="sm">Raft</Badge>
                  <Badge variant="neutral" size="sm">Docker</Badge>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Video Session</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>Worker Heartbeats & Crash Recovery</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Clock size={13} /> Tomorrow at 7:00 PM IST
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Milestone</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>Milestone 2: Distributed Coordinator & RPC Failover</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <CheckCircle2 size={13} /> 3 of 4 development tasks done
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Contrast Section */}
      <section style={{ padding: '64px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <Badge variant="warning" style={{ marginBottom: '10px' }}>Why Projects Fail</Badge>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Why College Projects Get Stuck in "Tutorial Hell"
            </h2>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Ambitious students hit predictable roadblocks: unclear system boundaries, unreviewed code, and no senior engineer to give architectural feedback.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Where to Begin?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Choosing databases, RPC frameworks, or protocol designs without production experience leads to weeks of rewritten code and dead ends.
              </p>
            </Card>

            <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Isn't Enough</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                AI can output boilerplate, but it cannot challenge concurrency design trade-offs, conduct real code reviews, or mentor your engineering thinking.
              </p>
            </Card>

            <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Real Human Mentorship</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Guidly pairs you with engineers from Google, Microsoft, and high-growth teams who review your PRs, unblock bugs, and refine your architecture.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Structured Workflow */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--bg-body)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <Badge variant="primary" style={{ marginBottom: '10px' }}>Structured Process</Badge>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              How Guidly Mentorship Works
            </h2>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              A milestone-driven roadmap designed specifically for software engineering projects.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { step: '01', title: 'Submit Project Proposal', desc: 'Describe your idea, what technologies you know, and what areas you need guidance on.' },
              { step: '02', title: 'Match with a Mentor', desc: 'Browse verified mentors by domain, tech stack, and company. Send a structured proposal.' },
              { step: '03', title: 'Collaborate in Workspace', desc: 'Break the project into milestones and tasks. Work in a unified workspace with notes and resources.' },
              { step: '04', title: 'Deploy & Interview Ready', desc: 'Conduct 1-on-1 video code reviews, polish your repository, and showcase production software.' }
            ].map((s) => (
              <Card key={s.step} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {s.step}
                </span>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section style={{ padding: '64px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <Badge variant="verified" style={{ marginBottom: '10px' }}>Verified Mentors</Badge>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Learn From Senior Engineers & Researchers
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('find-mentor')} rightIcon={<ArrowRight size={15} />}>
              View All Mentors
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {featuredMentors.map((mentor) => (
              <Card key={mentor.name} hoverable padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Avatar name={mentor.name} src={mentor.avatar} size="lg" isVerified={true} isOnline={true} />
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {mentor.name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {mentor.title}
                      </p>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {mentor.company} • {mentor.college}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {mentor.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--text-secondary)',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    <Star size={15} color="#F59E0B" fill="#F59E0B" />
                    <span>{mentor.rating}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({mentor.studentsHelped} helped)
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => onNavigate('find-mentor')}>
                    Request
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section style={{ padding: '48px 24px', backgroundColor: '#0F172A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '28px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#A5B4FC' }}>950+</div>
            <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '4px' }}>Capstone Projects Built</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6EE7B7' }}>180+</div>
            <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '4px' }}>Verified Mentors</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FDE68A' }}>4.94 / 5</div>
            <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '4px' }}>Average Rating</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#BAE6FD' }}>92%</div>
            <div style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '4px' }}>Interview Success Rate</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--bg-body)' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <Badge variant="success" style={{ marginBottom: '10px' }}>Student Reviews</Badge>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Real Projects Built with Real Mentors
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {testimonials.map((t) => (
              <Card key={t.studentName} padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{t.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <Avatar name={t.studentName} src={t.avatar} size="md" />
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {t.studentName}
                    </h5>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {t.college}
                    </p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Project: {t.projectTitle}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', backgroundColor: '#FFFFFF', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Ready to Build Something Extraordinary?
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Join ambitious computer science students transforming ideas into production-ready software under verified senior mentorship.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="lg" onClick={() => onNavigate('register')} rightIcon={<ArrowRight size={17} />}>
              Get Started Now
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate('login')}>
              Sign In to Workspace
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
