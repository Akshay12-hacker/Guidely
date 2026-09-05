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
import { Avatar } from '../../components/ui/Avatar.js';
import { ProfilePhotoModal } from '../../components/ui/ProfilePhotoModal.js';
import { AvailabilityTimeBarPicker } from '../../components/ui/AvailabilityTimeBarPicker.js';
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
  Save,
  Camera,
  Plus,
  X,
  Award
} from 'lucide-react';

const PRESET_SKILLS = [
  'Distributed Systems',
  'System Design',
  'Concurrency & Multithreading',
  'Deep Learning & PyTorch',
  'Computer Vision',
  'Full Stack Architecture',
  'Smart Contract Security',
  'WebRTC & Streaming',
  'Database Internals',
  'Microservices',
  'Code Reviews & Refactoring',
  'DevOps & Kubernetes',
  'Generative AI & LLMs',
  'Cloud Infrastructure',
  'Cybersecurity & Forensics',
  'Mobile Architecture',
  'API Design & Optimization',
  'Data Engineering & ETL'
];

const PRESET_TECHNOLOGIES = [
  'Go (Golang)',
  'Python',
  'PyTorch',
  'Rust',
  'TypeScript',
  'React',
  'Next.js',
  'gRPC',
  'Kubernetes',
  'Docker',
  'PostgreSQL',
  'Redis',
  'Kafka',
  'Solidity',
  'FastAPI',
  'AWS / GCP',
  'WebRTC',
  'Flutter',
  'C / C++',
  'GraphQL',
  'Java / Spring Boot',
  'Node.js',
  'Tailwind CSS',
  'LangChain',
  'MongoDB',
  'Terraform',
  'RabbitMQ',
  'Elasticsearch',
  'Swift',
  'Kotlin'
];

const PRESET_EXPERIENCE_HIGHLIGHTS = [
  'Open Source Maintainer / Core Contributor',
  'High-Throughput Production Systems (10k+ QPS)',
  'Multi-Region Cloud Architecture (AWS / GCP / Azure)',
  'Microservices & Distributed Tracing',
  'Tech Lead & Engineering Management',
  'AI / LLM Production Pipeline Deployment',
  'Research Publication (IEEE / ACM / NeurIPS)',
  'Startup Founder / 0-to-1 Architecture',
  'Security Auditing & Penetration Testing',
  'Zero-Downtime Database Migration'
];

const PRESET_TOPICS = [
  'System Architecture Formulation',
  'PR Code Reviews & Concurrency Debugging',
  'Research Formulation & Paper Guidance',
  'Mock System Design & Resume Polish',
  'Capstone Milestone Planning',
  'Benchmarking & Performance Profiling',
  'Database Normalization & Query Tuning',
  'Security Hardening & Code Audits',
  'Production Incident Post-Mortems',
  'Career & Interview Transition'
];

interface MentorOnboardingProps {
  onComplete: () => void;
}

export const MentorOnboarding: React.FC<MentorOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Custom addition input states
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customTechInput, setCustomTechInput] = useState('');
  const [customHighlightInput, setCustomHighlightInput] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');

  const [profile, setProfile] = useState<Partial<MentorProfile>>({
    title: 'Staff Software Engineer',
    company: 'Google India',
    college: 'IIT Madras',
    yearsExperience: 8,
    bio: 'Over 8 years designing distributed systems and storage architectures. Excited to guide students through real production engineering practices.',
    skills: ['Distributed Systems', 'System Design', 'Concurrency & Multithreading', 'Microservices', 'Code Reviews & Refactoring'],
    technologies: ['Go (Golang)', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Docker', 'Redis'],
    experienceHighlights: ['High-Throughput Production Systems (10k+ QPS)', 'Microservices & Distributed Tracing', 'Open Source Maintainer / Core Contributor'],
    projectsExperience: 'Contributed to open-source Go RPC libraries; Designed high-throughput checkout pipeline handling 10k RPS at Razorpay; Architected distributed caching layer with sub-millisecond p99 latencies.',
    mentoringTopics: ['System Architecture Formulation', 'PR Code Reviews & Concurrency Debugging', 'Mock System Design & Resume Polish'],
    availabilitySchedule: 'Weekends (10 AM - 6 PM IST) & Weekdays post 7 PM',
    hourlyRate: 0,
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com'
  });

  // Dynamic presets from backend with local fallbacks
  const [presetSkills, setPresetSkills] = useState<string[]>([...PRESET_SKILLS]);
  const [presetTechnologies, setPresetTechnologies] = useState<string[]>([...PRESET_TECHNOLOGIES]);
  const [presetHighlights, setPresetHighlights] = useState<string[]>([...PRESET_EXPERIENCE_HIGHLIGHTS]);
  const [presetTopics, setPresetTopics] = useState<string[]>([...PRESET_TOPICS]);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const [data, options] = await Promise.all([
          api.getMentorProfile().catch(() => null),
          api.getMentorOnboardingOptions().catch(() => null)
        ]);
        if (options) {
          if (options.presetSkills?.length) setPresetSkills(options.presetSkills);
          if (options.presetTechnologies?.length) setPresetTechnologies(options.presetTechnologies);
          if (options.presetExperienceHighlights?.length) setPresetHighlights(options.presetExperienceHighlights);
          if (options.presetTopics?.length) setPresetTopics(options.presetTopics);
        }
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

  // --- Skills Handlers ---
  const toggleSkill = (skill: string) => {
    const list = profile.skills || [];
    setProfile(prev => ({
      ...prev,
      skills: list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill]
    }));
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skill)
    }));
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;

    const list = profile.skills || [];
    const alreadyExists = list.some(s => s.toLowerCase() === clean.toLowerCase());
    if (alreadyExists) {
      showToast('info', 'Already Added', `"${clean}" is already in your skills.`);
      setCustomSkillInput('');
      return;
    }

    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), clean]
    }));
    setCustomSkillInput('');
    showToast('success', 'Skill Added', `"${clean}" added to your domain expertise.`);
  };

  // --- Technologies Handlers ---
  const toggleTechnology = (tech: string) => {
    const list = profile.technologies || [];
    setProfile(prev => ({
      ...prev,
      technologies: list.includes(tech) ? list.filter(t => t !== tech) : [...list, tech]
    }));
  };

  const removeTechnology = (tech: string) => {
    setProfile(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(t => t !== tech)
    }));
  };

  const handleAddCustomTechnology = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTechInput.trim();
    if (!clean) return;

    const list = profile.technologies || [];
    const alreadyExists = list.some(t => t.toLowerCase() === clean.toLowerCase());
    if (alreadyExists) {
      showToast('info', 'Already Added', `"${clean}" is already in your tech stack.`);
      setCustomTechInput('');
      return;
    }

    setProfile(prev => ({
      ...prev,
      technologies: [...(prev.technologies || []), clean]
    }));
    setCustomTechInput('');
    showToast('success', 'Technology Added', `"${clean}" added to your tech stack.`);
  };

  // --- Experience Highlights Handlers ---
  const toggleExperienceHighlight = (highlight: string) => {
    const list = profile.experienceHighlights || [];
    setProfile(prev => ({
      ...prev,
      experienceHighlights: list.includes(highlight) ? list.filter(h => h !== highlight) : [...list, highlight]
    }));
  };

  const removeExperienceHighlight = (highlight: string) => {
    setProfile(prev => ({
      ...prev,
      experienceHighlights: (prev.experienceHighlights || []).filter(h => h !== highlight)
    }));
  };

  const handleAddCustomHighlight = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customHighlightInput.trim();
    if (!clean) return;

    const list = profile.experienceHighlights || [];
    const alreadyExists = list.some(h => h.toLowerCase() === clean.toLowerCase());
    if (alreadyExists) {
      showToast('info', 'Already Added', `"${clean}" is already in your experience list.`);
      setCustomHighlightInput('');
      return;
    }

    setProfile(prev => ({
      ...prev,
      experienceHighlights: [...(prev.experienceHighlights || []), clean]
    }));
    setCustomHighlightInput('');
    showToast('success', 'Highlight Added', `"${clean}" added to your engineering highlights.`);
  };

  // --- Topics Handlers ---
  const toggleTopic = (topic: string) => {
    const list = profile.mentoringTopics || [];
    setProfile(prev => ({
      ...prev,
      mentoringTopics: list.includes(topic) ? list.filter(t => t !== topic) : [...list, topic]
    }));
  };

  const removeTopic = (topic: string) => {
    setProfile(prev => ({
      ...prev,
      mentoringTopics: (prev.mentoringTopics || []).filter(t => t !== topic)
    }));
  };

  const handleAddCustomTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTopicInput.trim();
    if (!clean) return;

    const list = profile.mentoringTopics || [];
    const alreadyExists = list.some(t => t.toLowerCase() === clean.toLowerCase());
    if (alreadyExists) {
      showToast('info', 'Already Added', `"${clean}" is already in your mentoring topics.`);
      setCustomTopicInput('');
      return;
    }

    setProfile(prev => ({
      ...prev,
      mentoringTopics: [...(prev.mentoringTopics || []), clean]
    }));
    setCustomTopicInput('');
    showToast('success', 'Topic Added', `"${clean}" added to your mentoring formats.`);
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <Avatar
                name={user?.fullName || 'Mentor'}
                src={user?.avatarUrl}
                size="lg"
                isVerified={true}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                  Mentor Profile Photo
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Cloudinary face-crop & CDN optimization for high visibility
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                leftIcon={<Camera size={14} />}
              >
                {user?.avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </div>

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
                  { value: 1, label: '1 Year' },
                  { value: 2, label: '2+ Years' },
                  { value: 3, label: '3+ Years' },
                  { value: 4, label: '4+ Years' },
                  { value: 5, label: '5+ Years' },
                  { value: 6, label: '6+ Years' },
                  { value: 7, label: '7+ Years' },
                  { value: 8, label: '8+ Years' },
                  { value: 10, label: '10+ Years' },
                  { value: 12, label: '12+ Years' },
                  { value: 15, label: '15+ Years' },
                  { value: 20, label: '20+ Years' }
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 3: Skills & Domain Expertise */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Skills & Domain Expertise</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Select or add your technical core competencies and domain specializations.
              </p>
            </div>

            {/* Custom Skill Input */}
            <form
              onSubmit={handleAddCustomSkill}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Plus size={16} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Add custom skill or domain (e.g. LLM Agents, Embedded C++, Web3, Bioinformatics)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!customSkillInput.trim()}
              >
                + Add Skill
              </Button>
            </form>

            {/* Selected Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Selected Skills ({profile.skills?.length || 0})
                </span>
                {profile.skills && profile.skills.length > 0 && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Click × to remove any skill
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', alignItems: 'center' }}>
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map(skill => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary)',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          opacity: 0.7,
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                        title={`Remove ${skill}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No skills selected yet. Add a custom skill above or click suggestions below.
                  </span>
                )}
              </div>
            </div>

            {/* Suggested Domains */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Suggested Domains & Specializations
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetSkills.map(skill => {
                  const isSelected = profile.skills?.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{skill}</span>
                      {isSelected && <CheckCircle2 size={13} color="var(--primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Technologies & Tools */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Technologies & Tools</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Languages, frameworks, databases, and infrastructure tools you frequently use and mentor in.
              </p>
            </div>

            {/* Custom Technology Input */}
            <form
              onSubmit={handleAddCustomTechnology}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Plus size={16} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Add new technology, framework, tool, or library (e.g. LangChain, Flutter, Astro, Supabase)..."
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!customTechInput.trim()}
              >
                + Add Tech
              </Button>
            </form>

            {/* Selected Technologies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Selected Technologies ({profile.technologies?.length || 0})
                </span>
                {profile.technologies && profile.technologies.length > 0 && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Click × to remove any technology
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', alignItems: 'center' }}>
                {profile.technologies && profile.technologies.length > 0 ? (
                  profile.technologies.map(tech => (
                    <span
                      key={tech}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary)',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          opacity: 0.7,
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                        title={`Remove ${tech}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No technologies selected yet. Add a custom technology above or click suggestions below.
                  </span>
                )}
              </div>
            </div>

            {/* Suggested Technologies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Popular Technologies & Stacks
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetTechnologies.map(tech => {
                  const isSelected = profile.technologies?.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechnology(tech)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{tech}</span>
                      {isSelected && <CheckCircle2 size={13} color="var(--primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Projects & Experience */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Engineering Highlights & Experience</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Highlight notable systems, open-source projects, architectural achievements, or research you have built.
              </p>
            </div>

            {/* Custom Experience Highlight Input */}
            <form
              onSubmit={handleAddCustomHighlight}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Plus size={16} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Add custom milestone or achievement (e.g. Led 100k+ QPS migration, YC W24 Alum, Authored RFC)..."
                  value={customHighlightInput}
                  onChange={(e) => setCustomHighlightInput(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!customHighlightInput.trim()}
              >
                + Add Highlight
              </Button>
            </form>

            {/* Selected Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Selected Experience Highlights ({profile.experienceHighlights?.length || 0})
                </span>
                {profile.experienceHighlights && profile.experienceHighlights.length > 0 && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Click × to remove any milestone
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', alignItems: 'center' }}>
                {profile.experienceHighlights && profile.experienceHighlights.length > 0 ? (
                  profile.experienceHighlights.map(hl => (
                    <span
                      key={hl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FCD34D',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}
                    >
                      <Award size={13} color="#D97706" />
                      {hl}
                      <button
                        type="button"
                        onClick={() => removeExperienceHighlight(hl)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#92400E',
                          opacity: 0.7,
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                        title={`Remove ${hl}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No experience highlights selected yet. Add a custom accomplishment above or click suggestions below.
                  </span>
                )}
              </div>
            </div>

            {/* Suggested Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Suggested Milestone Badges
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetHighlights.map(hl => {
                  const isSelected = profile.experienceHighlights?.includes(hl);
                  return (
                    <button
                      key={hl}
                      type="button"
                      onClick={() => toggleExperienceHighlight(hl)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid #D97706' : '1px solid var(--border)',
                        backgroundColor: isSelected ? '#FEF3C7' : '#FFFFFF',
                        color: isSelected ? '#92400E' : 'var(--text-main)',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{hl}</span>
                      {isSelected && <CheckCircle2 size={13} color="#D97706" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Projects Experience */}
            <Textarea
              label="Notable Systems, Projects & Contributions Details"
              placeholder="e.g. Contributed to open-source Go RPC libraries; Designed high-throughput checkout pipeline handling 10k RPS at Razorpay; Authored benchmark suite for distributed Raft log replications..."
              rows={4}
              value={profile.projectsExperience || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, projectsExperience: e.target.value }))}
            />
          </div>
        )}

        {/* Step 6: Mentoring Topics */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mentoring Topics & Formats</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Specify which coaching topics, review formats, and project milestones you offer to students.
              </p>
            </div>

            {/* Custom Topic Input */}
            <form
              onSubmit={handleAddCustomTopic}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-subtle)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Plus size={16} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Add custom mentoring topic or format (e.g. AI Agent Hackathon Mentoring, 1-on-1 Concurrency Debugging)..."
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!customTopicInput.trim()}
              >
                + Add Topic
              </Button>
            </form>

            {/* Selected Topics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Selected Mentoring Topics ({profile.mentoringTopics?.length || 0})
                </span>
                {profile.mentoringTopics && profile.mentoringTopics.length > 0 && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Click × to remove any format
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', alignItems: 'center' }}>
                {profile.mentoringTopics && profile.mentoringTopics.length > 0 ? (
                  profile.mentoringTopics.map(topic => (
                    <span
                      key={topic}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary)',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => removeTopic(topic)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          opacity: 0.7,
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                        title={`Remove ${topic}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No mentoring topics selected yet. Add a custom topic above or select suggestions below.
                  </span>
                )}
              </div>
            </div>

            {/* Suggested Topics Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Suggested Mentoring Specializations
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                {presetTopics.map(topic => {
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
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        transition: 'all 0.15s ease'
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
          </div>
        )}

        {/* Step 7: Availability */}
        {currentStep === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Mentoring Availability</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Configure your weekly days and interactive timeline bars so students know when you are open for 1-on-1 video reviews and guidance syncs.
            </p>
            <AvailabilityTimeBarPicker
              value={profile.availabilitySchedule || ''}
              onChange={(formattedSchedule, details) => setProfile(prev => ({
                ...prev,
                availabilitySchedule: formattedSchedule,
                availabilityDetails: details
              }))}
              label="Weekly Mentoring Windows"
              description="Choose your weekly days, sprint windows, and timezone."
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

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{user?.fullName}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{profile.title} @ {profile.company}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{profile.college} • {profile.yearsExperience}+ Years Experience</p>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{profile.bio}</p>

              {profile.experienceHighlights && profile.experienceHighlights.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Experience Highlights</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {profile.experienceHighlights.map(hl => (
                      <span
                        key={hl}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FCD34D',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        <Award size={11} color="#D97706" /> {hl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.projectsExperience && (
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>Notable Systems & Projects</span>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                    {profile.projectsExperience}
                  </p>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Skills & Domains</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.skills?.map(s => <Badge key={s} variant="neutral" size="sm">{s}</Badge>)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Technologies & Tools</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.technologies?.map(t => <Badge key={t} variant="primary" size="sm">{t}</Badge>)}
                </div>
              </div>

              {profile.mentoringTopics && profile.mentoringTopics.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Mentoring Formats</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {profile.mentoringTopics.map(m => (
                      <Badge key={m} variant="info" size="sm">{m}</Badge>
                    ))}
                  </div>
                </div>
              )}
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

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
