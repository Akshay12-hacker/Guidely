// Mobile Mentor Proposals Triage Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { mentorshipService } from '../../services/mentorship.service';
import { MentorshipRequest } from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Modal } from '../../components/common/Modal';
import { TextArea } from '../../components/common/TextArea';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDate } from '../../utils/formatters';

export interface MentorRequestsScreenProps {
  onBack?: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export const MentorRequestsScreen: React.FC<MentorRequestsScreenProps> = ({ onBack, onNavigate }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'INFO_REQUESTED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Request Info Modal State
  const [selectedReqForModal, setSelectedReqForModal] = useState<MentorshipRequest | null>(null);
  const [questionText, setQuestionText] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const data = await mentorshipService.getMentorRequests();
      setRequests(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAccept = async (req: MentorshipRequest) => {
    setActionLoadingId(req.id);
    try {
      await mentorshipService.respondToRequest(req.id, 'ACCEPT', 'Looking forward to building this together!');
      showToast('success', 'Proposal Accepted! 🚀', `Project workspace created with ${req.student?.fullName}.`);
      fetchRequests();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (req: MentorshipRequest) => {
    setActionLoadingId(req.id);
    try {
      await mentorshipService.respondToRequest(req.id, 'REJECT', 'Currently at full capacity.');
      showToast('info', 'Proposal Declined', 'Student has been notified.');
      fetchRequests();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendInfoRequest = async () => {
    if (!selectedReqForModal || !questionText.trim()) return;
    setActionLoadingId(selectedReqForModal.id);
    try {
      await mentorshipService.respondToRequest(selectedReqForModal.id, 'REQUEST_INFO', questionText.trim());
      showToast('success', 'Request for Info Sent ✉️', 'The student will submit clarifications.');
      setSelectedReqForModal(null);
      setQuestionText('');
      fetchRequests();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = requests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={!!onBack}
        onBack={onBack}
        title="Student Proposals Queue"
        subtitle="Review project proposals submitted by CSE students"
      />

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { id: 'ALL', label: 'All' },
          { id: 'PENDING', label: 'Pending' },
          { id: 'ACCEPTED', label: 'Accepted' },
          { id: 'INFO_REQUESTED', label: 'Info Req' }
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
                { color: filter === t.id ? colors.primary : colors.textMuted, fontSize: 11.5 }
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
        ) : filtered.length === 0 ? (
          <EmptyState
            iconName="folder-kanban"
            title="No Proposals Found"
            description="You have no proposals matching the selected filter."
          />
        ) : (
          filtered.map(req => (
            <Card key={req.id} padding="lg" style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <Avatar
                  name={req.student?.fullName || 'Student'}
                  src={req.student?.avatarUrl}
                  size="md"
                />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.textMain }]}>
                    {req.student?.fullName}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {req.student?.college} • {req.student?.degree}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSubtle, fontSize: 10.5 }]}>
                    Received {formatDate(req.createdAt)}
                  </Text>
                </View>
                <Badge variant={req.status === 'ACCEPTED' ? 'accepted' : req.status === 'PENDING' ? 'warning' : 'neutral'} size="sm">
                  {req.status.replace('_', ' ')}
                </Badge>
              </View>

              <Text style={[typography.h4, styles.projectTitle]}>
                {req.projectTitle}
              </Text>
              <Text style={[typography.body, styles.projectDesc]} numberOfLines={3}>
                {req.projectDescription}
              </Text>

              {/* Technologies */}
              {req.techKnown?.length > 0 && (
                <View style={styles.techWrap}>
                  {req.techKnown.map(t => (
                    <Badge key={t} variant="neutral" size="sm" style={{ marginRight: 4, marginTop: 4 }}>
                      {t}
                    </Badge>
                  ))}
                </View>
              )}

              {/* Actions */}
              {req.status === 'PENDING' || req.status === 'INFO_PROVIDED' ? (
                <View style={styles.actionsRow}>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleDecline(req)}
                    disabled={actionLoadingId === req.id}
                    style={styles.actionBtn}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setSelectedReqForModal(req)}
                    disabled={actionLoadingId === req.id}
                    style={styles.actionBtn}
                  >
                    Request Info
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => handleAccept(req)}
                    isLoading={actionLoadingId === req.id}
                    style={styles.actionBtn}
                  >
                    Accept
                  </Button>
                </View>
              ) : req.status === 'ACCEPTED' ? (
                <Button
                  size="md"
                  variant="primary"
                  onPress={() => onNavigate('project')}
                  fullWidth
                  rightIcon={<Icon name="arrow-right" size={16} color={colors.white} />}
                  style={{ marginTop: spacing.md }}
                >
                  Open Collaborative Workspace
                </Button>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>

      {/* Ask Question / Request Info Modal */}
      {selectedReqForModal && (
        <Modal
          visible={!!selectedReqForModal}
          onClose={() => setSelectedReqForModal(null)}
          title="Request Additional Details"
          subtitle={`Ask ${selectedReqForModal.student?.fullName} for specific technical clarifications`}
        >
          <View style={{ paddingTop: spacing.xs }}>
            <TextArea
              label="Questions / Clarification Needed"
              placeholder="e.g. Which specific components are you planning to build in Phase 1? What is your timeline for the first code review?"
              rows={5}
              value={questionText}
              onChangeText={setQuestionText}
            />

            <Button
              size="lg"
              variant="primary"
              onPress={handleSendInfoRequest}
              isLoading={actionLoadingId === selectedReqForModal.id}
              fullWidth
              rightIcon={<Icon name="send" size={16} color={colors.white} />}
              style={{ marginTop: spacing.md }}
            >
              Send Request to Student
            </Button>
          </View>
        </Modal>
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
    paddingVertical: spacing.xs + 2,
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
  requestCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textMain
  },
  projectDesc: {
    color: colors.textMuted,
    lineHeight: 19
  },
  techWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  actionBtn: {
    flex: 1
  }
});
