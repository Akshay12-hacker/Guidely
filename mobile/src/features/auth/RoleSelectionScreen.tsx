// Mobile Role Selection Screen (Post-Registration / Change Role)

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { UserRole } from '../../types';

export interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Badge variant="primary" style={{ alignSelf: 'center', marginBottom: spacing.sm }}>
            Personalize Experience
          </Badge>
          <Text style={[typography.h1, styles.title]}>
            How will you use Guidely?
          </Text>
          <Text style={[typography.body, styles.subtitle]}>
            Choose your primary role to configure your dedicated mobile workspace.
          </Text>
        </View>

        {/* Student Card */}
        <Card padding="lg" style={styles.roleCard}>
          <View style={styles.iconCircleStudent}>
            <Icon name="graduation-cap" size={26} color={colors.primary} />
          </View>
          <Text style={[typography.h2, styles.cardTitle]}>
            Student Builder
          </Text>
          <Text style={[typography.body, styles.cardDesc]}>
            "Have an idea? Find an experienced engineer who can help you build it."
          </Text>

          <View style={styles.benefitsList}>
            {[
              '1-on-1 mentorship with engineers from top tech firms',
              'Collaborative workspace with goals, milestones & tasks',
              'Code reviews, architecture guidance & debugging help',
              'Build resume-defining software that gets you hired'
            ].map((benefit, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={[typography.caption, styles.benefitText]}>{benefit}</Text>
              </View>
            ))}
          </View>

          <Button
            size="lg"
            variant="primary"
            onPress={() => onSelectRole('STUDENT')}
            fullWidth
            rightIcon={<Icon name="arrow-right" size={16} color={colors.white} />}
          >
            Continue as Student
          </Button>
        </Card>

        {/* Mentor Card */}
        <Card padding="lg" style={styles.roleCard}>
          <View style={styles.iconCircleMentor}>
            <Icon name="briefcase" size={26} color={colors.success} />
          </View>
          <Text style={[typography.h2, styles.cardTitle]}>
            Industry Mentor
          </Text>
          <Text style={[typography.body, styles.cardDesc]}>
            "Share your experience and guide students through real software projects."
          </Text>

          <View style={styles.benefitsList}>
            {[
              'Guide motivated CSE students on real architecture',
              'Set your own schedule and preferred mentoring topics',
              'Conduct 1-on-1 video code reviews & system design syncs',
              'Earn verified mentor status and public student reviews'
            ].map((benefit, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <Icon name="check-circle" size={16} color={colors.success} />
                <Text style={[typography.caption, styles.benefitText]}>{benefit}</Text>
              </View>
            ))}
          </View>

          <Button
            size="lg"
            variant="secondary"
            onPress={() => onSelectRole('MENTOR')}
            fullWidth
            rightIcon={<Icon name="arrow-right" size={16} color={colors.textMain} />}
          >
            Continue as Mentor
          </Button>
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
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 290
  },
  roleCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md
  },
  iconCircleStudent: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  iconCircleMentor: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  cardTitle: {
    marginBottom: spacing.xs
  },
  cardDesc: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  benefitsList: {
    gap: spacing.sm + 2,
    marginBottom: spacing.xl
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  benefitText: {
    flex: 1,
    color: colors.textMain,
    lineHeight: 18
  }
});
