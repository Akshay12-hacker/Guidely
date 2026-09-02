import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { StudentProfile } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Select } from '../../components/ui/Select.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  User,
  GraduationCap,
  Wrench,
  Lightbulb,
  Cpu,
  HelpCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Save
} from 'lucide-react';

interface StudentOnboardingProps {
  onComplete: () => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    college: 'IIT Delhi',
    degree: 'B.Tech Computer Science and Engineering',
    graduationYear: 2026,
    currentSkills: ['Go', 'C++', 'Data Structures', 'Linux'],
    projectIdea: 'Distributed fault-tolerant task queue with Raft consensus and worker heartbeats.',
    targetTechnologies: ['Go (Golang)', 'gRPC', 'PostgreSQL', 'Docker'],
    helpNeededAreas: ['Architecture Design', 'Concurrency & Deadlocks', 'Worker Heartbeats'],
    availability: 'Weekdays post 6 PM & Weekend mornings',
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com'
  });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await api.getStudentProfile();
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
          if (data.onboardingStep && data.onboardingStep > 1) {
            setCurrentStep(Math.min(data.onboardingStep, 8));
          }
        }
      } catch {
        // use defaults
      }
    };
    fetchExisting();
  }, []);

  const totalSteps = 8;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const stepsList = [
    { num: 1, title: 'Personal Info', icon: <User size={16} /> },
    { num: 2, title: 'Education', icon: <GraduationCap size={16} /> },
    { num: 3, title: 'Skills', icon: <Wrench size={16} /> },
    { num: 4, title: 'Project Idea', icon: <Lightbulb size={16} /> },
    { num: 5, title: 'Target Tech', icon: <Cpu size={16} /> },
    { num: 6, title: 'Help Needed', icon: <HelpCircle size={16} /> },
    { num: 7, title: 'Availability', icon: <Clock size={16} /> },
    { num: 8, title: 'Preview', icon: <CheckCircle2 size={16} /> }
  ];

  const handleSaveStep = async (nextStep?: number) => {
    setIsLoading(true);
    try {
      const stepToSave = nextStep || currentStep;
      await api.saveStudentOnboardingStep(stepToSave, profile);
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
      await api.saveStudentOnboardingStep(8, { ...profile, isCompleted: true });
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      showToast('success', 'Profile Setup Complete! 🎉', 'Welcome to your personalized student dashboard.');
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
    const list = profile.currentSkills || [];
    setProfile(prev => ({
      ...prev,
      currentSkills: list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill]
    }));
  };

  const toggleTargetTech = (tech: string) => {
    const list = profile.targetTechnologies || [];
    setProfile(prev => ({
      ...prev,
      targetTechnologies: list.includes(tech) ? list.filter(t => t !== tech) : [...list, tech]
    }));
  };

  const toggleHelpArea = (area: string) => {
    const list = profile.helpNeededAreas || [];
    setProfile(prev => ({
      ...prev,
      helpNeededAreas: list.includes(area) ? list.filter(a => a !== area) : [...list, area]
    }));
  };

  return (
    <div style={{ maxWidth: '840px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Progress Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Student Onboarding • Step {currentStep} of {totalSteps}
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Set Up Your Builder Profile
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
      <Card padding="lg" style={{ boxShadow: 'var(--shadow-md)', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Personal Information</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Tell mentors a little about who you are and where they can find your work.
            </p>
            <Input
              label="Full Name"
              value={user?.fullName || ''}
              disabled
              helperText="Configured during registration"
            />
            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/your-username"
              value={profile.githubUrl || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
            />
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/your-username"
              value={profile.linkedinUrl || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
            />
          </div>
        )}

        {/* Step 2: Education & College */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Education & College</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Where do you study and what is your academic focus?
            </p>
            <Input
              label="College / University Name"
              placeholder="e.g. IIT Delhi, BITS Pilani, NIT Trichy, DTU..."
              value={profile.college || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))}
              required
            />
            <Input
              label="Degree / Major"
              placeholder="e.g. B.Tech Computer Science & Engineering"
              value={profile.degree || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, degree: e.target.value }))}
              required
            />
            <Select
              label="Expected Graduation Year"
              value={profile.graduationYear || 2026}
              onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: parseInt(e.target.value, 10) }))}
              options={[
                { value: 2025, label: '2025' },
                { value: 2026, label: '2026 (Final Year)' },
                { value: 2027, label: '2027 (Pre-Final Year)' },
                { value: 2028, label: '2028' }
              ]}
            />
          </div>
        )}

        {/* Step 3: Current Skills */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Current Skills & Familiarities</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select technologies you already have some experience with.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'C / C++', 'Java', 'Python', 'Go', 'JavaScript', 'TypeScript',
                'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Data Structures & Algorithms',
                'Linux / Bash', 'Git', 'Docker', 'REST APIs', 'FastAPI'
              ].map(skill => {
                const isSelected = profile.currentSkills?.includes(skill);
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

        {/* Step 4: Project Idea */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Project Vision</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Describe what you want to build. Mentors love clear problem statements!
            </p>
            <Textarea
              label="Project Idea & Problem Statement"
              placeholder="e.g. I want to build a Distributed Fault-Tolerant Task Queue in Go that supports worker heartbeats, exponential backoff retries, and high-throughput job dispatching..."
              rows={6}
              value={profile.projectIdea || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, projectIdea: e.target.value }))}
              required
            />
          </div>
        )}

        {/* Step 5: Target Technologies */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Technologies of Interest</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Which tech stack are you aiming to master or build this project with?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                'Go (Golang)', 'PyTorch', 'Rust', 'Kubernetes', 'gRPC', 'WebRTC',
                'Next.js', 'Solidity', 'Apache Spark', 'Kafka', 'Redis', 'WebSockets',
                'FastAPI', 'GraphQL', 'AWS / Cloud Native'
              ].map(tech => {
                const isSelected = profile.targetTechnologies?.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTargetTech(tech)}
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

        {/* Step 6: Help Needed Areas */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Where Do You Need Guidance?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select the primary areas where human mentor guidance will unblock you the most.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {[
                'Architecture & System Design',
                'Concurrency & Deadlock Prevention',
                'Database Schema & Normalization',
                '1-on-1 Code Reviews & Best Practices',
                'Model Fine-Tuning & Evaluation',
                'Benchmarking & Load Testing',
                'Deployment & Production Hardening'
              ].map(area => {
                const isSelected = profile.helpNeededAreas?.includes(area);
                return (
                  <div
                    key={area}
                    onClick={() => toggleHelpArea(area)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.88rem',
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
                    <span>{area}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: Availability */}
        {currentStep === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Availability Schedule</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              When are you generally available for 1-on-1 mentor syncs and project sprints?
            </p>
            <Input
              label="Preferred Meeting Times"
              placeholder="e.g. Weekdays post 6:00 PM IST & Saturday mornings"
              value={profile.availability || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
              required
            />
          </div>
        )}

        {/* Step 8: Profile Preview */}
        {currentStep === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div>
              <Badge variant="success" style={{ marginBottom: '8px' }}>Final Profile Review</Badge>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Review Your Builder Profile</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                This is how verified mentors on Guidly will see your profile.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user?.fullName}</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>{profile.degree} • {profile.college} (Class of {profile.graduationYear})</p>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Project Vision</span>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '2px', fontWeight: 500 }}>{profile.projectIdea}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Target Technologies</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.targetTechnologies?.map(t => <Badge key={t} variant="primary" size="sm">{t}</Badge>)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Guidance Needed In</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.helpNeededAreas?.map(h => <Badge key={h} variant="warning" size="sm">{h}</Badge>)}
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
              Complete Onboarding & Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
