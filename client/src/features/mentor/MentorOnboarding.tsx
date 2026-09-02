import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { MentorProfile } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Select } from '../../components/ui/Select.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  User,
  Briefcase,
  Wrench,
  Cpu,
  FolderGit2,
  BookOpen,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Save
} from 'lucide-react';

interface MentorOnboardingProps {
  onComplete: () => void;
}

export const MentorOnboarding: React.FC<MentorOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<MentorProfile>>({
    title: 'Staff Software Engineer',
    company: 'Google India',
    college: 'IIT Madras',
    yearsExperience: 8,
    bio: 'Over 8 years designing distributed systems and storage architectures. Excited to guide students through real production engineering practices.',
    skills: ['Distributed Systems', 'System Design', 'Concurrency', 'Microservices', 'Code Reviews'],
    technologies: ['Go (Golang)', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Docker', 'Redis'],
    mentoringTopics: ['System Design & Architecture', 'Go Backend Engineering', 'Code Quality & PR Reviews'],
    availabilitySchedule: 'Weekends (10 AM - 6 PM IST) & Weekdays post 7 PM',
    hourlyRate: 0,
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com'
  });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await api.getMentorProfile();
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
          if (data.onboardingStep && data.onboardingStep > 1) {
            setCurrentStep(Math.min(data.onboardingStep, 9));
          }
        }
      } catch {
        // use defaults
      }
    };
    fetchExisting();
  }, []);

  const totalSteps = 9;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const stepsList = [
    { num: 1, title: 'Personal', icon: <User size={15} /> },
    { num: 2, title: 'Background', icon: <Briefcase size={15} /> },
    { num: 3, title: 'Skills', icon: <Wrench size={15} /> },
    { num: 4, title: 'Technologies', icon: <Cpu size={15} /> },
    { num: 5, title: 'Experience', icon: <FolderGit2 size={15} /> },
    { num: 6, title: 'Topics', icon: <BookOpen size={15} /> },
    { num: 7, title: 'Availability', icon: <Clock size={15} /> },
    { num: 8, title: 'Verification', icon: <ShieldCheck size={15} /> },
    { num: 9, title: 'Preview', icon: <CheckCircle2 size={15} /> }
  ];

  const handleSaveStep = async (nextStep?: number) => {
    setIsLoading(true);
    try {
      const stepToSave = nextStep || currentStep;
      await api.saveMentorOnboardingStep(stepToSave, profile);
      showToast('success', 'Progress Saved', `Step ${currentStep} information has been recorded.`);
      if (nextStep) setCurrentStep(nextStep);
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.saveMentorOnboardingStep(9, { ...profile, isCompleted: true });
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      showToast('success', 'Mentor Profile Activated! 🎉', 'Welcome to your Guidly Mentor Dashboard.');
      setTimeout(() => {
        onComplete();
      }, 1200);
    } catch (err: any) {
      showToast('error', 'Completion Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const list = profile.skills || [];
    setProfile(prev => ({
      ...prev,
      skills: list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill]
    }));
  };

  const toggleTechnology = (tech: string) => {
    const list = profile.technologies || [];
    setProfile(prev => ({
      ...prev,
      technologies: list.includes(tech) ? list.filter(t => t !== tech) : [...list, tech]
    }));
  };

  const toggleTopic = (topic: string) => {
    const list = profile.mentoringTopics || [];
    setProfile(prev => ({
      ...prev,
      mentoringTopics: list.includes(topic) ? list.filter(t => t !== topic) : [...list, topic]
    }));
  };

  return (
    <div style={{ maxWidth: '860px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Progress Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mentor Onboarding • Step {currentStep} of {totalSteps}
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Set Up Your Mentor Profile
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleSaveStep()} leftIcon={<Save size={15} />}>
            Save Draft
          </Button>
        </div>
        <ProgressBar value={progressPercent} showLabel={true} size="md" />
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        {stepsList.map(s => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isCurrent ? 'var(--primary-light)' : isDone ? 'var(--bg-subtle)' : '#FFFFFF',
                color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: isCurrent ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isDone ? <CheckCircle2 size={14} color="var(--success)" /> : s.icon}
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Card Container */}
      <Card padding="lg" style={{ boxShadow: 'var(--shadow-md)', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Personal Information</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Provide your public profile information and social links for mentees.
            </p>
            <Input label="Full Name" value={user?.fullName || ''} disabled />
            <Textarea
              label="Bio & Engineering Philosophy"
              placeholder="e.g. Over 8 years designing massive-scale distributed storage at Google. Passionate about helping students understand core systems concepts..."
              value={profile.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedinUrl || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
              />
              <Input
                label="GitHub / Portfolio"
                placeholder="https://github.com/username"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 2: Background */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Professional & Academic Background</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Your current company, engineering title, and alma mater.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Current Job Title"
                placeholder="e.g. Staff Software Engineer"
                value={profile.title || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Input
                label="Current Company / Organization"
                placeholder="e.g. Google India, Microsoft, Razorpay"
                value={profile.company || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <Input
                label="College / Alma Mater"
                placeholder="e.g. IIT Madras, BITS Pilani"
                value={profile.college || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))}
                required
              />
              <Select
                label="Years of Experience"
                value={profile.yearsExperience || 5}
                onChange={(e) => setProfile(prev => ({ ...prev, yearsExperience: parseInt(e.target.value, 10) }))}
                options={[
                  { value: 2, label: '2+ Years' },
                  { value: 4, label: '4+ Years' },
                  { value: 6, label: '6+ Years' },
                  { value: 8, label: '8+ Years' },
                  { value: 10, label: '10+ Years' },
                  { value: 15, label: '15+ Years' }
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 3: Skills */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Skills & Domain Expertise</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select high-level technical skills you can mentor students in.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'Distributed Systems', 'System Design', 'Concurrency & Multithreading',
                'Deep Learning', 'Computer Vision', 'Full Stack Architecture',
                'Smart Contract Security', 'WebRTC & Streaming', 'Database Internals',
                'Microservices', 'Code Reviews & Refactoring', 'DevOps & Kubernetes'
              ].map(skill => {
                const isSelected = profile.skills?.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.86rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {skill} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Technologies */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Technologies & Tools</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select languages, frameworks, and infrastructure tools you frequently use.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'Go (Golang)', 'Python', 'PyTorch', 'Rust', 'TypeScript', 'React',
                'Next.js', 'gRPC', 'Kubernetes', 'Docker', 'PostgreSQL', 'Redis',
                'Kafka', 'Solidity', 'FastAPI', 'AWS / GCP', 'WebRTC'
              ].map(tech => {
                const isSelected = profile.technologies?.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTechnology(tech)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.86rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tech} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Projects & Experience */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Engineering Highlights</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Highlight notable systems, open-source projects, or research papers you've contributed to.
            </p>
            <Textarea
              label="Projects & Contributions"
              placeholder="e.g. Contributed to open-source Go RPC libraries; Designed high-throughput checkout pipeline handling 10k RPS at Razorpay..."
              rows={5}
              value={profile.bio ? `${profile.bio}` : ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        )}

        {/* Step 6: Mentoring Topics */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mentoring Topics & Formats</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              What specific formats of mentoring do you offer?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {[
                'System Architecture Formulation',
                'PR Code Reviews & Concurrency Debugging',
                'Research Formulation & Paper Guidance',
                'Mock System Design & Resume Polish',
                'Capstone Milestone Planning',
                'Benchmarking & Performance Profiling'
              ].map(topic => {
                const isSelected = profile.mentoringTopics?.includes(topic);
                return (
                  <div
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.86rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)'
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: isSelected ? 'none' : '1.5px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        flexShrink: 0
                      }}
                    >
                      {isSelected && '✓'}
                    </div>
                    <span>{topic}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: Availability */}
        {currentStep === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Mentoring Availability</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Set expectations for when you can take 1-on-1 video sessions and reply to asynchronous chat messages.
            </p>
            <Input
              label="Availability Schedule"
              placeholder="e.g. Weekends (10 AM - 6 PM IST) & Weekday evenings post 7 PM"
              value={profile.availabilitySchedule || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, availabilitySchedule: e.target.value }))}
              required
            />
          </div>
        )}

        {/* Step 8: Verification Info */}
        {currentStep === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={26} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mentor Verification</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Guidly mentors receive a Verified Industry badge after our moderation team reviews your professional credentials.
            </p>
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.86rem', color: '#1E40AF', lineHeight: 1.5 }}>
              Your LinkedIn profile ({profile.linkedinUrl || 'linked'}) and company credentials will be automatically verified by Guidly Administrators within 24 hours. You can begin accepting student requests immediately!
            </div>
          </div>
        )}

        {/* Step 9: Preview */}
        {currentStep === 9 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div>
              <Badge variant="verified" style={{ marginBottom: '8px' }}>Final Profile Review</Badge>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Review Your Public Mentor Profile</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                This is how CSE students will discover and view your profile in the marketplace.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{user?.fullName}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{profile.title} @ {profile.company}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{profile.college} • {profile.yearsExperience}+ Years Experience</p>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{profile.bio}</p>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Expertise</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.skills?.map(s => <Badge key={s} variant="neutral" size="sm">{s}</Badge>)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Technologies</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.technologies?.map(t => <Badge key={t} variant="primary" size="sm">{t}</Badge>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '24px' }}>
          {currentStep > 1 ? (
            <Button variant="secondary" onClick={() => handleSaveStep(currentStep - 1)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
          ) : <div />}

          {currentStep < totalSteps ? (
            <Button onClick={() => handleSaveStep(currentStep + 1)} rightIcon={<ArrowRight size={16} />} isLoading={isLoading}>
              Next Step
            </Button>
          ) : (
            <Button variant="success" onClick={handleComplete} rightIcon={<Sparkles size={16} />} isLoading={isLoading}>
              Publish Mentor Profile & Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
