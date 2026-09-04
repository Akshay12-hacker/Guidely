// Mobile 8-Step Student Onboarding Wizard

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/student.service';
import { StudentProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Chip } from '../../components/common/Chip';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/icons/Icon';
import {
  PRESET_SKILLS,
  SKILL_CATEGORIES,
  TARGET_TECHNOLOGIES,
  HELP_NEEDED_AREAS,
  NO_IDEA_TECH,
  NO_IDEA_HELP
} from '../../constants/skills';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface StudentOnboardingScreenProps {
  onComplete: () => void;
}

export const StudentOnboardingScreen: React.FC<StudentOnboardingScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherSkillInput, setOtherSkillInput] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');

  const [customTechs, setCustomTechs] = useState<string[]>([]);
  const [isAddingOtherTech, setIsAddingOtherTech] = useState(false);
  const [otherTechInput, setOtherTechInput] = useState('');

  const [customHelpAreas, setCustomHelpAreas] = useState<string[]>([]);
  const [isAddingOtherHelp, setIsAddingOtherHelp] = useState(false);
  const [otherHelpInput, setOtherHelpInput] = useState('');

  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    college: 'IIT Delhi',
    degree: 'B.Tech Computer Science & Engineering',
    graduationYear: 2026,
    currentSkills: ['Go', 'C++', 'Data Structures', 'Linux'],
    projectIdea: 'Distributed fault-tolerant task queue with Raft consensus and worker crash heartbeats.',
    targetTechnologies: ['Go (Golang)', 'gRPC', 'PostgreSQL', 'Docker'],
    helpNeededAreas: ['Architecture & System Design', 'Concurrency & Deadlock Prevention'],
    availability: 'Weekdays post 6 PM & Weekend mornings',
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com'
  });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await studentService.getProfile();
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
          if (data.currentSkills && data.currentSkills.length > 0) {
            const presetLower = new Set(PRESET_SKILLS.map(s => s.name.toLowerCase()));
            const loadedCustom = data.currentSkills.filter(s => !presetLower.has(s.toLowerCase()));
            if (loadedCustom.length > 0) {
              setCustomSkills(prev => Array.from(new Set([...prev, ...loadedCustom])));
            }
          }
          if (data.targetTechnologies && data.targetTechnologies.length > 0) {
            const presetTechLower = new Set(TARGET_TECHNOLOGIES.map(t => t.toLowerCase()));
            const loadedCustomTech = data.targetTechnologies.filter(t => !presetTechLower.has(t.toLowerCase()));
            if (loadedCustomTech.length > 0) {
              setCustomTechs(prev => Array.from(new Set([...prev, ...loadedCustomTech])));
            }
          }
          if (data.helpNeededAreas && data.helpNeededAreas.length > 0) {
            const presetHelpLower = new Set(HELP_NEEDED_AREAS.map(h => h.toLowerCase()));
            const loadedCustomHelp = data.helpNeededAreas.filter(h => !presetHelpLower.has(h.toLowerCase()));
            if (loadedCustomHelp.length > 0) {
              setCustomHelpAreas(prev => Array.from(new Set([...prev, ...loadedCustomHelp])));
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

  const handleSaveStep = async (nextStep?: number) => {
    setIsLoading(true);
    try {
      const stepToSave = nextStep || currentStep;
      await studentService.saveOnboardingStep(stepToSave, profile);
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
      await studentService.saveOnboardingStep(8, { ...profile, isCompleted: true });
      showToast('success', 'Profile Setup Complete! 🎉', 'Welcome to your student workspace.');
      setTimeout(() => {
        onComplete();
      }, 600);
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
    setIsAddingOther(false);
  };

  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();

    const customItems = customSkills.map(name => ({
      name,
      category: 'Other',
      isCustom: true
    }));

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

  const allTargetTechOptions = useMemo(() => {
    const presets = TARGET_TECHNOLOGIES.filter(t => t !== NO_IDEA_TECH);
    const combined = [...customTechs, ...presets];
    const seen = new Set<string>();
    return combined.filter(t => {
      const lower = t.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [customTechs]);

  const allHelpAreaOptions = useMemo(() => {
    const presets = HELP_NEEDED_AREAS.filter(h => h !== NO_IDEA_HELP);
    const combined = [...customHelpAreas, ...presets];
    const seen = new Set<string>();
    return combined.filter(h => {
      const lower = h.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [customHelpAreas]);

  const toggleTargetTech = (tech: string) => {
    setProfile(prev => {
      const list = prev.targetTechnologies || [];
      if (tech === NO_IDEA_TECH) {
        // Toggle No idea exclusively
        return {
          ...prev,
          targetTechnologies: list.includes(NO_IDEA_TECH) ? [] : [NO_IDEA_TECH]
        };
      } else {
        // Specific tech selected: remove "No idea" if present
        const withoutNoIdea = list.filter(t => t !== NO_IDEA_TECH);
        return {
          ...prev,
          targetTechnologies: withoutNoIdea.includes(tech)
            ? withoutNoIdea.filter(t => t !== tech)
            : [...withoutNoIdea, tech]
        };
      }
    });
  };

  const handleAddCustomTech = (name?: string) => {
    const raw = (name !== undefined ? name : otherTechInput).trim();
    if (!raw) return;

    const existingPreset = TARGET_TECHNOLOGIES.find(t => t.toLowerCase() === raw.toLowerCase());
    const resolved = existingPreset || raw;

    setProfile(prev => {
      const list = (prev.targetTechnologies || []).filter(t => t !== NO_IDEA_TECH);
      if (!list.includes(resolved)) {
        return { ...prev, targetTechnologies: [...list, resolved] };
      }
      return prev;
    });

    if (!existingPreset) {
      setCustomTechs(prev => Array.from(new Set([...prev, resolved])));
    }
    setOtherTechInput('');
    setIsAddingOtherTech(false);
    showToast('success', 'Tech Added', `"${resolved}" added to your target technologies.`);
  };

  const toggleHelpArea = (area: string) => {
    setProfile(prev => {
      const list = prev.helpNeededAreas || [];
      if (area === NO_IDEA_HELP) {
        // Toggle No idea exclusively
        return {
          ...prev,
          helpNeededAreas: list.includes(NO_IDEA_HELP) ? [] : [NO_IDEA_HELP]
        };
      } else {
        // Specific area selected: remove "No idea" if present
        const withoutNoIdea = list.filter(a => a !== NO_IDEA_HELP);
        return {
          ...prev,
          helpNeededAreas: withoutNoIdea.includes(area)
            ? withoutNoIdea.filter(a => a !== area)
            : [...withoutNoIdea, area]
        };
      }
    });
  };

  const handleAddCustomHelp = (name?: string) => {
    const raw = (name !== undefined ? name : otherHelpInput).trim();
    if (!raw) return;

    const existingPreset = HELP_NEEDED_AREAS.find(h => h.toLowerCase() === raw.toLowerCase());
    const resolved = existingPreset || raw;

    setProfile(prev => {
      const list = (prev.helpNeededAreas || []).filter(h => h !== NO_IDEA_HELP);
      if (!list.includes(resolved)) {
        return { ...prev, helpNeededAreas: [...list, resolved] };
      }
      return prev;
    });

    if (!existingPreset) {
      setCustomHelpAreas(prev => Array.from(new Set([...prev, resolved])));
    }
    setOtherHelpInput('');
    setIsAddingOtherHelp(false);
    showToast('success', 'Guidance Area Added', `"${resolved}" added to your guidance areas.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header and Progress */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              STUDENT ONBOARDING • STEP {currentStep} OF {totalSteps}
            </Text>
            <TouchableOpacity onPress={() => handleSaveStep()}>
              <Text style={[typography.captionBold, { color: colors.textMuted }]}>Save Draft</Text>
            </TouchableOpacity>
          </View>
          <Text style={[typography.h2, styles.screenTitle]}>
            Set Up Your Builder Profile
          </Text>
          <ProgressBar value={progressPercent} showLabel size="md" style={{ marginTop: spacing.sm }} />
        </View>

        {/* Step Content Card */}
        <Card padding="lg" style={styles.stepCard}>
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Personal Information</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Tell mentors who you are and where they can view your past code.
              </Text>
              <Input
                label="Full Name"
                value={user?.fullName || ''}
                editable={false}
                helperText="Configured during registration"
              />
              <Input
                label="GitHub Profile URL"
                placeholder="https://github.com/username"
                value={profile.githubUrl || ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, githubUrl: text }))}
                autoCapitalize="none"
              />
              <Input
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedinUrl || ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, linkedinUrl: text }))}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* STEP 2: Education */}
          {currentStep === 2 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Education & College</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Which college are you studying at and what is your graduation year?
              </Text>
              <Input
                label="College / University Name"
                placeholder="e.g. IIT Delhi, BITS Pilani, DTU"
                value={profile.college || ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, college: text }))}
              />
              <Input
                label="Degree / Major"
                placeholder="e.g. B.Tech Computer Science & Engineering"
                value={profile.degree || ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, degree: text }))}
              />
              <Text style={[typography.captionBold, { color: colors.textMain, marginBottom: spacing.xs }]}>
                Graduation Year:
              </Text>
              <View style={styles.chipsWrap}>
                {[2025, 2026, 2027, 2028].map(yr => (
                  <Chip
                    key={yr}
                    label={yr === 2026 ? '2026 (Final Year)' : String(yr)}
                    selected={profile.graduationYear === yr}
                    onPress={() => setProfile(prev => ({ ...prev, graduationYear: yr }))}
                  />
                ))}
              </View>
            </View>
          )}

          {/* STEP 3: Current Skills */}
          {currentStep === 3 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Current Skills & Familiarities</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Select technologies you already have some working familiarity with, search through 75+ skills, or add custom skills:
              </Text>

              {/* Selected Skills Summary */}
              <View style={styles.selectedSkillsBox}>
                <View style={styles.selectedHeaderRow}>
                  <Text style={[typography.captionBold, { color: colors.textSubtle }]}>
                    SELECTED SKILLS ({profile.currentSkills?.length || 0})
                  </Text>
                  {(profile.currentSkills?.length || 0) > 0 && (
                    <TouchableOpacity onPress={() => setProfile(prev => ({ ...prev, currentSkills: [] }))}>
                      <Text style={[typography.captionBold, { color: colors.danger }]}>Clear all</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.chipsWrap, { marginBottom: 0, marginTop: spacing.xs }]}>
                  {profile.currentSkills && profile.currentSkills.length > 0 ? (
                    profile.currentSkills.map(skill => (
                      <Chip
                        key={skill}
                        label={`${skill} ✕`}
                        selected={true}
                        onPress={() => removeSkill(skill)}
                        style={{ marginRight: 6, marginBottom: 6 }}
                      />
                    ))
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted, fontStyle: 'italic' }]}>
                      No skills selected yet. Select from below, search, or add custom skills.
                    </Text>
                  )}
                </View>
              </View>

              {/* Search Bar */}
              <Input
                placeholder="Search 75+ skills (e.g. Python, Docker, Rust)..."
                value={skillSearch}
                onChangeText={setSkillSearch}
                leftIcon={<Icon name="search" size={18} color={colors.textMuted} />}
                rightIcon={
                  skillSearch ? (
                    <TouchableOpacity onPress={() => setSkillSearch('')}>
                      <Icon name="close" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  ) : undefined
                }
              />

              {/* Add Custom Skill Banner when searching */}
              {queryTrimmed.length > 0 && !hasExactSkillMatch && (
                <View style={styles.customSkillPrompt}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>
                      Can't find "{queryTrimmed}"?
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      Add it as your custom skill.
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => handleAddCustomSkill(queryTrimmed)}
                    leftIcon={<Icon name="plus" size={14} color={colors.white} />}
                  >
                    Add Skill
                  </Button>
                </View>
              )}

              {/* Inline Custom Skill Input */}
              {isAddingOther && (
                <View style={styles.otherInputCard}>
                  <Text style={[typography.captionBold, { color: colors.textMain, marginBottom: spacing.xs }]}>
                    Add Custom Skill:
                  </Text>
                  <Input
                    placeholder="e.g. Solidity, FPGA, Three.js, Julia..."
                    value={otherSkillInput}
                    onChangeText={setOtherSkillInput}
                    autoFocus
                  />
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                    <Button
                      size="sm"
                      onPress={() => handleAddCustomSkill()}
                      disabled={!otherSkillInput.trim()}
                      leftIcon={<Icon name="plus" size={14} color={colors.white} />}
                      style={{ flex: 1 }}
                    >
                      Add Skill
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => {
                        setIsAddingOther(false);
                        setOtherSkillInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </View>
                </View>
              )}

              {/* Category Filter Chips */}
              {!skillSearch && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: spacing.md }}
                  contentContainerStyle={{ gap: spacing.xs }}
                >
                  {SKILL_CATEGORIES.map(cat => (
                    <Chip
                      key={cat}
                      label={cat}
                      selected={selectedSkillCategory === cat}
                      onPress={() => setSelectedSkillCategory(cat)}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Matching / Filtered Skills Cloud */}
              <View style={{ marginBottom: spacing.xs }}>
                <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                  {skillSearch
                    ? `MATCHING SKILLS (${filteredSkills.length})`
                    : `${selectedSkillCategory.toUpperCase()} SKILLS (${filteredSkills.length})`}
                </Text>
              </View>

              <View style={styles.chipsWrap}>
                {filteredSkills.map(item => (
                  <Chip
                    key={item.name}
                    label={item.name}
                    selected={profile.currentSkills?.includes(item.name)}
                    onPress={() => toggleSkill(item.name)}
                    style={{ marginRight: 6, marginBottom: 6 }}
                  />
                ))}

                {/* Other Skill Chip */}
                <Chip
                  label="+ Other Skill"
                  selected={isAddingOther}
                  onPress={() => setIsAddingOther(prev => !prev)}
                  style={{
                    marginRight: 6,
                    marginBottom: 6,
                    borderStyle: 'dashed'
                  }}
                />
              </View>

              {filteredSkills.length === 0 && (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <Text style={[typography.body, { color: colors.textMuted }]}>
                    No skills matched "{skillSearch}".
                  </Text>
                  <TouchableOpacity onPress={() => handleAddCustomSkill(queryTrimmed)} style={{ marginTop: spacing.xs }}>
                    <Text style={[typography.captionBold, { color: colors.primary }]}>
                      + Add "{queryTrimmed}" as a custom skill
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* STEP 4: Project Vision */}
          {currentStep === 4 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Your Project Vision</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Describe what you want to build. Mentors love clear problem statements!
              </Text>
              <TextArea
                label="Project Idea & Problem Statement"
                placeholder="e.g. I want to build a Distributed Fault-Tolerant Task Queue in Go with Raft consensus, worker heartbeats, and exponential retry queues..."
                rows={6}
                value={profile.projectIdea || ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, projectIdea: text }))}
              />
            </View>
          )}

          {/* STEP 5: Target Technologies */}
          {currentStep === 5 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Target Technologies</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Which tools or languages are you aiming to learn and build this project with? If you're not sure, select "No idea" and mentors will recommend the best stack.
              </Text>

              {/* Special No Idea Card */}
              <TouchableOpacity
                onPress={() => toggleTargetTech(NO_IDEA_TECH)}
                style={[
                  styles.otherInputCard,
                  {
                    borderWidth: profile.targetTechnologies?.includes(NO_IDEA_TECH) ? 2 : 1,
                    borderColor: profile.targetTechnologies?.includes(NO_IDEA_TECH) ? colors.primary : colors.border,
                    backgroundColor: profile.targetTechnologies?.includes(NO_IDEA_TECH) ? colors.primaryLight : colors.surfaceSubtle,
                    marginBottom: spacing.md
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text style={[typography.bodyBold, { color: profile.targetTechnologies?.includes(NO_IDEA_TECH) ? colors.primary : colors.textMain }]}>
                      {NO_IDEA_TECH}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      Unsure which stack fits best? Your mentor will review requirements and recommend the stack during kickoff.
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: profile.targetTechnologies?.includes(NO_IDEA_TECH) ? colors.primary : colors.white,
                      borderWidth: profile.targetTechnologies?.includes(NO_IDEA_TECH) ? 0 : 1.5,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {profile.targetTechnologies?.includes(NO_IDEA_TECH) && (
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Inline Custom Tech Form */}
              {isAddingOtherTech && (
                <View style={styles.otherInputCard}>
                  <Text style={[typography.captionBold, { color: colors.textMain, marginBottom: spacing.xs }]}>
                    Add Custom Technology or Framework
                  </Text>
                  <Input
                    placeholder="e.g. Elixir, Apache Flink, Neo4j, Unreal Engine"
                    value={otherTechInput}
                    onChangeText={setOtherTechInput}
                    autoFocus
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xs }}>
                    <Button
                      size="sm"
                      onPress={() => handleAddCustomTech()}
                      disabled={!otherTechInput.trim()}
                    >
                      Add Tech
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        setIsAddingOtherTech(false);
                        setOtherTechInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </View>
                </View>
              )}

              <View style={{ marginBottom: spacing.xs }}>
                <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                  SELECT SPECIFIC TECHNOLOGIES ({allTargetTechOptions.length})
                </Text>
              </View>

              <View style={styles.chipsWrap}>
                {allTargetTechOptions.map(tech => (
                  <Chip
                    key={tech}
                    label={tech}
                    selected={profile.targetTechnologies?.includes(tech)}
                    onPress={() => toggleTargetTech(tech)}
                    style={{ marginRight: 6, marginBottom: 6 }}
                  />
                ))}

                {/* + Other Tech Chip */}
                <Chip
                  label="+ Other Tech"
                  selected={isAddingOtherTech}
                  onPress={() => setIsAddingOtherTech(prev => !prev)}
                  style={{
                    marginRight: 6,
                    marginBottom: 6,
                    borderStyle: 'dashed'
                  }}
                />
              </View>
            </View>
          )}

          {/* STEP 6: Help Needed Areas */}
          {currentStep === 6 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Where Do You Need Guidance?</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Select the primary areas where mentor guidance will unblock you the most. If you're unsure where to start, choose "No idea".
              </Text>

              {/* Special No Idea Card */}
              <TouchableOpacity
                onPress={() => toggleHelpArea(NO_IDEA_HELP)}
                style={[
                  styles.otherInputCard,
                  {
                    borderWidth: profile.helpNeededAreas?.includes(NO_IDEA_HELP) ? 2 : 1,
                    borderColor: profile.helpNeededAreas?.includes(NO_IDEA_HELP) ? colors.primary : colors.border,
                    backgroundColor: profile.helpNeededAreas?.includes(NO_IDEA_HELP) ? colors.primaryLight : colors.surfaceSubtle,
                    marginBottom: spacing.md
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: spacing.sm }}>
                    <Text style={[typography.bodyBold, { color: profile.helpNeededAreas?.includes(NO_IDEA_HELP) ? colors.primary : colors.textMain }]}>
                      {NO_IDEA_HELP}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      Unsure what will block you? Mentors will run a 0-to-1 project discovery & roadmap session with you.
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: profile.helpNeededAreas?.includes(NO_IDEA_HELP) ? colors.primary : colors.white,
                      borderWidth: profile.helpNeededAreas?.includes(NO_IDEA_HELP) ? 0 : 1.5,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {profile.helpNeededAreas?.includes(NO_IDEA_HELP) && (
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Inline Custom Help Form */}
              {isAddingOtherHelp && (
                <View style={styles.otherInputCard}>
                  <Text style={[typography.captionBold, { color: colors.textMain, marginBottom: spacing.xs }]}>
                    Add Custom Guidance Focus
                  </Text>
                  <Input
                    placeholder="e.g. Memory profiling & leak detection, Kafka partition rebalancing"
                    value={otherHelpInput}
                    onChangeText={setOtherHelpInput}
                    autoFocus
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xs }}>
                    <Button
                      size="sm"
                      onPress={() => handleAddCustomHelp()}
                      disabled={!otherHelpInput.trim()}
                    >
                      Add Area
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        setIsAddingOtherHelp(false);
                        setOtherHelpInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </View>
                </View>
              )}

              <View style={{ marginBottom: spacing.xs }}>
                <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                  SELECT GUIDANCE TOPICS ({allHelpAreaOptions.length})
                </Text>
              </View>

              <View style={styles.chipsWrap}>
                {allHelpAreaOptions.map(area => (
                  <Chip
                    key={area}
                    label={area}
                    selected={profile.helpNeededAreas?.includes(area)}
                    onPress={() => toggleHelpArea(area)}
                    style={{ marginRight: 6, marginBottom: 6 }}
                  />
                ))}

                {/* + Other Guidance Chip */}
                <Chip
                  label="+ Other Guidance"
                  selected={isAddingOtherHelp}
                  onPress={() => setIsAddingOtherHelp(prev => !prev)}
                  style={{
                    marginRight: 6,
                    marginBottom: 6,
                    borderStyle: 'dashed'
                  }}
                />
              </View>
            </View>
          )}

          {/* STEP 7: Availability Schedule */}
          {currentStep === 7 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Availability Schedule</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                When are you generally available for 1-on-1 video syncs and sprints?
              </Text>
              <Input
                label="Preferred Sync Windows"
                placeholder="e.g. Weekdays post 6 PM & Weekend mornings"
                value={profile.availability || ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, availability: text }))}
              />
            </View>
          )}

          {/* STEP 8: Preview */}
          {currentStep === 8 && (
            <View>
              <Badge variant="success" style={{ marginBottom: spacing.sm }}>
                Final Review
              </Badge>
              <Text style={[typography.h3, styles.stepTitle]}>Profile Summary</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                This is how verified mentors on Guidely will see your profile.
              </Text>

              <View style={styles.previewBox}>
                <Text style={[typography.h3, { color: colors.textMain }]}>{user?.fullName}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {profile.degree} • {profile.college} (Class of {profile.graduationYear})
                </Text>

                <View style={styles.previewDivider} />

                <Text style={[typography.captionBold, { color: colors.textSubtle }]}>PROJECT VISION</Text>
                <Text style={[typography.bodyMedium, { color: colors.textMain, marginTop: 2 }]}>
                  {profile.projectIdea}
                </Text>

                <View style={styles.previewDivider} />

                <Text style={[typography.captionBold, { color: colors.textSubtle }]}>
                  CURRENT SKILLS & FAMILIARITIES ({profile.currentSkills?.length || 0})
                </Text>
                <View style={styles.chipsWrap}>
                  {profile.currentSkills && profile.currentSkills.length > 0 ? (
                    profile.currentSkills.map(s => (
                      <Badge key={s} variant="neutral" size="sm" style={{ marginRight: 4, marginTop: 4 }}>
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      None selected
                    </Text>
                  )}
                </View>

                <View style={styles.previewDivider} />

                <Text style={[typography.captionBold, { color: colors.textSubtle }]}>TARGET TECHNOLOGIES</Text>
                <View style={styles.chipsWrap}>
                  {profile.targetTechnologies && profile.targetTechnologies.length > 0 ? (
                    profile.targetTechnologies.map(t => (
                      <Badge
                        key={t}
                        variant={t === NO_IDEA_TECH ? 'secondary' : 'primary'}
                        size="sm"
                        style={{ marginRight: 4, marginTop: 4 }}
                      >
                        {t}
                      </Badge>
                    ))
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      None selected (Mentor advice)
                    </Text>
                  )}
                </View>

                <View style={styles.previewDivider} />

                <Text style={[typography.captionBold, { color: colors.textSubtle }]}>GUIDANCE NEEDED IN</Text>
                <View style={styles.chipsWrap}>
                  {profile.helpNeededAreas && profile.helpNeededAreas.length > 0 ? (
                    profile.helpNeededAreas.map(h => (
                      <Badge
                        key={h}
                        variant={h === NO_IDEA_HELP ? 'secondary' : 'warning'}
                        size="sm"
                        style={{ marginRight: 4, marginTop: 4 }}
                      >
                        {h}
                      </Badge>
                    ))
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      None selected (Discovery session)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {currentStep > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onPress={() => handleSaveStep(currentStep - 1)}
                leftIcon={<Icon name="arrow-left" size={16} color={colors.textMain} />}
              >
                Back
              </Button>
            ) : <View />}

            {currentStep < totalSteps ? (
              <Button
                size="md"
                onPress={() => handleSaveStep(currentStep + 1)}
                isLoading={isLoading}
                rightIcon={<Icon name="arrow-right" size={16} color={colors.white} />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                onPress={handleComplete}
                isLoading={isLoading}
                rightIcon={<Icon name="sparkles" size={16} color={colors.white} />}
              >
                Finish & Go to Home
              </Button>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.lg,
    paddingVertical: spacing.xl
  },
  header: {
    marginBottom: spacing.lg
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  screenTitle: {
    color: colors.textMain
  },
  stepCard: {
    padding: spacing.xl,
    ...shadows.md
  },
  stepTitle: {
    color: colors.textMain,
    marginBottom: spacing.xs
  },
  stepDesc: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md
  },
  selectedSkillsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md
  },
  selectedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  customSkillPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  otherInputCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md
  },
  previewBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm + 2
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.lg
  }
});
