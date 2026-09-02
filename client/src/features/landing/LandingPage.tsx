import React from 'react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import {
  Compass,
  ArrowRight,
  Code2,
  Users,
  Calendar,
  FolderKanban,
  CheckCircle2,
  ShieldCheck,
  Star,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  Layers,
  Terminal,
  Cpu
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
      college: 'IIT Delhi (Final Year CSE)',
      projectTitle: 'Distributed Task Queue in Go & Raft',
      mentorName: 'Priya Sundaram (Google)',
      content: 'I had a high-level idea for a distributed queue but had no clue how to model worker crash timeouts or leader leases. Priya reviewed my code over 1-on-1 video calls, taught me production Go channel primitives, and helped me build something that impressed recruiters during interviews.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    {
      studentName: 'Ananya Patel',
      college: 'DTU Delhi',
      projectTitle: 'Chest X-Ray ViT Classification',
      mentorName: 'Dr. Rohan Mehra (Microsoft)',
      content: 'Having Dr. Rohan as my mentor made the difference between an abandoned GitHub repo and a published research paper. He guided my PyTorch architecture, helped me resolve training loss divergence, and guided my paper submission.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      studentName: 'Rohan Verma',
      college: 'VIT Vellore',
      projectTitle: 'Real-time WebRTC Collaborative Suite',
      mentorName: 'Vikram Aditya (Razorpay)',
      content: 'WebRTC NAT traversal and delta sync was intimidating until Vikram broke it down into clean milestones. The collaborative workspace tasks kept me on track every single week.',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px 24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Trust Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              fontSize: '0.86rem',
              fontWeight: 700,
              marginBottom: '24px'
            }}
          >
            <Sparkles size={16} />
            <span>Real Human Mentorship for CSE Students</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: '860px',
              marginBottom: '20px'
            }}
          >
            Turn Your Project Idea Into a <span style={{ color: 'var(--primary)' }}>Real Project</span>.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
              color: 'var(--text-muted)',
              maxWidth: '680px',
              lineHeight: 1.6,
              marginBottom: '36px'
            }}
          >
            Connecting ambitious CSE students with experienced software engineers & researchers who guide you through architecture, tech stacks, and real-world implementation.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
            <Button size="lg" onClick={() => onNavigate('find-mentor')} rightIcon={<ArrowRight size={18} />}>
              Find a Mentor
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate('register')}>
              Become a Mentor
            </Button>
          </div>

          {/* Product Preview Mockup */}
          <div
            style={{
              width: '100%',
              maxWidth: '1020px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)',
              overflow: 'hidden',
              padding: '24px',
              textAlign: 'left'
            }}
          >
            {/* Mock Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '8px' }}>
                  Guidly Collaborative Workspace — Distributed Task Queue in Go
                </span>
              </div>
              <Badge variant="in_progress">65% Progress</Badge>
            </div>

            {/* Mock Dashboard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Next Session
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Worker Heartbeats & Crash Recovery Strategy
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  with Priya Sundaram (Google) • Tomorrow at 7:00 PM IST
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Current Milestone
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Milestone 2: Distributed Coordinator & RPC Failover
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                  3 of 4 tasks completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{ padding: '80px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px auto' }}>
            <Badge variant="warning" style={{ marginBottom: '14px' }}>The Core Challenge</Badge>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Why College Projects Get Stuck in "Tutorial Hell"
            </h2>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              A student often has a brilliant capstone idea, but quickly hits roadblocks: unclear architecture, unfamiliar tools, unexpected bugs, and no experienced engineer to review their code.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <Card hoverable padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF2F2', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Where to Start?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Choosing between databases, RPC frameworks, or state management without production context leads to months of rewritten code.
              </p>
            </Card>

            <Card hoverable padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFBEB', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Isn't Enough</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                AI can spit out boilerplate, but it cannot challenge your system design, review concurrency pitfalls, or mentor your engineering thinking.
              </p>
            </Card>

            <Card hoverable padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#ECFDF5', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Human Mentorship</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Guidly pairs you with engineers from Google, Microsoft, and high-growth startups who review your PRs, unblock tricky bugs, and refine your architecture.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How Guidly Works */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--bg-body)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px auto' }}>
            <Badge variant="primary" style={{ marginBottom: '14px' }}>Frictionless Workflow</Badge>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              How Guidly Works
            </h2>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              A structured, milestone-driven journey designed specifically for engineering projects.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: 'Submit Project Idea', desc: 'Describe your idea, what technologies you know, and what areas you need guidance on.' },
              { step: '02', title: 'Match with a Mentor', desc: 'Browse verified mentors by domain, tech stack, and experience. Send a structured request.' },
              { step: '03', title: 'Collaborate & Build', desc: 'Break the project into milestones and tasks. Work in a unified workspace with notes and resources.' },
              { step: '04', title: 'Deploy & Present', desc: 'Conduct 1-on-1 video code reviews, polish your repo, and launch a resume-defining project.' }
            ].map((s) => (
              <Card key={s.step} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', opacity: 0.8 }}>
                  {s.step}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section style={{ padding: '80px 24px', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <Badge variant="verified" style={{ marginBottom: '12px' }}>Verified Mentors</Badge>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Learn From Top Engineers & Researchers
              </h2>
            </div>
            <Button variant="outline" onClick={() => onNavigate('find-mentor')} rightIcon={<ArrowRight size={16} />}>
              View All Mentors
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {featuredMentors.map((mentor) => (
              <Card key={mentor.name} hoverable padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <Avatar name={mentor.name} src={mentor.avatar} size="lg" isVerified={true} isOnline={true} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {mentor.name}
                      </h4>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {mentor.title}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {mentor.company} • {mentor.college}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {mentor.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--text-main)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.74rem',
                          fontWeight: 600
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <span>{mentor.rating}</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 400 }}>
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
      <section style={{ padding: '60px 24px', backgroundColor: '#0F172A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#A5B4FC' }}>950+</div>
            <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px' }}>Capstone Projects Built</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6EE7B7' }}>180+</div>
            <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px' }}>Verified Industry Mentors</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FDE68A' }}>4.94 / 5</div>
            <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px' }}>Average Mentorship Rating</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#BAE6FD' }}>92%</div>
            <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px' }}>Placement Boost & Tech Hires</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--bg-body)' }}>
        <div style={{ maxWidth: 'var(--max-w-content)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px auto' }}>
            <Badge variant="success" style={{ marginBottom: '14px' }}>Student Success Stories</Badge>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Built by Students, Guided by Pros
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {testimonials.map((t) => (
              <Card key={t.studentName} padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{t.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <Avatar name={t.studentName} src={t.avatar} size="md" />
                  <div>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {t.studentName}
                    </h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t.college}
                    </p>
                    <p style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Project: {t.projectTitle}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '80px 24px', backgroundColor: '#FFFFFF', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Ready to Build Something Extraordinary?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Join thousands of CSE students turning project ideas into production-ready software with personalized human mentorship.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="lg" onClick={() => onNavigate('register')} rightIcon={<ArrowRight size={18} />}>
              Create Student Account
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate('login')}>
              Sign In to Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
