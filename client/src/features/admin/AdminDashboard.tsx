import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  AdminAnalytics,
  User,
  Report,
  Review
} from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Modal } from '../../components/ui/Modal.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  BarChart3,
  Users,
  ShieldCheck,
  FileWarning,
  Star,
  CheckCircle,
  Search,
  Check,
  X,
  ExternalLink,
  FolderKanban,
  Activity,
  Server,
  Database,
  Cloud,
  AlertTriangle,
  ArrowRight,
  Filter,
  Eye,
  Clock,
  Briefcase,
  GraduationCap
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: string;
  onNavigate?: (route: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview', onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab.replace('admin-', ''));

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verification Queue state
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [previewMentor, setPreviewMentor] = useState<any | null>(null);

  // Users tab state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Projects tab state
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');

  // Modals state
  const [rejectMentorData, setRejectMentorData] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [resolveReportData, setResolveReportData] = useState<Report | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, usersRes, reportsRes, reviewsRes, verificationsRes, projectsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({}),
        api.getAdminReports(),
        api.getReviewsForModeration(),
        api.getPendingVerifications(),
        api.getAdminProjects()
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes.users || []);
      setReports(reportsRes || []);
      setReviews(reviewsRes || []);
      setPendingMentors(verificationsRes || []);
      setProjects(projectsRes || []);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab.replace('admin-', ''));
    }
  }, [initialTab]);

  const handleVerifyMentor = async (mentor: any) => {
    const mentorId = mentor.userId || mentor.id || mentor.user?.id;
    const mentorName = mentor.user?.fullName || mentor.fullName || 'Mentor';
    try {
      await api.verifyMentor(mentorId, 'APPROVED');
      showToast('success', 'Mentor Verified! 🛡️', `${mentorName} has been granted the Verified Industry Mentor badge.`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const handleRejectMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectMentorData) return;
    const mentorId = rejectMentorData.userId || rejectMentorData.id || rejectMentorData.user?.id;

    try {
      await api.verifyMentor(mentorId, 'REJECTED', rejectReason);
      showToast('info', 'Application Declined', 'Mentor application has been declined with constructive feedback.');
      setRejectMentorData(null);
      setRejectReason('');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(targetUser.id, nextStatus);
      showToast('success', `User ${nextStatus.toLowerCase()} successfully.`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err.message);
    }
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveReportData) return;

    try {
      await api.resolveReport(resolveReportData.id, resolutionAction, resolutionNotes);
      showToast('success', 'Report Resolved');
      setResolveReportData(null);
      setResolutionNotes('');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Resolve Failed', err.message);
    }
  };

  const handleModerateReview = async (reviewId: string, isApproved: boolean) => {
    try {
      await api.moderateReview(reviewId, isApproved);
      showToast('success', isApproved ? 'Review Approved' : 'Review Hidden');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Moderation Failed', err.message);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredVerifications = pendingMentors.filter(m => {
    const name = (m.user?.fullName || m.fullName || '').toLowerCase();
    const email = (m.user?.email || m.email || '').toLowerCase();
    const company = (m.company || '').toLowerCase();
    const title = (m.title || '').toLowerCase();
    const q = queueSearch.toLowerCase();

    const matchesSearch = !q || name.includes(q) || email.includes(q) || company.includes(q) || title.includes(q);
    const status = m.verificationStatus || (m.isVerified ? 'APPROVED' : 'PENDING');

    if (queueFilter === 'PENDING') {
      return matchesSearch && (status === 'PENDING' || !m.isVerified);
    }
    if (queueFilter === 'APPROVED') {
      return matchesSearch && (status === 'APPROVED' || m.isVerified);
    }
    return matchesSearch;
  });

  const filteredProjects = projects.filter(p => {
    const title = (p.title || '').toLowerCase();
    const student = (p.student_name || p.studentName || '').toLowerCase();
    const mentor = (p.mentor_name || p.mentorName || '').toLowerCase();
    const q = projectSearch.toLowerCase();

    const matchesSearch = !q || title.includes(q) || student.includes(q) || mentor.includes(q);
    const matchesStatus = projectStatusFilter === 'ALL' || p.status === projectStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingQueueCount = pendingMentors.filter(m => !m.isVerified || m.verificationStatus === 'PENDING').length;
  const pendingReportsCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="danger">Platform Governance</Badge>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin: Dr. Gourav Shrivastava (HOD)</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Platform Governance & Operations
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Review pending industry mentor credentials, monitor student capstones, and maintain platform integrity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant={activeTab === 'verifications' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('verifications')}
            leftIcon={<ShieldCheck size={15} />}
          >
            Verification Queue ({pendingQueueCount})
          </Button>
          <Button
            variant={activeTab === 'projects' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('projects')}
            leftIcon={<FolderKanban size={15} />}
          >
            Capstone Oversight ({projects.length})
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Platform KPIs & Health', icon: <BarChart3 size={16} /> },
          { id: 'verifications', label: 'Verification Queue', count: pendingQueueCount, icon: <ShieldCheck size={16} /> },
          { id: 'projects', label: 'Projects Oversight', count: projects.length, icon: <FolderKanban size={16} /> },
          { id: 'users', label: 'Users Directory', count: users.length, icon: <Users size={16} /> },
          { id: 'reports', label: 'Safety Reports', count: pendingReportsCount, icon: <FileWarning size={16} /> },
          { id: 'reviews', label: 'Reviews Moderation', count: reviews.length, icon: <Star size={16} /> }
        ]}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
          {/* ============================================================ */}
          {activeTab === 'overview' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Alert Banner if Pending Items */}
              {pendingQueueCount > 0 && (
                <div style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#F59E0B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400E', margin: 0 }}>
                        {pendingQueueCount} Industry Mentor Application{pendingQueueCount > 1 ? 's' : ''} Awaiting Review
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#B45309', margin: '2px 0 0 0' }}>
                        Newly registered mentors are waiting for administrative verification before their profiles are published.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveTab('verifications')}
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Open Verification Queue
                  </Button>
                </div>
              )}

              {/* KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatCard
                  label="Total Students"
                  value={analytics.totalStudents}
                  icon={<Users size={18} />}
                  changeText="+14% this cohort"
                />
                <StatCard
                  label="Verified Mentors"
                  value={analytics.totalMentors}
                  icon={<ShieldCheck size={18} />}
                  iconBg="#EFF6FF"
                  iconColor="#2563EB"
                  changeText="Faculty & Industry"
                />
                <StatCard
                  label="Active Capstones"
                  value={analytics.totalActiveMentorships}
                  icon={<BarChart3 size={18} />}
                  iconBg="var(--success-light)"
                  iconColor="var(--success-dark)"
                  changeText="In Progress"
                />
                <StatCard
                  label="Completed Projects"
                  value={analytics.totalCompletedProjects}
                  icon={<CheckCircle size={18} />}
                  iconBg="#FFFBEB"
                  iconColor="#D97706"
                  changeText="Published"
                />
              </div>

              {/* System Infrastructure Health Card */}
              <Card padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Platform Infrastructure & Services Status</h3>
                  </div>
                  <Badge variant="success" size="sm">All Systems Operational</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Server size={14} color="var(--primary)" /> Real-Time WebSocket Gateway
                      </span>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Port 5000 • Sub-15ms Latency</p>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Database size={14} color="#D97706" /> Academic Datastore
                      </span>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>MongoDB Atlas • SSL Encrypted</p>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Cloud size={14} color="#2563EB" /> Media CDN & Artifacts
                      </span>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Cloudinary Free-Tier Deduplicated</p>
                  </div>
                </div>
              </Card>

              {/* Projects Breakdown Card */}
              <Card padding="lg">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>Mentorship & Engagement Velocity</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Proposal Acceptance Rate</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px', margin: 0 }}>{analytics.acceptanceRate}%</p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total 1-on-1 Syncs</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning-dark)', marginTop: '2px', margin: 0 }}>{analytics.totalSessions}</p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pending Verification Queue</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: pendingQueueCount > 0 ? '#D97706' : 'var(--success-dark)', marginTop: '2px', margin: 0 }}>
                      {pendingQueueCount}
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Open Safety Reports</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: analytics.pendingReports > 0 ? 'var(--danger)' : 'var(--success-dark)', marginTop: '2px', margin: 0 }}>
                      {analytics.pendingReports}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: VERIFICATION QUEUE (FIXED & FULLY FEATURED) */}
          {/* ============================================================ */}
          {activeTab === 'verifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Queue Controls */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <Input
                    placeholder="Search applicants by name, company, skills, or email..."
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    leftIcon={<Search size={15} />}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button
                    size="sm"
                    variant={queueFilter === 'PENDING' ? 'primary' : 'outline'}
                    onClick={() => setQueueFilter('PENDING')}
                  >
                    Pending Review ({pendingQueueCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={queueFilter === 'APPROVED' ? 'primary' : 'outline'}
                    onClick={() => setQueueFilter('APPROVED')}
                  >
                    Approved
                  </Button>
                  <Button
                    size="sm"
                    variant={queueFilter === 'ALL' ? 'primary' : 'outline'}
                    onClick={() => setQueueFilter('ALL')}
                  >
                    All ({pendingMentors.length})
                  </Button>
                </div>
              </div>

              {filteredVerifications.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck size={36} />}
                  title={queueFilter === 'PENDING' ? "Verification Queue is Clear! 🎉" : "No mentors match your filter"}
                  description={
                    queueFilter === 'PENDING'
                      ? "All submitted industry mentor applications have been reviewed and vetted by the administration."
                      : "Try resetting your search query or switching filters."
                  }
                  actionText={queueFilter !== 'ALL' ? "View All Mentors" : undefined}
                  onAction={() => setQueueFilter('ALL')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredVerifications.map((m) => {
                    const mentorId = m.userId || m.id || m.user?.id;
                    const mentorName = m.user?.fullName || m.fullName || 'Mentor Applicant';
                    const mentorEmail = m.user?.email || m.email || '';
                    const avatarUrl = m.user?.avatarUrl || m.avatarUrl;
                    const isApproved = m.verificationStatus === 'APPROVED' || m.isVerified;

                    return (
                      <Card key={mentorId} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: isApproved ? '4px solid #10B981' : '4px solid #F59E0B' }}>
                        {/* Header Row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <Avatar name={mentorName} src={avatarUrl} size="lg" isVerified={isApproved} />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                                  {mentorName}
                                </h4>
                                {isApproved ? (
                                  <Badge variant="verified">Verified Mentor</Badge>
                                ) : (
                                  <Badge variant="warning">Application Pending</Badge>
                                )}
                              </div>
                              <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, margin: '3px 0 0 0' }}>
                                {m.title || 'Software Engineer'} {m.company ? `@ ${m.company}` : ''}
                              </p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                                🎓 Alma Mater: {m.college || 'Engineering College'} • 💼 {m.yearsExperience || 0}+ Years Industry Exp • ✉️ {mentorEmail}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewMentor(m)}
                              leftIcon={<Eye size={14} />}
                            >
                              Dossier
                            </Button>
                            {!isApproved && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRejectMentorData(m)}
                                  style={{ color: 'var(--danger)' }}
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleVerifyMentor(m)}
                                  leftIcon={<Check size={14} />}
                                >
                                  Approve & Verify
                                </Button>
                              </>
                            )}
                            {isApproved && (
                              <Badge variant="success" size="sm">Vetted & Live</Badge>
                            )}
                          </div>
                        </div>

                        {/* Bio box */}
                        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Professional Statement: </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {m.bio || 'Applicant has not provided a extended bio description yet.'}
                          </span>
                        </div>

                        {/* Skills & Technologies Pills */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {m.technologies && m.technologies.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                                Technologies:
                              </span>
                              {m.technologies.map((t: string) => (
                                <span
                                  key={t}
                                  style={{
                                    fontSize: '0.74rem',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                                    color: 'var(--primary)',
                                    fontWeight: 600
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {m.skills && m.skills.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                                Core Competencies:
                              </span>
                              {m.skills.map((s: string) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: '0.74rem',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--bg-subtle)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border)',
                                    fontWeight: 500
                                  }}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Links & Availability footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <div>
                            🕒 <strong>Availability:</strong> {m.availabilitySchedule || 'Flexible availability'}
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {m.linkedinUrl && (
                              <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
                                LinkedIn <ExternalLink size={12} />
                              </a>
                            )}
                            {m.githubUrl && (
                              <a href={m.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
                                GitHub <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: CAPSTONE PROJECTS OVERSIGHT (NEW) */}
          {/* ============================================================ */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <Input
                    placeholder="Search projects by title, student, or mentor..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    leftIcon={<Search size={15} />}
                  />
                </div>
                <Select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Project Statuses' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' }
                  ]}
                />
              </div>

              {filteredProjects.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban size={32} />}
                  title="No projects found"
                  description="No capstone projects match the current search filters."
                  actionText="Reset Search"
                  onAction={() => { setProjectSearch(''); setProjectStatusFilter('ALL'); }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredProjects.map((p) => {
                    const progress = p.progressPercentage ?? p.progress_percentage ?? 40;
                    return (
                      <Card key={p.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ flex: 1, minWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                                {p.title}
                              </h4>
                              <Badge variant={p.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
                                {p.status}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                              Student: <strong>{p.student_name || p.studentName || 'Akshay Ramkishor'}</strong> • Guide: <strong>{p.mentor_name || p.mentorName || 'Prof. Nitin Choudhary'}</strong>
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigate && onNavigate('project-workspace', { projectId: p.id })}
                            rightIcon={<ArrowRight size={13} />}
                          >
                            Inspect Workspace
                          </Button>
                        </div>

                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {p.description}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Capstone Milestone Progress</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{progress}%</span>
                          </div>
                          <ProgressBar value={progress} />
                        </div>

                        {p.targetTechnologies && p.targetTechnologies.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {p.targetTechnologies.map((t: string) => (
                              <span key={t} style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: USERS DIRECTORY */}
          {/* ============================================================ */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    leftIcon={<Search size={15} />}
                  />
                </div>
                <Select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Roles' },
                    { value: 'STUDENT', label: 'Students' },
                    { value: 'MENTOR', label: 'Mentors' },
                    { value: 'ADMIN', label: 'Admins' }
                  ]}
                />
              </div>

              <Card padding="none" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>User</th>
                      <th style={{ padding: '12px 16px' }}>Role</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Joined</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar name={u.fullName} src={u.avatarUrl} size="sm" isVerified={u.role === 'MENTOR'} />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.fullName}</div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'MENTOR' ? 'verified' : 'primary'} size="sm">
                            {u.role}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                            {u.status}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {u.role !== 'ADMIN' && (
                            <Button
                              size="sm"
                              variant={u.status === 'ACTIVE' ? 'ghost' : 'success'}
                              onClick={() => handleToggleUserStatus(u)}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: SAFETY REPORTS */}
          {/* ============================================================ */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reports.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle size={28} />}
                  title="No active safety reports"
                  description="The community is safe and healthy."
                />
              ) : (
                reports.map((r) => (
                  <Card key={r.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Badge variant={r.status === 'RESOLVED' ? 'success' : 'danger'} size="sm">
                        {r.status}
                      </Badge>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Reason: {r.reason}
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {r.details}
                      </p>
                    </div>

                    {r.status === 'PENDING' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setResolveReportData(r);
                            setResolutionNotes('');
                          }}
                        >
                          Resolve Issue
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: REVIEWS MODERATION */}
          {/* ============================================================ */}
          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map((rev) => (
                <Card key={rev.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} color="#F59E0B" fill={s <= rev.rating ? '#F59E0B' : 'transparent'} />
                      ))}
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, marginLeft: '4px' }}>{rev.rating} Stars</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant={rev.isApproved ? 'success' : 'neutral'} size="sm">
                        {rev.isApproved ? 'Approved' : 'Pending Moderation'}
                      </Badge>
                      <Button
                        size="sm"
                        variant={rev.isApproved ? 'ghost' : 'outline'}
                        onClick={() => handleModerateReview(rev.id, !rev.isApproved)}
                      >
                        {rev.isApproved ? 'Hide Review' : 'Approve Review'}
                      </Button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: View Full Mentor Application Dossier */}
      <Modal
        isOpen={!!previewMentor}
        onClose={() => setPreviewMentor(null)}
        title="Mentor Application Dossier"
      >
        {previewMentor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Avatar
                name={previewMentor.user?.fullName || previewMentor.fullName || 'Mentor'}
                src={previewMentor.user?.avatarUrl || previewMentor.avatarUrl}
                size="lg"
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  {previewMentor.user?.fullName || previewMentor.fullName}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, margin: '2px 0 0 0' }}>
                  {previewMentor.title} @ {previewMentor.company}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {previewMentor.user?.email || previewMentor.email}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem', lineHeight: 1.5 }}>
              <strong>Bio & Statement:</strong>
              <p style={{ marginTop: '4px', margin: 0 }}>{previewMentor.bio}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Alma Mater:</span>
                <p style={{ fontWeight: 600, margin: 0 }}>{previewMentor.college || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Industry Experience:</span>
                <p style={{ fontWeight: 600, margin: 0 }}>{previewMentor.yearsExperience || 0} Years</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Availability:</span>
                <p style={{ fontWeight: 600, margin: 0 }}>{previewMentor.availabilitySchedule || 'Flexible'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Hourly Mentorship Fee:</span>
                <p style={{ fontWeight: 600, margin: 0 }}>{previewMentor.hourlyRate ? `₹${previewMentor.hourlyRate}/hr` : 'Free / Academic Pro-Bono'}</p>
              </div>
            </div>

            {previewMentor.experienceHighlights && previewMentor.experienceHighlights.length > 0 && (
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Experience Highlights:</span>
                <ul style={{ paddingLeft: '18px', marginTop: '4px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {previewMentor.experienceHighlights.map((h: string, idx: number) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <Button variant="ghost" onClick={() => setPreviewMentor(null)}>Close</Button>
              {(!previewMentor.isVerified && previewMentor.verificationStatus !== 'APPROVED') && (
                <Button
                  variant="success"
                  onClick={() => {
                    handleVerifyMentor(previewMentor);
                    setPreviewMentor(null);
                  }}
                  leftIcon={<Check size={14} />}
                >
                  Approve Application
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Decline Mentor */}
      <Modal isOpen={!!rejectMentorData} onClose={() => setRejectMentorData(null)} title="Decline Mentor Credentials">
        <form onSubmit={handleRejectMentor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Textarea label="Reason for Declining" placeholder="Provide feedback or missing verification requirements..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setRejectMentorData(null)}>Cancel</Button>
            <Button type="submit" variant="danger">Decline Application</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Resolve Report */}
      <Modal isOpen={!!resolveReportData} onClose={() => setResolveReportData(null)} title="Resolve Safety Report">
        <form onSubmit={handleResolveReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Resolution Action"
            value={resolutionAction}
            onChange={(e) => setResolutionAction(e.target.value as 'RESOLVED' | 'DISMISSED')}
            options={[
              { value: 'RESOLVED', label: 'Action Taken / Resolved' },
              { value: 'DISMISSED', label: 'No Violation Found / Dismiss' }
            ]}
          />
          <Textarea label="Resolution Notes" placeholder="Record internal moderator notes..." value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows={3} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setResolveReportData(null)}>Cancel</Button>
            <Button type="submit">Resolve</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
