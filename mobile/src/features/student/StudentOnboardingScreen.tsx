// Mobile 8-Step Student Onboarding Wizard

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
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    college: 'IIT Delhi',
    degree: 'B.Tech Computer Science & Engineering',
    graduationYear: 2026,
    currentSkills: ['Go', 'C++', 'Data Structures', 'Linux'],
    projectIdea: 'Distributed fault-tolerant task queue with Raft consensus and worker crash heartbeats.',
    targetTechnologies: ['Go (Golang)', 'gRPC', 'PostgreSQL', 'Docker'],
    helpNeededAreas: ['Architecture Design', 'Concurrency & Deadlocks', 'Worker Heartbeats'],
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

  const allSkillsList = [
    'C / C++', 'Java', 'Python', 'Go', 'JavaScript', 'TypeScript',
    'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Data Structures & Algorithms',
    'Linux / Bash', 'Git', 'Docker', 'REST APIs', 'FastAPI'
  ];

  const allTechList = [
    'Go (Golang)', 'PyTorch', 'Rust', 'Kubernetes', 'gRPC', 'WebRTC',
    'Next.js', 'Solidity', 'Apache Spark', 'Kafka', 'Redis', 'WebSockets'
  ];

  const allHelpAreas = [
    'Architecture & System Design',
    'Concurrency & Deadlock Prevention',
    'Database Schema & Normalization',
    '1-on-1 Code Reviews & Best Practices',
    'Model Fine-Tuning & Evaluation',
    'Benchmarking & Load Testing',
    'Deployment & Production Hardening'
  ];

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
              <Text style={[typography.h3, styles.stepTitle]}>Current Skills</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Select technologies you already have some working familiarity with:
              </Text>
              <View style={styles.chipsWrap}>
                {allSkillsList.map(skill => (
                  <Chip
                    key={skill}
                    label={skill}
                    selected={profile.currentSkills?.includes(skill)}
                    onPress={() => toggleSkill(skill)}
                  />
                ))}
              </View>
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
                Which tools or languages are you aiming to learn and build this project with?
              </Text>
              <View style={styles.chipsWrap}>
                {allTechList.map(tech => (
                  <Chip
                    key={tech}
                    label={tech}
                    selected={profile.targetTechnologies?.includes(tech)}
                    onPress={() => toggleTargetTech(tech)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* STEP 6: Help Needed Areas */}
          {currentStep === 6 && (
            <View>
              <Text style={[typography.h3, styles.stepTitle]}>Where Do You Need Guidance?</Text>
              <Text style={[typography.body, styles.stepDesc]}>
                Select the primary areas where human mentor guidance will unblock you:
              </Text>
              <View style={styles.chipsWrap}>
                {allHelpAreas.map(area => (
                  <Chip
                    key={area}
                    label={area}
                    selected={profile.helpNeededAreas?.includes(area)}
                    onPress={() => toggleHelpArea(area)}
                  />
                ))}
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

                <Text style={[typography.captionBold, { color: colors.textSubtle }]}>TARGET TECHNOLOGIES</Text>
                <View style={styles.chipsWrap}>
                  {profile.targetTechnologies?.map(t => (
                    <Badge key={t} variant="primary" size="sm" style={{ marginRight: 4, marginTop: 4 }}>
                      {t}
                    </Badge>
                  ))}
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
