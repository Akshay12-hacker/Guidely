// Mobile Student Dashboard Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/student.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDateTime } from '../../utils/formatters';

export interface StudentDashboardScreenProps {
  onNavigate: (route: string, params?: any) => void;
}

export const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await studentService.getDashboardData();
      setData(res);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleJoinVideo = (meetingUrl: string) => {
    if (meetingUrl) {
      Linking.openURL(meetingUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CardSkeleton />
        <CardSkeleton />
      </View>
    );
  }

  const {
    profileCompletionPercentage = 85,
    activeProject,
    nextSession,
    pendingRequests = [],
    recommendedMentors = []
  } = data || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Top Greeting */}
      <View style={styles.greetingHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h1, styles.greetingTitle]}>
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Student'} 👋
          </Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Welcome back to your project workspace
          </Text>
        </View>
        <Avatar name={user?.fullName || 'Student'} src={user?.avatarUrl} size="md" />
      </View>

      {/* Profile Completion Alert */}
      {profileCompletionPercentage < 100 && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onNavigate('onboarding')}
          style={styles.profileBanner}
        >
          <View style={styles.bannerLeft}>
            <Icon name="sparkles" size={20} color={colors.primary} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={[typography.captionBold, { color: colors.primaryDark }]}>
                Profile {profileCompletionPercentage}% complete
              </Text>
              <Text style={[typography.caption, { color: colors.primary, fontSize: 11 }]}>
                Complete onboarding to increase mentor match rates
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Quick Action Chips Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        <Button
          size="sm"
          variant="secondary"
          onPress={() => onNavigate('discover')}
          leftIcon={<Icon name="compass" size={15} color={colors.primary} />}
          style={styles.actionChip}
        >
          Find Mentor
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => onNavigate('project')}
          leftIcon={<Icon name="folder-kanban" size={15} color={colors.primary} />}
          style={styles.actionChip}
        >
          My Project
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => onNavigate('sessions')}
          leftIcon={<Icon name="calendar" size={15} color={colors.primary} />}
          style={styles.actionChip}
        >
          Sessions
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => onNavigate('requests')}
          leftIcon={<Icon name="folder-kanban" size={15} color={colors.primary} />}
          style={styles.actionChip}
        >
          Requests ({pendingRequests.length})
        </Button>
      </ScrollView>

      {/* ACTIVE PROJECT CARD */}
      <Card padding="lg" style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Text style={[typography.captionBold, styles.cardCategory]}>ACTIVE PROJECT</Text>
          {activeProject ? (
            <Badge variant={activeProject.status === 'COMPLETED' ? 'completed' : 'in_progress'} size="sm">
              {activeProject.status}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">No Project</Badge>
          )}
        </View>

        {activeProject ? (
          <View>
            <Text style={[typography.h3, styles.projectTitle]}>
              {activeProject.title}
            </Text>
            <Text style={[typography.body, styles.projectDesc]} numberOfLines={2}>
              {activeProject.description}
            </Text>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[typography.captionBold, { color: colors.textMuted }]}>Project Completion</Text>
                <Text style={[typography.captionBold, { color: colors.primary }]}>{activeProject.progress_percentage}%</Text>
              </View>
              <ProgressBar value={activeProject.progress_percentage} size="md" />
            </View>

            {/* Mentor Info */}
            {activeProject.mentor_name ? (
              <View style={styles.mentorRow}>
                <Avatar
                  name={activeProject.mentor_name}
                  src={activeProject.mentor_avatar}
                  size="sm"
                  isVerified
                />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[typography.bodyBold, { fontSize: 13.5 }]}>{activeProject.mentor_name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {activeProject.mentor_title || 'Mentor'} • {activeProject.mentor_company || ''}
                  </Text>
                </View>
              </View>
            ) : null}

            <Button
              size="md"
              onPress={() => onNavigate('project', { projectId: activeProject.id })}
              fullWidth
              rightIcon={<Icon name="arrow-right" size={16} color={colors.white} />}
              style={{ marginTop: spacing.md }}
            >
              Open Project Workspace
            </Button>
          </View>
        ) : (
          <EmptyState
            iconName="folder-kanban"
            title="No Active Project Yet"
            description="Request 1-on-1 mentorship with an engineer to launch your project workspace."
            actionText="Find a Mentor →"
            onAction={() => onNavigate('discover')}
          />
        )}
      </Card>

      {/* NEXT SESSION CARD */}
      <Card padding="lg" style={styles.cardSection}>
        <View style={styles.cardHeader}>
          <Text style={[typography.captionBold, styles.cardCategory]}>NEXT MENTORING SESSION</Text>
          {nextSession && (
            <Badge variant={nextSession.status === 'CONFIRMED' ? 'success' : 'pending'} size="sm">
              {nextSession.status}
            </Badge>
          )}
        </View>

        {nextSession ? (
          <View>
            <Text style={[typography.h3, styles.projectTitle]}>
              {nextSession.title}
            </Text>
            <Text style={[typography.body, styles.projectDesc]} numberOfLines={2}>
              {nextSession.agenda}
            </Text>

            <View style={styles.sessionTimeBox}>
              <View style={styles.timeRow}>
                <Icon name="clock" size={16} color={colors.primary} />
                <Text style={[typography.captionBold, { color: colors.textMain, marginLeft: 6 }]}>
                  {formatDateTime(nextSession.scheduled_at)}
                </Text>
              </View>
              <View style={styles.mentorRowSimple}>
                <Avatar name={nextSession.mentor_name} src={nextSession.mentor_avatar} size="xs" isVerified />
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 6 }]}>
                  with {nextSession.mentor_name} ({nextSession.mentor_company})
                </Text>
              </View>
            </View>

            {nextSession.meeting_url ? (
              <Button
                variant="success"
                size="md"
                onPress={() => handleJoinVideo(nextSession.meeting_url)}
                fullWidth
                leftIcon={<Icon name="video" size={18} color={colors.white} />}
                style={{ marginTop: spacing.md }}
              >
                Join Video Meeting Room
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onPress={() => onNavigate('sessions')}
                fullWidth
                style={{ marginTop: spacing.md }}
              >
                View Session Details
              </Button>
            )}
          </View>
        ) : (
          <EmptyState
            iconName="calendar"
            title="No Upcoming Syncs"
            description="Book a 1-on-1 video call to unblock architecture trade-offs or review code."
            actionText="Schedule Session"
            onAction={() => onNavigate('sessions')}
          />
        )}
      </Card>

      {/* RECOMMENDED MENTORS */}
      <View style={styles.recommendedSection}>
        <View style={styles.recommendedHeader}>
          <Text style={[typography.h3, styles.sectionTitle]}>
            Recommended Mentors
          </Text>
          <TouchableOpacity onPress={() => onNavigate('discover')}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>View All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mentorsScroll}>
          {recommendedMentors.map((m: any) => (
            <Card
              key={m.id}
              padding="md"
              style={styles.mentorCard}
              onPress={() => onNavigate('mentor-profile', { mentorId: m.id })}
            >
              <View style={styles.mentorCardTop}>
                <Avatar name={m.full_name} src={m.avatar_url} size="md" isVerified isOnline />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[typography.bodyBold, { fontSize: 13.5 }]} numberOfLines={1}>
                    {m.full_name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10.5 }]} numberOfLines={1}>
                    {m.company}
                  </Text>
                </View>
              </View>

              <View style={styles.mentorCardBottom}>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={13} color="#F59E0B" />
                  <Text style={[typography.captionBold, { fontSize: 11.5, marginLeft: 3 }]}>
                    {m.rating || 5.0}
                  </Text>
                </View>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => onNavigate('mentor-profile', { mentorId: m.id })}
                  style={{ paddingHorizontal: 10, minHeight: 30 }}
                >
                  View
                </Button>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  loadingContainer: {
    padding: spacing.lg
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  greetingTitle: {
    color: colors.textMain,
    marginBottom: 2
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  quickActionsScroll: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.lg
  },
  actionChip: {
    paddingHorizontal: spacing.md
  },
  cardSection: {
    marginBottom: spacing.lg,
    ...shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  cardCategory: {
    color: colors.textSubtle,
    fontSize: 10.5,
    letterSpacing: 0.5
  },
  projectTitle: {
    color: colors.textMain,
    marginBottom: spacing.xs
  },
  projectDesc: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md
  },
  progressContainer: {
    marginBottom: spacing.md
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm + 2
  },
  sessionTimeBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mentorRowSimple: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recommendedSection: {
    marginTop: spacing.sm
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  sectionTitle: {
    color: colors.textMain
  },
  mentorsScroll: {
    flexDirection: 'row',
    gap: spacing.md
  },
  mentorCard: {
    width: 220,
    marginBottom: 0
  },
  mentorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  mentorCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
