import React, { useState, useEffect, useMemo } from 'react';
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
import { Avatar } from '../../components/ui/Avatar.js';
import { ProfilePhotoModal } from '../../components/ui/ProfilePhotoModal.js';
import { PRESET_SKILLS, SKILL_CATEGORIES } from '../../constants/skills.js';
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
  Save,
  Camera,
  Search,
  Plus,
  X
} from 'lucide-react';

interface StudentOnboardingProps {
  onComplete: () => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');
  const [isAddingOtherSkill, setIsAddingOtherSkill] = useState(false);
  const [otherSkillInput, setOtherSkillInput] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
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
          if (data.currentSkills && data.currentSkills.length > 0) {
            const presetLower = new Set(PRESET_SKILLS.map(s => s.name.toLowerCase()));
            const loadedCustom = data.currentSkills.filter(s => !presetLower.has(s.toLowerCase()));
            if (loadedCustom.length > 0) {
              setCustomSkills(prev => Array.from(new Set([...prev, ...loadedCustom])));
            }
          }
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

  const removeSkill = (skill: string) => {
    const list = profile.currentSkills || [];
    setProfile(prev => ({
      ...prev,
      currentSkills: list.filter(s => s !== skill)
    }));
  };

  const handleAddCustomSkill = (customName?: string) => {
    const raw = (customName !== undefined ? customName : otherSkillInput).trim();
    if (!raw) return;

    // Check if it matches an existing preset skill case-insensitively
    const existingPreset = PRESET_SKILLS.find(
      s => s.name.toLowerCase() === raw.toLowerCase()
    );
    const resolvedName = existingPreset ? existingPreset.name : raw;

    const current = profile.currentSkills || [];
    if (!current.includes(resolvedName)) {
      setProfile(prev => ({
        ...prev,
        currentSkills: [...(prev.currentSkills || []), resolvedName]
      }));
      showToast('success', 'Skill Added', `"${resolvedName}" added to your builder profile.`);
    } else {
      showToast('info', 'Already Added', `"${resolvedName}" is already in your skills.`);
    }

    if (!existingPreset) {
      setCustomSkills(prev => Array.from(new Set([...prev, resolvedName])));
    }

    setOtherSkillInput('');
    setSkillSearch('');
    setIsAddingOtherSkill(false);
  };

  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();

    // Map custom skills to items
    const customItems = customSkills.map(name => ({
      name,
      category: 'Other',
      isCustom: true
    }));

    // Preset skills
    const allAvailable = [...customItems, ...PRESET_SKILLS];
    const seen = new Set<string>();
    const unique = allAvailable.filter(item => {
      const lower = item.name.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    if (query) {
      return unique.filter(item => item.name.toLowerCase().includes(query));
    }

    if (selectedSkillCategory === 'All') {
      return unique;
    }

    return unique.filter(item => item.category === selectedSkillCategory);
  }, [skillSearch, selectedSkillCategory, customSkills]);

  const queryTrimmed = skillSearch.trim();
  const hasExactSkillMatch = useMemo(() => {
    if (!queryTrimmed) return false;
    const lower = queryTrimmed.toLowerCase();
    return (
      PRESET_SKILLS.some(s => s.name.toLowerCase() === lower) ||
      customSkills.some(s => s.toLowerCase() === lower) ||
      (profile.currentSkills || []).some(s => s.toLowerCase() === lower)
    );
  }, [queryTrimmed, customSkills, profile.currentSkills]);

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <Avatar
                name={user?.fullName || 'Student'}
                src={user?.avatarUrl}
                size="lg"
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                  Student Profile Photo
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Cloudinary face-crop & fast CDN loading across project spaces
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-fade-in">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Current Skills & Familiarities
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Select technologies you already have some working experience with. Search through our extensive directory, filter by category, or use the "+ Other" option to add your custom skills.
              </p>
            </div>

            {/* Selected Skills Chips Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em' }}>
                  Selected Skills ({profile.currentSkills?.length || 0})
                </span>
                {(profile.currentSkills?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, currentSkills: [] }))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {profile.currentSkills && profile.currentSkills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.currentSkills.map(skill => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary-border)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        title={`Remove ${skill}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(79, 70, 229, 0.15)',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--primary)',
                          padding: 0
                        }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No skills selected yet. Select from the options below, search, or add custom skills.
                </span>
              )}
            </div>

            {/* Search Input & Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search 75+ skills (e.g. Python, Docker, Next.js, Rust, Solidity)..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (queryTrimmed) {
                          if (filteredSkills.length === 1) {
                            toggleSkill(filteredSkills[0].name);
                            setSkillSearch('');
                          } else if (!hasExactSkillMatch) {
                            handleAddCustomSkill(queryTrimmed);
                          } else if (filteredSkills.length > 0) {
                            toggleSkill(filteredSkills[0].name);
                            setSkillSearch('');
                          }
                        }
                      }
                    }}
                    className="guidely-input"
                    style={{
                      width: '100%',
                      paddingLeft: '38px',
                      paddingRight: skillSearch ? '36px' : '14px',
                      paddingTop: '9px',
                      paddingBottom: '9px',
                      fontSize: '0.88rem'
                    }}
                  />
                  {skillSearch && (
                    <button
                      type="button"
                      onClick={() => setSkillSearch('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <Button
                  variant={isAddingOtherSkill ? 'secondary' : 'outline'}
                  size="sm"
                  type="button"
                  onClick={() => setIsAddingOtherSkill(prev => !prev)}
                  leftIcon={<Plus size={15} />}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isAddingOtherSkill ? 'Close Other' : '+ Other'}
                </Button>
              </div>

              {/* Banner when searched skill is not in catalog */}
              {queryTrimmed && !hasExactSkillMatch && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--primary-light)',
                  border: '1.5px dashed var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                      Can't find "{queryTrimmed}" in the directory?
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Add it directly to your builder profile as a custom skill.
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    type="button"
                    onClick={() => handleAddCustomSkill(queryTrimmed)}
                    leftIcon={<Plus size={14} />}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Add "{queryTrimmed}"
                  </Button>
                </div>
              )}

              {/* Inline Custom Skill Form (when "+ Other" is toggled) */}
              {isAddingOtherSkill && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Add Custom Skill or Technology
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Enter any specialized tool, framework, or language
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. Solidity, Three.js, FPGA, Julia, ROS..."
                      value={otherSkillInput}
                      onChange={(e) => setOtherSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        } else if (e.key === 'Escape') {
                          setIsAddingOtherSkill(false);
                          setOtherSkillInput('');
                        }
                      }}
                      autoFocus
                      className="guidely-input"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      type="button"
                      onClick={() => handleAddCustomSkill()}
                      disabled={!otherSkillInput.trim()}
                      leftIcon={<Plus size={14} />}
                    >
                      Add Skill
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setIsAddingOtherSkill(false);
                        setOtherSkillInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Category Pills (when not actively searching) */}
              {!skillSearch && (
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {SKILL_CATEGORIES.map(cat => {
                    const isCatSelected = selectedSkillCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedSkillCategory(cat)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: isCatSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: isCatSelected ? 'var(--primary-light)' : '#FFFFFF',
                          color: isCatSelected ? 'var(--primary)' : 'var(--text-muted)',
                          fontSize: '0.78rem',
                          fontWeight: isCatSelected ? 700 : 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skills Catalog Cloud */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {skillSearch
                    ? `Matching Skills (${filteredSkills.length})`
                    : `${selectedSkillCategory} Skills (${filteredSkills.length})`}
                </span>
                {filteredSkills.length > 0 && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                    Click any skill to select / deselect
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '280px', overflowY: 'auto', padding: '4px' }}>
                {filteredSkills.map(item => {
                  const isSelected = profile.currentSkills?.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleSkill(item.name)}
                      style={{
                        padding: '7px 13px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? 'var(--shadow-xs)' : 'none'
                      }}
                    >
                      <span>{item.name}</span>
                      {isSelected && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>}
                    </button>
                  );
                })}

                {/* Always-available "+ Other" button in the chips list */}
                <button
                  type="button"
                  onClick={() => setIsAddingOtherSkill(true)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1.5px dashed var(--primary)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--primary)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Plus size={14} /> Other Skill
                </button>
              </div>

              {filteredSkills.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    No skills matched "{skillSearch}"
                  </p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Click "+ Other" or the banner above to add "{skillSearch}" as your custom skill!
                  </p>
                </div>
              )}
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
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                  Current Skills & Familiarities ({profile.currentSkills?.length || 0})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {profile.currentSkills && profile.currentSkills.length > 0 ? (
                    profile.currentSkills.map(s => <Badge key={s} variant="neutral" size="sm">{s}</Badge>)
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No skills selected</span>
                  )}
                </div>
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

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
