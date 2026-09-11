// Mobile Mentoring Sessions & Jitsi Video Calls Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sessionService } from '../../services/session.service';
import { mentorService } from '../../services/mentor.service';
import { MentorshipSession, MentorProfile, User } from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { ReviewModal } from './ReviewModal';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDateTime } from '../../utils/formatters';

export interface SessionsScreenProps {
  onBack?: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export const SessionsScreen: React.FC<SessionsScreenProps> = ({ onBack, onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [filter, setFilter] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Request Session Modal
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [mentorsList, setMentorsList] = useState<(MentorProfile & { user: User })[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionAgenda, setSessionAgenda] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionDuration, setSessionDuration] = useState<number>(45);

  // Review Modal
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<MentorshipSession | null>(null);

  // Complete Session Modal
  const [selectedSessionForComplete, setSelectedSessionForComplete] = useState<MentorshipSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const data = await sessionService.getMySessions();
      setSessions(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    if (user?.role === 'STUDENT') {
      mentorService.discoverMentors().then(list => {
        setMentorsList(list);
        if (list.length > 0) setSelectedMentorId(list[0].userId);
      }).catch(() => {});
    }
  }, [fetchSessions, user?.role]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleJoinVideo = (meetingUrl?: string) => {
    if (meetingUrl) {
      Linking.openURL(meetingUrl);
    }
  };

  const handleConfirmSession = async (sessionId: string) => {
    try {
      await sessionService.confirmSession(sessionId);
      showToast('success', 'Session Confirmed! 📹', 'Video room link has been generated.');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Confirmation Failed', err.message);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await sessionService.cancelSession(sessionId);
      showToast('info', 'Session Cancelled');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Cancel Failed', err.message);
    }
  };

  const handleCompleteSession = async () => {
    if (!selectedSessionForComplete) return;
    try {
      await sessionService.completeSession(selectedSessionForComplete.id, sessionNotes);
      showToast('success', 'Session Completed! 🎉');
      setSelectedSessionForComplete(null);
      setSessionNotes('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Complete Failed', err.message);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedMentorId || !sessionTitle.trim() || !sessionAgenda.trim()) {
      showToast('warning', 'Missing Details', 'Please fill in the title and agenda.');
      return;
    }
    try {
      const targetTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await sessionService.requestSession({
        mentorId: selectedMentorId,
        title: sessionTitle.trim(),
        agenda: sessionAgenda.trim(),
        scheduledAt: targetTime,
        durationMinutes: sessionDuration
      });
      showToast('success', 'Session Requested! 📅', 'Waiting for mentor confirmation.');
      setIsRequestModalVisible(false);
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const isPast = s.status === 'COMPLETED' || s.status === 'CANCELLED';
    if (filter === 'UPCOMING') return !isPast;
    if (filter === 'PAST') return isPast;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={!!onBack}
        onBack={onBack}
        title="1-on-1 Mentoring Syncs"
        subtitle="Live video code reviews and system design sessions"
        rightAction={
          user?.role === 'STUDENT' ? (
            <Button
              size="sm"
              variant="primary"
              onPress={() => setIsRequestModalVisible(true)}
              leftIcon={<Icon name="plus" size={13} color={colors.white} />}
            >
              Book
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { id: 'UPCOMING', label: 'Upcoming' },
          { id: 'PAST', label: 'Past & Completed' },
          { id: 'ALL', label: 'All Sessions' }
        ].map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setFilter(t.id as any)}
            style={[
              styles.tabBtn,
              filter === t.id && styles.activeTabBtn
            ]}
          >
            <Text
              style={[
                typography.captionBold,
                { color: filter === t.id ? colors.primary : colors.textMuted, fontSize: 12 }
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {isLoading ? (
          <View>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            iconName="calendar"
            title="No Sessions Found"
            description="Book a dedicated 1-on-1 video call to review code and architecture."
            actionText={user?.role === 'STUDENT' ? "Schedule Session" : undefined}
            onAction={user?.role === 'STUDENT' ? () => setIsRequestModalVisible(true) : undefined}
          />
        ) : (
          filteredSessions.map(session => {
            const isMentor = user?.role === 'MENTOR';
            const counterpartName = isMentor ? session.student?.fullName : session.mentor?.fullName;
            const counterpartAvatar = isMentor ? session.student?.avatarUrl : session.mentor?.avatarUrl;
            const counterpartRole = isMentor ? 'Student Mentee' : session.mentor?.title;

            return (
              <Card key={session.id} padding="lg" style={styles.sessionCard}>
                <View style={styles.cardHeader}>
                  <Avatar name={counterpartName || 'Collaborator'} src={counterpartAvatar} size="md" isVerified={!isMentor} />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: colors.textMain }]}>{counterpartName}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>{counterpartRole}</Text>
                    <Text style={[typography.caption, { color: colors.primary, fontWeight: '600', marginTop: 1 }]}>
                      {formatDateTime(session.scheduledAt)} ({session.durationMinutes} min)
                    </Text>
                  </View>
                  <Badge
                    variant={
                      session.status === 'CONFIRMED'
                        ? 'success'
                        : session.status === 'COMPLETED'
                        ? 'completed'
                        : session.status === 'CANCELLED'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {session.status}
                  </Badge>
                </View>

                <Text style={[typography.h4, styles.sessionTitle]}>
                  {session.title}
                </Text>
                <Text style={[typography.body, styles.sessionAgenda]} numberOfLines={2}>
                  {session.agenda}
                </Text>

                {/* Session Notes if completed */}
                {session.sessionNotes ? (
                  <View style={styles.notesBox}>
                    <Text style={[typography.captionBold, { color: colors.primaryDark }]}>Meeting Takeaways:</Text>
                    <Text style={[typography.body, { color: colors.textMain, marginTop: 2 }]}>
                      {session.sessionNotes}
                    </Text>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionButtonsRow}>
                  {session.status === 'CONFIRMED' && (
                    <Button
                      size="md"
                      variant="success"
                      onPress={() => handleJoinVideo(session.meetingUrl)}
                      fullWidth
                      leftIcon={<Icon name="video" size={16} color={colors.white} />}
                      style={{ marginBottom: spacing.xs }}
                    >
                      Join Video Meeting (Jitsi)
                    </Button>
                  )}

                  {session.status === 'REQUESTED' && isMentor && (
                    <View style={{ flexDirection: 'row', gap: spacing.sm, width: '100%' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => handleCancelSession(session.id)}
                        style={{ flex: 1 }}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={() => handleConfirmSession(session.id)}
                        style={{ flex: 1 }}
                      >
                        Confirm Sync
                      </Button>
                    </View>
                  )}

                  {session.status === 'CONFIRMED' && isMentor && (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => setSelectedSessionForComplete(session)}
                      fullWidth
                      style={{ marginTop: spacing.xs }}
                    >
                      Complete Session & Add Notes
                    </Button>
                  )}

                  {session.status === 'COMPLETED' && user?.role === 'STUDENT' && !session.studentRating && (
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => setSelectedSessionForReview(session)}
                      fullWidth
                      leftIcon={<Icon name="star" size={14} color={colors.white} />}
                      style={{ marginTop: spacing.xs }}
                    >
                      Leave Review & Rating ⭐
                    </Button>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* REQUEST SESSION MODAL */}
      <Modal
        visible={isRequestModalVisible}
        onClose={() => setIsRequestModalVisible(false)}
        title="Schedule Mentoring Sync"
        subtitle="Book a 1-on-1 video call with your mentor"
      >
        <View style={{ paddingTop: spacing.xs }}>
          <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            SELECT MENTOR:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            {mentorsList.map(m => (
              <TouchableOpacity
                key={m.userId}
                onPress={() => setSelectedMentorId(m.userId)}
                style={[
                  styles.mentorSelectChip,
                  selectedMentorId === m.userId && styles.activeMentorSelectChip
                ]}
              >
                <Avatar name={m.user?.fullName || 'Mentor'} size="xs" isVerified />
                <Text style={[typography.captionBold, { marginLeft: 6, color: selectedMentorId === m.userId ? colors.primary : colors.textMain }]}>
                  {m.user?.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Session Topic / Title"
            placeholder="e.g. Raft Consensus Code Review"
            value={sessionTitle}
            onChangeText={setSessionTitle}
          />

          <TextArea
            label="Meeting Agenda & Questions"
            placeholder="List the 2-3 key questions or components to cover..."
            rows={3}
            value={sessionAgenda}
            onChangeText={setSessionAgenda}
          />

          <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            DURATION:
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {[30, 45, 60].map(mins => (
              <TouchableOpacity
                key={mins}
                onPress={() => setSessionDuration(mins)}
                style={[
                  styles.durationBtn,
                  sessionDuration === mins && styles.activeDurationBtn
                ]}
              >
                <Text style={[typography.captionBold, { color: sessionDuration === mins ? colors.primary : colors.textMuted }]}>
                  {mins} mins
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            size="lg"
            onPress={handleCreateSession}
            fullWidth
            rightIcon={<Icon name="calendar" size={16} color={colors.white} />}
            style={{ marginTop: spacing.sm }}
          >
            Send Meeting Request
          </Button>
        </View>
      </Modal>

      {/* COMPLETE SESSION MODAL */}
      {selectedSessionForComplete && (
        <Modal
          visible={!!selectedSessionForComplete}
          onClose={() => setSelectedSessionForComplete(null)}
          title="Complete Session"
          subtitle="Document takeaways and next steps for the student"
        >
          <View style={{ paddingTop: spacing.xs }}>
            <TextArea
              label="Session Notes & Key Recommendations"
              placeholder="e.g. Aarav did a great job explaining the heartbeat loop. Recommended splitting the network RPC into separate worker go-routines."
              rows={5}
              value={sessionNotes}
              onChangeText={setSessionNotes}
            />

            <Button
              size="lg"
              variant="primary"
              onPress={handleCompleteSession}
              fullWidth
              style={{ marginTop: spacing.md }}
            >
              Mark Complete
            </Button>
          </View>
        </Modal>
      )}

      {/* REVIEW MODAL */}
      {selectedSessionForReview && (
        <ReviewModal
          visible={!!selectedSessionForReview}
          onClose={() => setSelectedSessionForReview(null)}
          mentorId={selectedSessionForReview.mentorId}
          mentorName={selectedSessionForReview.mentor?.fullName || 'Mentor'}
          projectId={selectedSessionForReview.projectId}
          onReviewSubmitted={() => {
            fetchSessions();
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle
  },
  activeTabBtn: {
    backgroundColor: colors.primaryLight
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  sessionCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sessionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textMain
  },
  sessionAgenda: {
    color: colors.textMuted,
    lineHeight: 19
  },
  notesBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md
  },
  actionButtonsRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  mentorSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm
  },
  activeMentorSelectChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  durationBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  activeDurationBtn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  }
});
