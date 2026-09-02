// Mobile Student Mentorship Proposals Tracker Screen

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

export interface StudentRequestsScreenProps {
  onBack?: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export const StudentRequestsScreen: React.FC<StudentRequestsScreenProps> = ({ onBack, onNavigate }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Provide Info Modal State
  const [selectedReqForInfo, setSelectedReqForInfo] = useState<MentorshipRequest | null>(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await mentorshipService.getStudentRequests();
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

  const handleSendInfo = async () => {
    if (!selectedReqForInfo || !infoMessage.trim()) return;
    setIsSubmittingInfo(true);
    try {
      await mentorshipService.provideAdditionalInfo(selectedReqForInfo.id, infoMessage.trim());
      showToast('success', 'Details Sent! 📬', 'Your mentor has received the updated clarifications.');
      setSelectedReqForInfo(null);
      setInfoMessage('');
      fetchRequests();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'danger';
      case 'INFO_REQUESTED': return 'warning';
      case 'PENDING':
      default:
        return 'pending';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={!!onBack}
        onBack={onBack}
        title="My Mentorship Proposals"
        subtitle="Track the status of your 1-on-1 mentor outreach"
      />

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
        ) : requests.length === 0 ? (
          <EmptyState
            iconName="folder-kanban"
            title="No Proposals Sent"
            description="Explore our verified mentor directory to find the right guide for your project."
            actionText="Discover Mentors"
            onAction={() => onNavigate('discover')}
          />
        ) : (
          requests.map(req => (
            <Card key={req.id} padding="lg" style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <Avatar
                  name={req.mentor?.fullName || 'Mentor'}
                  src={req.mentor?.avatarUrl}
                  size="md"
                  isVerified
                />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.textMain }]}>
                    {req.mentor?.fullName}
                  </Text>
                  <Text style={[typography.caption, { color: colors.primary }]}>
                    {req.mentor?.title} @ {req.mentor?.company}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10.5 }]}>
                    Sent on {formatDate(req.createdAt)}
                  </Text>
                </View>
                <Badge variant={getBadgeVariant(req.status)} size="sm">
                  {req.status.replace('_', ' ')}
                </Badge>
              </View>

              <Text style={[typography.h4, styles.projectTitle]}>
                {req.projectTitle}
              </Text>
              <Text style={[typography.body, styles.projectDesc]} numberOfLines={3}>
                {req.projectDescription}
              </Text>

              {/* Mentor Notes if Info requested or Rejected */}
              {req.mentorNotes ? (
                <View style={styles.notesBox}>
                  <Text style={[typography.captionBold, { color: colors.warningDark }]}>
                    Note from {req.mentor?.fullName?.split(' ')[0] || 'Mentor'}:
                  </Text>
                  <Text style={[typography.body, { color: colors.textMain, marginTop: 2 }]}>
                    "{req.mentorNotes}"
                  </Text>
                </View>
              ) : null}

              {/* Action Buttons based on Status */}
              <View style={styles.cardActions}>
                {req.status === 'ACCEPTED' ? (
                  <Button
                    size="md"
                    variant="primary"
                    onPress={() => onNavigate('project')}
                    fullWidth
                    rightIcon={<Icon name="arrow-right" size={16} color={colors.white} />}
                  >
                    Open Collaborative Workspace
                  </Button>
                ) : req.status === 'INFO_REQUESTED' ? (
                  <Button
                    size="md"
                    variant="primary"
                    onPress={() => setSelectedReqForInfo(req)}
                    fullWidth
                    leftIcon={<Icon name="edit" size={16} color={colors.white} />}
                  >
                    Provide Requested Details
                  </Button>
                ) : (
                  <View style={styles.pendingInfoRow}>
                    <Icon name="clock" size={14} color={colors.textMuted} />
                    <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                      {req.status === 'REJECTED' ? 'Mentor is at full capacity.' : 'Waiting for mentor review.'}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Provide Additional Info Modal */}
      {selectedReqForInfo && (
        <Modal
          visible={!!selectedReqForInfo}
          onClose={() => setSelectedReqForInfo(null)}
          title="Provide Additional Information"
          subtitle={`Answer the questions requested by ${selectedReqForInfo.mentor?.fullName || 'Mentor'}`}
        >
          <View style={{ paddingTop: spacing.xs }}>
            <View style={styles.infoQuestionBox}>
              <Text style={[typography.captionBold, { color: colors.warningDark }]}>
                Mentor Question / Feedback:
              </Text>
              <Text style={[typography.body, { color: colors.textMain, marginTop: 3 }]}>
                {selectedReqForInfo.mentorNotes || 'Please specify what technical parts you are planning to build first.'}
              </Text>
            </View>

            <TextArea
              label="Your Clarification & Details"
              placeholder="e.g. I have completed the basic struct definitions and want to focus our initial sync on the leader election Raft RPC handlers..."
              rows={5}
              value={infoMessage}
              onChangeText={setInfoMessage}
            />

            <Button
              size="lg"
              variant="primary"
              onPress={handleSendInfo}
              isLoading={isSubmittingInfo}
              fullWidth
              rightIcon={<Icon name="send" size={16} color={colors.white} />}
              style={{ marginTop: spacing.md }}
            >
              Submit Clarification
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
  notesBox: {
    backgroundColor: colors.warningLight,
    borderLeftWidth: 3,
    borderColor: colors.warning,
    padding: spacing.md,
    borderRadius: radius.xs,
    marginTop: spacing.md
  },
  cardActions: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  pendingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs
  },
  infoQuestionBox: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md
  }
});
