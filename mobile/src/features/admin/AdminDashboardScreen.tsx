// Mobile Admin Governance & Moderation Screen

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
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/admin.service';
import { AdminAnalytics, MentorProfile, Report, Review, User } from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { StatCard } from '../../components/common/StatCard';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatDate } from '../../utils/formatters';

export interface AdminDashboardScreenProps {
  onBack?: () => void;
  onNavigate: (route: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack, onNavigate }) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'KPIS' | 'USERS' | 'VERIFICATIONS' | 'REPORTS' | 'REVIEWS'>('KPIS');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [verifications, setVerifications] = useState<(MentorProfile & { user: User })[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const [stats, usersData, verifs, reps, revs] = await Promise.all([
        adminService.getOverview(),
        adminService.getUsers({ search: userSearch }),
        adminService.getPendingVerifications(),
        adminService.getReports(),
        adminService.getReviewsForModeration()
      ]);
      setAnalytics(stats);
      setUsers(usersData.users || []);
      setVerifications(verifs || []);
      setReports(reps || []);
      setReviews(revs || []);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userSearch]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.toggleUserStatus(user.id, nextStatus);
      showToast('info', 'User Updated', `${user.fullName} is now ${nextStatus}`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err.message);
    }
  };

  const handleVerifyMentor = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminService.verifyMentor(userId, status);
      showToast('success', status === 'APPROVED' ? 'Mentor Verified! 🛡️' : 'Verification Rejected');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await adminService.resolveReport(reportId, status, 'Actioned via Mobile Admin');
      showToast('success', `Report ${status}`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const handleModerateReview = async (reviewId: string, isApproved: boolean) => {
    try {
      await adminService.moderateReview(reviewId, isApproved);
      showToast('success', isApproved ? 'Review Approved' : 'Review Removed');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack={!!onBack}
        onBack={onBack}
        title="Admin Governance"
        subtitle="Platform Analytics, Directory & Moderation Queue"
      />

      {/* Sub Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsBar}>
        {[
          { id: 'KPIS', label: 'Platform KPIs', icon: 'bar-chart' },
          { id: 'USERS', label: `Users (${users.length})`, icon: 'users' },
          { id: 'VERIFICATIONS', label: `Verify (${verifications.length})`, icon: 'shield-check' },
          { id: 'REPORTS', label: `Reports (${reports.length})`, icon: 'alert-circle' },
          { id: 'REVIEWS', label: `Reviews (${reviews.length})`, icon: 'star' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.id as any)}
              style={[styles.subTabBtn, isActive && styles.activeSubTabBtn]}
            >
              <Icon name={tab.icon as any} size={14} color={isActive ? colors.primary : colors.textMuted} />
              <Text style={[typography.captionBold, { color: isActive ? colors.primary : colors.textMuted, fontSize: 11.5 }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
        ) : null}

        {/* TAB 1: KPIS */}
        {activeTab === 'KPIS' && analytics && (
          <View>
            <View style={styles.kpiRow}>
              <StatCard
                label="Total Users"
                value={analytics.totalUsers}
                iconName="users"
                changeText="+12% MoM"
              />
              <StatCard
                label="Active Projects"
                value={analytics.totalActiveMentorships}
                iconName="folder-kanban"
                iconBg={colors.successLight}
                iconColor={colors.success}
              />
            </View>

            <View style={styles.kpiRow}>
              <StatCard
                label="Students"
                value={analytics.totalStudents}
                iconName="graduation-cap"
                iconBg={colors.primaryLight}
                iconColor={colors.primary}
              />
              <StatCard
                label="Verified Mentors"
                value={analytics.totalMentors}
                iconName="briefcase"
                iconBg={colors.infoLight}
                iconColor={colors.info}
              />
            </View>

            <View style={styles.kpiRow}>
              <StatCard
                label="Completed Projects"
                value={analytics.totalCompletedProjects}
                iconName="check-circle"
                iconBg={colors.successLight}
                iconColor={colors.success}
              />
              <StatCard
                label="Total Syncs"
                value={analytics.totalSessions}
                iconName="calendar"
                iconBg={colors.warningLight}
                iconColor={colors.warning}
              />
            </View>

            {/* Popular Technologies */}
            <Card padding="lg" style={styles.sectionCard}>
              <Text style={[typography.h4, styles.sectionTitle]}>Popular Technologies on Guidely</Text>
              <View style={styles.techBarWrap}>
                {analytics.popularTechnologies?.map(tech => (
                  <View key={tech.name} style={styles.techBarItem}>
                    <Text style={[typography.captionBold, { color: colors.textMain }]}>{tech.name}</Text>
                    <Badge variant="primary" size="sm">{tech.count} projects</Badge>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === 'USERS' && (
          <View>
            <Input
              placeholder="Search by full name, email or role..."
              value={userSearch}
              onChangeText={setUserSearch}
              leftIcon={<Icon name="search" size={16} color={colors.textMuted} />}
              containerStyle={{ marginBottom: spacing.md }}
            />

            {users.map(u => (
              <Card key={u.id} padding="md" style={styles.userCard}>
                <View style={styles.userRow}>
                  <Avatar name={u.fullName} src={u.avatarUrl} size="md" isVerified={u.role === 'MENTOR'} />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text style={[typography.bodyBold, { color: colors.textMain }]}>{u.fullName}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>{u.email}</Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                      <Badge variant={u.role === 'MENTOR' ? 'verified' : 'neutral'} size="sm">
                        {u.role}
                      </Badge>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                        {u.status}
                      </Badge>
                    </View>
                  </View>

                  <Button
                    size="sm"
                    variant={u.status === 'ACTIVE' ? 'outline' : 'success'}
                    onPress={() => handleToggleUserStatus(u)}
                    style={{ paddingHorizontal: 10 }}
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 3: VERIFICATIONS */}
        {activeTab === 'VERIFICATIONS' && (
          <View>
            {verifications.length === 0 ? (
              <EmptyState
                iconName="shield-check"
                title="Verification Queue Empty"
                description="All submitted mentor applications have been reviewed."
              />
            ) : (
              verifications.map(m => (
                <Card key={m.userId} padding="lg" style={styles.verifCard}>
                  <View style={styles.userRow}>
                    <Avatar name={m.user?.fullName || 'Mentor'} src={m.user?.avatarUrl} size="md" />
                    <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                      <Text style={[typography.bodyBold, { color: colors.textMain }]}>{m.user?.fullName}</Text>
                      <Text style={[typography.caption, { color: colors.primary }]}>{m.title} @ {m.company}</Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>{m.college} • {m.yearsExperience} yrs exp</Text>
                    </View>
                  </View>

                  <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 19 }]}>
                    {m.bio}
                  </Text>

                  {m.verificationNotes ? (
                    <View style={styles.notesBox}>
                      <Text style={[typography.captionBold, { color: colors.info }]}>Verification Notes:</Text>
                      <Text style={[typography.caption, { color: colors.textMain, marginTop: 2 }]}>{m.verificationNotes}</Text>
                    </View>
                  ) : null}

                  <View style={styles.verifActions}>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => handleVerifyMentor(m.userId, 'REJECTED')}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onPress={() => handleVerifyMentor(m.userId, 'APPROVED')}
                      style={{ flex: 1 }}
                      leftIcon={<Icon name="shield-check" size={14} color={colors.white} />}
                    >
                      Approve & Verify
                    </Button>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'REPORTS' && (
          <View>
            {reports.length === 0 ? (
              <EmptyState
                iconName="alert-circle"
                title="No Pending Reports"
                description="The platform has zero unresolved moderation flags."
              />
            ) : (
              reports.map(rep => (
                <Card key={rep.id} padding="lg" style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Badge variant={rep.status === 'PENDING' ? 'warning' : 'success'} size="sm">
                      {rep.status}
                    </Badge>
                    <Text style={[typography.caption, { color: colors.textSubtle }]}>
                      {formatDate(rep.createdAt)}
                    </Text>
                  </View>

                  <Text style={[typography.bodyBold, { color: colors.textMain, marginTop: spacing.xs }]}>
                    Reason: {rep.reason}
                  </Text>
                  <Text style={[typography.body, { color: colors.textMuted, marginTop: 2 }]}>
                    {rep.details}
                  </Text>

                  {rep.status === 'PENDING' && (
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => handleResolveReport(rep.id, 'DISMISSED')}
                        style={{ flex: 1 }}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={() => handleResolveReport(rep.id, 'RESOLVED')}
                        style={{ flex: 1 }}
                      >
                        Resolve
                      </Button>
                    </View>
                  )}
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB 5: REVIEWS MODERATION */}
        {activeTab === 'REVIEWS' && (
          <View>
            {reviews.length === 0 ? (
              <EmptyState
                iconName="star"
                title="No Reviews to Moderate"
                description="All submitted student reviews are clean and verified."
              />
            ) : (
              reviews.map(rev => (
                <Card key={rev.id} padding="lg" style={styles.reviewModCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[typography.bodyBold, { color: colors.textMain }]}>★ {rev.rating}.0 Rating</Text>
                    <Text style={[typography.caption, { color: colors.textSubtle }]}>{formatDate(rev.createdAt)}</Text>
                  </View>
                  <Text style={[typography.body, { color: colors.textMuted, fontStyle: 'italic', marginVertical: spacing.sm }]}>
                    "{rev.comment}"
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Button
                      size="sm"
                      variant="danger"
                      onPress={() => handleModerateReview(rev.id, false)}
                      style={{ flex: 1 }}
                    >
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onPress={() => handleModerateReview(rev.id, true)}
                      style={{ flex: 1 }}
                    >
                      Approve
                    </Button>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  subTabsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    gap: 6
  },
  activeSubTabBtn: {
    backgroundColor: colors.primaryLight
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs
  },
  sectionCard: {
    marginTop: spacing.sm,
    ...shadows.sm
  },
  sectionTitle: {
    color: colors.textMain,
    marginBottom: spacing.md
  },
  techBarWrap: {
    gap: spacing.sm
  },
  techBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs
  },
  userCard: {
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  verifCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  },
  notesBox: {
    backgroundColor: colors.infoLight,
    padding: spacing.sm + 2,
    borderRadius: radius.xs,
    marginTop: spacing.sm
  },
  verifActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md
  },
  reportCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reviewModCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  }
});
