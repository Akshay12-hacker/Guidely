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
  const [profile, setProfile] = useState<Partial<MentorProfile>>({
    title: 'Staff Software Engineer',
    company: 'Google',
    college: 'IIT Madras',
    yearsExperience: 8,
    bio: 'Distributed systems architect with 8+ years building high-throughput services at Google. Passionate about helping students build real-world systems.',
    skills: ['Go', 'Distributed Systems', 'Kubernetes', 'gRPC', 'PostgreSQL'],
    technologies: ['Go (Golang)', 'Kubernetes', 'gRPC', 'Docker', 'PostgreSQL'],
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

  const toggleTech = (t: string) => {
    const list = profile.technologies || [];
    setProfile(prev => ({
      ...prev,
      technologies: list.includes(t) ? list.filter(x => x !== t) : [...list, t]
    }));
  };

  const toggleTopic = (tp: string) => {
    const list = profile.mentoringTopics || [];
    setProfile(prev => ({
      ...prev,
      mentoringTopics: list.includes(tp) ? list.filter(x => x !== tp) : [...list, tp]
    }));
  };

  const allSkills = ['Distributed Systems', 'Machine Learning', 'Cloud Architecture', 'Frontend Systems', 'Smart Contracts', 'Security & Cryptography', 'DevOps & SRE', 'Database Internals'];
  const allTech = ['Go (Golang)', 'PyTorch', 'Rust', 'Kubernetes', 'gRPC', 'WebRTC', 'React', 'TypeScript', 'PostgreSQL', 'Docker'];
  const allTopics = ['Architecture & System Design', '1-on-1 Code Reviews & Best Practices', 'Concurrency & Deadlock Prevention', 'Benchmarking & Load Testing', 'Resume & Interview Prep'];

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
                {[2, 4, 6, 8, 10, 15].map(exp => (
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

          {/* STEP 3: Bio */}
          {currentStep === 3 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>About & Mentoring Philosophy</Text>
              <TextArea
                label="Professional Bio"
                rows={5}
                value={profile.bio || ''}
                onChangeText={t => setProfile(prev => ({ ...prev, bio: t }))}
              />
            </View>
          )}

          {/* STEP 4: Core Domains */}
          {currentStep === 4 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Core Engineering Domains</Text>
              <View style={styles.chipsWrap}>
                {allSkills.map(s => (
                  <Chip
                    key={s}
                    label={s}
                    selected={profile.skills?.includes(s)}
                    onPress={() => toggleSkill(s)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* STEP 5: Technologies */}
          {currentStep === 5 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Technologies & Stacks</Text>
              <View style={styles.chipsWrap}>
                {allTech.map(t => (
                  <Chip
                    key={t}
                    label={t}
                    selected={profile.technologies?.includes(t)}
                    onPress={() => toggleTech(t)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* STEP 6: Mentoring Topics */}
          {currentStep === 6 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Mentoring Topics</Text>
              <View style={styles.chipsWrap}>
                {allTopics.map(topic => (
                  <Chip
                    key={topic}
                    label={topic}
                    selected={profile.mentoringTopics?.includes(topic)}
                    onPress={() => toggleTopic(topic)}
                  />
                ))}
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
