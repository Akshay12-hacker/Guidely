// Mobile 9-Step Mentor Onboarding Wizard

import React, { useState, useEffect } from 'react';
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
import { mentorService } from '../../services/mentor.service';
import { MentorProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Chip } from '../../components/common/Chip';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface MentorOnboardingScreenProps {
  onComplete: () => void;
}

export const MentorOnboardingScreen: React.FC<MentorOnboardingScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customTechInput, setCustomTechInput] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');

  const [profile, setProfile] = useState<Partial<MentorProfile>>({
    title: 'Staff Software Engineer',
    company: 'Google',
    college: 'IIT Madras',
    yearsExperience: 8,
    bio: 'Distributed systems architect with 8+ years building high-throughput services at Google. Passionate about helping students build real-world systems.',
    skills: ['Go', 'Distributed Systems', 'Kubernetes', 'gRPC', 'PostgreSQL'],
    technologies: ['Go (Golang)', 'Kubernetes', 'gRPC', 'Docker', 'PostgreSQL'],
    experienceHighlights: ['High-Throughput Production Systems (10k+ QPS)', 'Open Source Maintainer / Core Contributor'],
    projectsExperience: 'Architected distributed stream processing engine handling 10k RPS at Google; Contributor to open-source RPC libraries.',
    mentoringTopics: ['Architecture & System Design', '1-on-1 Code Reviews', 'Concurrency & Deadlocks'],
    availabilitySchedule: 'Weekdays post 6:30 PM IST & Saturday mornings',
    hourlyRate: 0,
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com'
  });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await mentorService.getProfile();
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
          if (data.onboardingStep && data.onboardingStep > 1) {
            setCurrentStep(Math.min(data.onboardingStep, 9));
          }
        }
      } catch {
        // use default
      }
    };
    fetchExisting();
  }, []);

  const totalSteps = 9;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleSaveStep = async (nextStep?: number) => {
    setIsLoading(true);
    try {
      const stepToSave = nextStep || currentStep;
      await mentorService.saveOnboardingStep(stepToSave, profile);
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
      await mentorService.saveOnboardingStep(9, { ...profile, isCompleted: true });
      showToast('success', 'Mentor Profile Submitted! 🎉', 'Your profile is now live on the marketplace.');
      setTimeout(() => {
        onComplete();
      }, 600);
    } catch (err: any) {
      showToast('error', 'Completion Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (s: string) => {
    const list = profile.skills || [];
    setProfile(prev => ({
      ...prev,
      skills: list.includes(s) ? list.filter(x => x !== s) : [...list, s]
    }));
  };

  const removeSkill = (s: string) => {
    setProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(x => x !== s)
    }));
  };

  const handleAddSkill = () => {
    const clean = customSkillInput.trim();
    if (!clean) return;
    const list = profile.skills || [];
    if (list.some(s => s.toLowerCase() === clean.toLowerCase())) {
      showToast('info', 'Already Added', `"${clean}" is already in your skills.`);
      setCustomSkillInput('');
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), clean]
    }));
    setCustomSkillInput('');
    showToast('success', 'Skill Added', `"${clean}" added to your domains.`);
  };

  const toggleTech = (t: string) => {
    const list = profile.technologies || [];
    setProfile(prev => ({
      ...prev,
      technologies: list.includes(t) ? list.filter(x => x !== t) : [...list, t]
    }));
  };

  const removeTech = (t: string) => {
    setProfile(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(x => x !== t)
    }));
  };

  const handleAddTech = () => {
    const clean = customTechInput.trim();
    if (!clean) return;
    const list = profile.technologies || [];
    if (list.some(t => t.toLowerCase() === clean.toLowerCase())) {
      showToast('info', 'Already Added', `"${clean}" is already in your tech stack.`);
      setCustomTechInput('');
      return;
    }
    setProfile(prev => ({
      ...prev,
      technologies: [...(prev.technologies || []), clean]
    }));
    setCustomTechInput('');
    showToast('success', 'Technology Added', `"${clean}" added.`);
  };

  const toggleTopic = (tp: string) => {
    const list = profile.mentoringTopics || [];
    setProfile(prev => ({
      ...prev,
      mentoringTopics: list.includes(tp) ? list.filter(x => x !== tp) : [...list, tp]
    }));
  };

  const removeTopic = (tp: string) => {
    setProfile(prev => ({
      ...prev,
      mentoringTopics: (prev.mentoringTopics || []).filter(x => x !== tp)
    }));
  };

  const handleAddTopic = () => {
    const clean = customTopicInput.trim();
    if (!clean) return;
    const list = profile.mentoringTopics || [];
    if (list.some(tp => tp.toLowerCase() === clean.toLowerCase())) {
      showToast('info', 'Already Added', `"${clean}" is already in your mentoring topics.`);
      setCustomTopicInput('');
      return;
    }
    setProfile(prev => ({
      ...prev,
      mentoringTopics: [...(prev.mentoringTopics || []), clean]
    }));
    setCustomTopicInput('');
    showToast('success', 'Topic Added', `"${clean}" added.`);
  };

  const allSkills = [
    'Distributed Systems',
    'Machine Learning',
    'Cloud Architecture',
    'Frontend Systems',
    'Smart Contracts',
    'Security & Cryptography',
    'DevOps & SRE',
    'Database Internals',
    'Generative AI & LLMs',
    'Mobile Architecture'
  ];
  const allTech = [
    'Go (Golang)',
    'PyTorch',
    'Rust',
    'Kubernetes',
    'gRPC',
    'WebRTC',
    'React',
    'TypeScript',
    'PostgreSQL',
    'Docker',
    'Flutter',
    'Python',
    'FastAPI',
    'AWS'
  ];
  const allTopics = [
    'Architecture & System Design',
    '1-on-1 Code Reviews & Best Practices',
    'Concurrency & Deadlock Prevention',
    'Benchmarking & Load Testing',
    'Resume & Interview Prep',
    'Capstone Milestone Planning'
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              MENTOR ONBOARDING • STEP {currentStep} OF {totalSteps}
            </Text>
            <TouchableOpacity onPress={() => handleSaveStep()}>
              <Text style={[typography.captionBold, { color: colors.textMuted }]}>Save Draft</Text>
            </TouchableOpacity>
          </View>
          <Text style={[typography.h2, styles.screenTitle]}>
            Configure Your Mentorship Profile
          </Text>
          <ProgressBar value={progressPercent} showLabel size="md" style={{ marginTop: spacing.sm }} />
        </View>

        <Card padding="lg" style={styles.stepCard}>
          {/* STEP 1: Personal */}
          {currentStep === 1 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Personal & Professional Links</Text>
              <Input label="Full Name" value={user?.fullName || ''} editable={false} />
              <Input
                label="LinkedIn Profile"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedinUrl || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, linkedinUrl: t }))}
              />
              <Input
                label="GitHub / Portfolio"
                placeholder="https://github.com/username"
                value={profile.githubUrl || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, githubUrl: t }))}
              />
            </View>
          )}

          {/* STEP 2: Current Role */}
          {currentStep === 2 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Current Role & Company</Text>
              <Input
                label="Job Title"
                placeholder="e.g. Staff Software Engineer"
                value={profile.title || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, title: t }))}
              />
              <Input
                label="Company / Organization"
                placeholder="e.g. Google, Microsoft, Razorpay"
                value={profile.company || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, company: t }))}
              />
              <Input
                label="Alma Mater College"
                placeholder="e.g. IIT Madras, BITS Pilani"
                value={profile.college || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, college: t }))}
              />
              <Text style={[typography.captionBold, { color: colors.textMain, marginBottom: spacing.xs }]}>
                Years of Engineering Experience:
              </Text>
              <View style={styles.chipsWrap}>
                {[1, 2, 3, 4, 5, 8, 10, 15, 20].map(exp => (
                  <Chip
                    key={exp}
                    label={`${exp}+ years`}
                    selected={profile.yearsExperience === exp}
                    onPress={() => setProfile(prev => ({ ...prev, yearsExperience: exp }))}
                  />
                ))}
              </View>
            </View>
          )}

          {/* STEP 3: Bio & Notable Experience */}
          {currentStep === 3 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>About & Experience Highlights</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                Share your engineering background and standout production accomplishments.
              </Text>
              <TextArea
                label="Professional Bio & Philosophy"
                rows={4}
                value={profile.bio || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, bio: t }))}
              />
              <TextArea
                label="Notable Systems, Architecture & Projects"
                placeholder="e.g. Architected distributed stream processing engine handling 10k RPS at Google; Contributor to open-source RPC libraries..."
                rows={3}
                value={profile.projectsExperience || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, projectsExperience: t }))}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}

          {/* STEP 4: Core Domains */}
          {currentStep === 4 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Core Engineering Domains</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                Select or add your domain specializations and technical skills.
              </Text>

              {/* Add Custom Skill */}
              <View style={styles.customAddRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Add custom skill (e.g. LLM Agents, Web3)..."
                    value={customSkillInput}
                    onChangeText={setCustomSkillInput}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <Button size="sm" variant="outline" onPress={handleAddSkill} style={{ marginLeft: spacing.xs }}>
                  Add
                </Button>
              </View>

              {/* Selected Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <View style={{ marginVertical: spacing.sm }}>
                  <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                    Selected ({profile.skills.length}) - Tap to remove:
                  </Text>
                  <View style={styles.chipsWrap}>
                    {profile.skills.map(s => (
                      <Chip
                        key={s}
                        label={`${s} ✕`}
                        selected={true}
                        onPress={() => removeSkill(s)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Suggested Domains */}
              <Text style={[typography.captionBold, { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xs }]}>
                Suggested Domains:
              </Text>
              <View style={styles.chipsWrap}>
                {allSkills.map(s => {
                  const isSelected = profile.skills?.includes(s);
                  return (
                    <Chip
                      key={s}
                      label={s}
                      selected={isSelected}
                      onPress={() => toggleSkill(s)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 5: Technologies */}
          {currentStep === 5 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Technologies & Stacks</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                Languages, frameworks, databases, and tools you have experience in.
              </Text>

              {/* Add Custom Tech */}
              <View style={styles.customAddRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Add new tech (e.g. LangChain, Flutter, Astro)..."
                    value={customTechInput}
                    onChangeText={setCustomTechInput}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <Button size="sm" variant="outline" onPress={handleAddTech} style={{ marginLeft: spacing.xs }}>
                  Add
                </Button>
              </View>

              {/* Selected Tech */}
              {profile.technologies && profile.technologies.length > 0 && (
                <View style={{ marginVertical: spacing.sm }}>
                  <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                    Selected ({profile.technologies.length}) - Tap to remove:
                  </Text>
                  <View style={styles.chipsWrap}>
                    {profile.technologies.map(t => (
                      <Chip
                        key={t}
                        label={`${t} ✕`}
                        selected={true}
                        onPress={() => removeTech(t)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Suggested Tech */}
              <Text style={[typography.captionBold, { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xs }]}>
                Popular Stacks & Tools:
              </Text>
              <View style={styles.chipsWrap}>
                {allTech.map(t => {
                  const isSelected = profile.technologies?.includes(t);
                  return (
                    <Chip
                      key={t}
                      label={t}
                      selected={isSelected}
                      onPress={() => toggleTech(t)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 6: Mentoring Topics */}
          {currentStep === 6 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Mentoring Topics & Formats</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                Coaching topics and review formats you offer to students.
              </Text>

              {/* Add Custom Topic */}
              <View style={styles.customAddRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="Add topic (e.g. AI Hackathons, 1-on-1 Debugging)..."
                    value={customTopicInput}
                    onChangeText={setCustomTopicInput}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <Button size="sm" variant="outline" onPress={handleAddTopic} style={{ marginLeft: spacing.xs }}>
                  Add
                </Button>
              </View>

              {/* Selected Topics */}
              {profile.mentoringTopics && profile.mentoringTopics.length > 0 && (
                <View style={{ marginVertical: spacing.sm }}>
                  <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                    Selected ({profile.mentoringTopics.length}) - Tap to remove:
                  </Text>
                  <View style={styles.chipsWrap}>
                    {profile.mentoringTopics.map(tp => (
                      <Chip
                        key={tp}
                        label={`${tp} ✕`}
                        selected={true}
                        onPress={() => removeTopic(tp)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Suggested Topics */}
              <Text style={[typography.captionBold, { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xs }]}>
                Suggested Topics:
              </Text>
              <View style={styles.chipsWrap}>
                {allTopics.map(topic => {
                  const isSelected = profile.mentoringTopics?.includes(topic);
                  return (
                    <Chip
                      key={topic}
                      label={topic}
                      selected={isSelected}
                      onPress={() => toggleTopic(topic)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 7: Availability */}
          {currentStep === 7 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Availability & Schedule</Text>
              <Input
                label="Weekly Mentoring Windows"
                placeholder="e.g. Weekday evenings post 6:30 PM & Saturday mornings"
                value={profile.availabilitySchedule || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, availabilitySchedule: t }))}
              />
            </View>
          )}

          {/* STEP 8: Verification */}
          {currentStep === 8 && (
            <View>
              <Badge variant="verified" style={{ marginBottom: spacing.sm }}>Verified Shield</Badge>
              <Text style={[typography.h3, styles.stepTitle]}>Identity Verification</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                To maintain high quality, our admin team reviews mentor credentials to award the blue verified shield.
              </Text>
              <Input
                label="Work Email / Verification Note"
                placeholder="you@company.com"
                value={profile.verificationNotes || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, verificationNotes: t }))}
              />
            </View>
          )}

          {/* STEP 9: Review */}
          {currentStep === 9 && (
            <View>
              <Badge variant="success" style={{ marginBottom: spacing.sm }}>Ready to Launch</Badge>
              <Text style={[typography.h3, styles.stepTitle]}>Mentor Profile Preview</Text>
              <View style={styles.previewBox}>
                <Text style={[typography.h3, { color: colors.textMain }]}>{user?.fullName}</Text>
                <Text style={[typography.bodyBold, { color: colors.primary }]}>{profile.title} @ {profile.company}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>{profile.college} • {profile.yearsExperience}+ yrs exp</Text>
                <Text style={[typography.body, { marginTop: spacing.sm, color: colors.textMain }]}>{profile.bio}</Text>
                {profile.projectsExperience ? (
                  <Text style={[typography.caption, { marginTop: spacing.xs, color: colors.textMuted, fontStyle: 'italic' }]}>
                    {profile.projectsExperience}
                  </Text>
                ) : null}
                {profile.skills && profile.skills.length > 0 && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={[typography.captionBold, { color: colors.textMuted }]}>SKILLS</Text>
                    <Text style={[typography.caption, { color: colors.textMain }]}>{profile.skills.join(' • ')}</Text>
                  </View>
                )}
                {profile.technologies && profile.technologies.length > 0 && (
                  <View style={{ marginTop: spacing.xs }}>
                    <Text style={[typography.captionBold, { color: colors.textMuted }]}>TECHNOLOGIES</Text>
                    <Text style={[typography.caption, { color: colors.primary }]}>{profile.technologies.join(', ')}</Text>
                  </View>
                )}
                {profile.mentoringTopics && profile.mentoringTopics.length > 0 && (
                  <View style={{ marginTop: spacing.xs }}>
                    <Text style={[typography.captionBold, { color: colors.textMuted }]}>TOPICS</Text>
                    <Text style={[typography.caption, { color: colors.textMain }]}>{profile.mentoringTopics.join(' • ')}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
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
                Publish Profile
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
  previewBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md
  },
  customAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
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
