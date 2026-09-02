// Mobile Mentor Public Profile Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { mentorService } from '../../services/mentor.service';
import { MentorProfile, User } from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDate } from '../../utils/formatters';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal';

export interface MentorProfileScreenProps {
  mentorId: string;
  onBack: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export const MentorProfileScreen: React.FC<MentorProfileScreenProps> = ({
  mentorId,
  onBack,
  onNavigate
}) => {
  const [data, setData] = useState<{
    mentor: MentorProfile & { user: User };
    reviews: any[];
    studentsHelped: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await mentorService.getMentorDetail(mentorId);
        setData(res);
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId]);

  if (isLoading || !data?.mentor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack onBack={onBack} title="Mentor Profile" />
        <View style={{ padding: spacing.lg }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  const { mentor, reviews = [] } = data;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        onBack={onBack}
        title={mentor.user?.fullName}
        rightAction={
          <Badge variant="verified" size="sm">Verified</Badge>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <Card padding="lg" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Avatar
              name={mentor.user?.fullName || 'Mentor'}
              src={mentor.user?.avatarUrl}
              size="xl"
              isVerified
              isOnline
            />
            <View style={styles.heroHeaderText}>
              <Text style={[typography.h2, styles.fullName]}>
                {mentor.user?.fullName}
              </Text>
              <Text style={[typography.bodyBold, { color: colors.primary }]}>
                {mentor.title}
              </Text>
              <Text style={[typography.body, { color: colors.textMain, fontWeight: '600' }]}>
                {mentor.company}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                {mentor.college}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconVal}>
                <Icon name="star" size={16} color="#F59E0B" />
                <Text style={[typography.h3, styles.statValue]}>{mentor.rating || 5.0}</Text>
              </View>
              <Text style={[typography.caption, styles.statLabel]}>{reviews.length} Reviews</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[typography.h3, styles.statValue]}>{mentor.studentsHelpedCount || 0}</Text>
              <Text style={[typography.caption, styles.statLabel]}>Mentees</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[typography.h3, styles.statValue]}>{mentor.yearsExperience}+</Text>
              <Text style={[typography.caption, styles.statLabel]}>Years Exp</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[typography.h3, { color: colors.successDark }]}>Free</Text>
              <Text style={[typography.caption, styles.statLabel]}>Pro Bono</Text>
            </View>
          </View>
        </Card>

        {/* Bio & Background */}
        <Card padding="lg" style={styles.sectionCard}>
          <Text style={[typography.h4, styles.sectionTitle]}>About & Background</Text>
          <Text style={[typography.body, styles.bodyText]}>
            {mentor.bio}
          </Text>
        </Card>

        {/* Technologies & Languages */}
        <Card padding="lg" style={styles.sectionCard}>
          <Text style={[typography.h4, styles.sectionTitle]}>Target Technologies</Text>
          <View style={styles.chipsWrap}>
            {mentor.technologies?.map(t => (
              <Badge key={t} variant="primary" size="md" style={{ marginRight: 6, marginBottom: 6 }}>
                {t}
              </Badge>
            ))}
          </View>
        </Card>

        {/* Mentoring Topics */}
        <Card padding="lg" style={styles.sectionCard}>
          <Text style={[typography.h4, styles.sectionTitle]}>Mentoring Topics</Text>
          <View style={styles.topicsList}>
            {mentor.mentoringTopics?.map(topic => (
              <View key={topic} style={styles.topicRow}>
                <Icon name="check-circle" size={16} color={colors.primary} />
                <Text style={[typography.bodyMedium, { color: colors.textMain, flex: 1 }]}>
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Availability Schedule */}
        <Card padding="lg" style={styles.sectionCard}>
          <Text style={[typography.h4, styles.sectionTitle]}>Availability Schedule</Text>
          <View style={styles.availabilityBox}>
            <Icon name="clock" size={18} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.textMain, marginLeft: 8, flex: 1 }]}>
              {mentor.availabilitySchedule || 'Weekdays post 6:30 PM & Weekend mornings'}
            </Text>
          </View>
        </Card>

        {/* Verified Student Reviews */}
        <Card padding="lg" style={styles.sectionCard}>
          <View style={styles.reviewsHeader}>
            <Text style={[typography.h4, styles.sectionTitle]}>Student Reviews</Text>
            <Badge variant="success" size="sm">★ {mentor.rating || 5.0}</Badge>
          </View>

          {reviews.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              No public reviews yet. Be the first student to build a project with {mentor.user?.fullName?.split(' ')[0] || 'this mentor'}!
            </Text>
          ) : (
            reviews.map((r: any) => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.reviewTop}>
                  <Avatar name={r.student_name || 'Student'} src={r.student_avatar} size="sm" />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text style={[typography.bodyBold, { fontSize: 13 }]}>{r.student_name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {r.student_college} • {formatDate(r.created_at)}
                    </Text>
                  </View>
                  <View style={styles.starsRow}>
                    <Icon name="star" size={13} color="#F59E0B" />
                    <Text style={[typography.captionBold, { marginLeft: 3 }]}>{r.rating}.0</Text>
                  </View>
                </View>
                <Text style={[typography.body, styles.commentText]}>
                  "{r.comment}"
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Floating Bottom Request Mentorship Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Pro-bono Guidance</Text>
          <Text style={[typography.h4, { color: colors.successDark }]}>Free Mentorship</Text>
        </View>
        <Button
          size="lg"
          variant="primary"
          onPress={() => setIsRequestModalVisible(true)}
          rightIcon={<Icon name="send" size={16} color={colors.white} />}
          style={styles.requestBtn}
        >
          Request Mentorship
        </Button>
      </View>

      {/* Request Modal */}
      <MentorshipRequestModal
        visible={isRequestModalVisible}
        onClose={() => setIsRequestModalVisible(false)}
        mentorId={mentor.userId}
        mentorName={mentor.user?.fullName || 'Mentor'}
        onRequestSubmitted={() => {
          onNavigate('requests');
        }}
      />
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
    paddingBottom: 90
  },
  heroCard: {
    marginBottom: spacing.md,
    ...shadows.md
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  heroHeaderText: {
    marginLeft: spacing.md,
    flex: 1
  },
  fullName: {
    color: colors.textMain,
    marginBottom: 2
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statIconVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  statValue: {
    color: colors.textMain,
    fontSize: 16
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 10.5
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border
  },
  sectionCard: {
    marginBottom: spacing.md
  },
  sectionTitle: {
    color: colors.textMain,
    marginBottom: spacing.sm
  },
  bodyText: {
    color: colors.textMuted,
    lineHeight: 21
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  topicsList: {
    gap: spacing.sm
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  availabilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: radius.md
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentText: {
    color: colors.textMain,
    fontStyle: 'italic',
    lineHeight: 19
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    ...shadows.xl
  },
  bottomBarInfo: {
    marginRight: spacing.md
  },
  requestBtn: {
    flex: 1
  }
});
