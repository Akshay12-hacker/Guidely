// Mobile Mentor Dashboard Screen

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
import { useToast } from '../../context/ToastContext';
import { mentorService } from '../../services/mentor.service';
import { mentorshipService } from '../../services/mentorship.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDateTime } from '../../utils/formatters';

export interface MentorDashboardScreenProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MentorDashboardScreen: React.FC<MentorDashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await mentorService.getDashboardData();
      setData(res);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleAcceptProposal = async (requestId: string, studentName: string) => {
    setActionLoadingId(requestId);
    try {
      await mentorshipService.respondToRequest(requestId, 'ACCEPT', 'Looking forward to working with you!');
      showToast('success', 'Proposal Accepted! 🚀', `Project workspace created with ${studentName}.`);
      fetchStats();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineProposal = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      await mentorshipService.respondToRequest(requestId, 'REJECT', 'Currently at capacity for new projects.');
      showToast('info', 'Proposal Declined', 'The student has been notified.');
      fetchStats();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleJoinVideo = (meetingUrl?: string) => {
    if (meetingUrl) {
      Linking.openURL(meetingUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <CardSkeleton />
        <CardSkeleton />
      </View>
    );
  }

  const stats = data?.stats || {};
  const activeMenteesCount = stats.activeStudents ?? data?.activeMenteesCount ?? 0;
  const completedMenteesCount = stats.completedProjects ?? data?.completedMenteesCount ?? 0;
  const hoursMentored = stats.hoursMentored ?? data?.hoursMentored ?? 0;
  const averageRating = stats.averageRating ?? data?.averageRating ?? 0;
  const pendingRequests = data?.pendingRequests || data?.incomingRequests || [];
  const activeProjects = data?.activeProjects || [];
  const upcomingSessions = data?.upcomingSessions || [];
  const isVerified = Boolean(data?.profile?.isVerified ?? user?.isVerified);

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
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h1, styles.greetingText]}>
            Mentor Dashboard
          </Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Welcome back, {user?.fullName?.split(' ')[0] || 'Mentor'} 👋
          </Text>
        </View>
        <Avatar name={user?.fullName || 'Mentor'} src={user?.avatarUrl} size="md" isVerified={isVerified} />
      </View>

      {/* Verification Notice */}
      {!isVerified && (
        <View style={styles.pendingNotice}>
          <Text style={[typography.bodyBold, { color: '#92400E', marginBottom: 2 }]}>
            Verification In Progress
          </Text>
          <Text style={[typography.caption, { color: '#B45309' }]}>
            Your mentor credentials and profile are being reviewed by administrators. You will be listed in public discovery once approved.
          </Text>
        </View>
      )}

      {/* KPI Grid */}
      <View style={styles.kpiRow}>
        <StatCard
          label="Active Mentees"
          value={activeMenteesCount}
          iconName="users"
          iconBg={colors.primaryLight}
          iconColor={colors.primary}
        />
        <StatCard
          label="Avg Rating"
          value={averageRating > 0 ? (typeof averageRating === 'number' ? averageRating.toFixed(1) : averageRating) : 'New'}
          iconName="star"
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
      </View>

      <View style={styles.kpiRow}>
        <StatCard
          label="Hours Mentored"
          value={`${hoursMentored}h`}
          iconName="clock"
          iconBg={colors.infoLight}
          iconColor={colors.info}
        />
        <StatCard
          label="Projects Built"
          value={completedMenteesCount}
          iconName="check-circle"
          iconBg={colors.successLight}
          iconColor={colors.success}
        />
      </View>

      {/* INCOMING PROPOSALS TRIAGE QUEUE */}
      <Card padding="lg" style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.captionBold, styles.cardCategory]}>INCOMING STUDENT PROPOSALS</Text>
          <Badge variant={pendingRequests.length > 0 ? 'warning' : 'neutral'} size="sm">
            {pendingRequests.length} Pending
          </Badge>
        </View>

        {pendingRequests.length === 0 ? (
          <EmptyState
            iconName="folder-kanban"
            title="All Caught Up!"
            description="You have reviewed all incoming student project proposals."
          />
        ) : (
          pendingRequests.map((req: any) => (
            <View key={req.id} style={styles.requestItem}>
              <View style={styles.requestHeader}>
                <Avatar name={req.student_name} src={req.student_avatar} size="sm" />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.textMain }]}>{req.student_name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {req.student_college} • {req.student_degree}
                  </Text>
                </View>
              </View>

              <Text style={[typography.h4, { marginTop: spacing.sm, color: colors.textMain }]}>
                {req.project_title}
              </Text>
              <Text style={[typography.body, styles.requestDesc]} numberOfLines={2}>
                {req.project_description}
              </Text>

              <View style={styles.requestActions}>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => handleDeclineProposal(req.id)}
                  disabled={actionLoadingId === req.id}
                  style={styles.actionBtnHalf}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => handleAcceptProposal(req.id, req.student_name)}
                  isLoading={actionLoadingId === req.id}
                  style={styles.actionBtnHalf}
                  rightIcon={<Icon name="check" size={14} color={colors.white} />}
                >
                  Accept & Open Project
                </Button>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* ACTIVE STUDENTS & PROJECTS */}
      <Card padding="lg" style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.captionBold, styles.cardCategory]}>ACTIVE MENTORSHIP WORKSPACES</Text>
          <Badge variant="primary" size="sm">{activeProjects.length} Active</Badge>
        </View>

        {activeProjects.length === 0 ? (
          <EmptyState
            iconName="folder-kanban"
            title="No Active Projects"
            description="Accept a student proposal to start collaborating on real code."
          />
        ) : (
          activeProjects.map((proj: any) => (
            <TouchableOpacity
              key={proj.id}
              activeOpacity={0.85}
              onPress={() => onNavigate('project', { projectId: proj.id })}
              style={styles.projectItem}
            >
              <View style={styles.projHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h4, { color: colors.textMain }]}>{proj.title}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Student: {proj.student_name} ({proj.student_college})
                  </Text>
                </View>
                <Badge variant={proj.status === 'COMPLETED' ? 'completed' : 'in_progress'} size="sm">
                  {proj.status}
                </Badge>
              </View>

              <View style={styles.progressBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Milestones Progress</Text>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>{proj.progress_percentage}%</Text>
                </View>
                <ProgressBar value={proj.progress_percentage} size="sm" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>

      {/* UPCOMING SESSIONS */}
      <Card padding="lg" style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={[typography.captionBold, styles.cardCategory]}>UPCOMING 1-ON-1 SYNCS</Text>
        </View>

        {upcomingSessions.length === 0 ? (
          <EmptyState
            iconName="calendar"
            title="No Scheduled Meetings"
            description="Students will book sessions with you based on your availability schedule."
          />
        ) : (
          upcomingSessions.map((s: any) => (
            <View key={s.id} style={styles.sessionItem}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textMain }]}>{s.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  with {s.student_name} • {formatDateTime(s.scheduled_at)}
                </Text>
              </View>

              {s.meeting_url ? (
                <Button
                  size="sm"
                  variant="success"
                  onPress={() => handleJoinVideo(s.meeting_url)}
                  leftIcon={<Icon name="video" size={14} color={colors.white} />}
                >
                  Join
                </Button>
              ) : null}
            </View>
          ))
        )}
      </Card>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg
  },
  greetingText: {
    color: colors.textMain,
    marginBottom: 2
  },
  pendingNotice: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  sectionCard: {
    marginTop: spacing.md,
    ...shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  cardCategory: {
    color: colors.textSubtle,
    fontSize: 10.5,
    letterSpacing: 0.5
  },
  requestItem: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  requestDesc: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md
  },
  actionBtnHalf: {
    flex: 1
  },
  projectItem: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  projHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  progressBox: {
    marginTop: spacing.sm
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border
  }
});
