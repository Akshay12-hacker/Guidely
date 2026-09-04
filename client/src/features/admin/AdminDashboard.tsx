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
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: string;
  onNavigate?: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview', onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab.replace('admin-', ''));

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Users tab state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Modals state
  const [rejectMentorData, setRejectMentorData] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [resolveReportData, setResolveReportData] = useState<Report | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, usersRes, reportsRes, reviewsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({}),
        api.getAdminReports(),
        api.getReviewsForModeration()
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes.users || []);
      setReports(reportsRes);
      setReviews(reviewsRes);

      const unverified = (usersRes.users || []).filter((u: any) => u.role === 'MENTOR' && u.mentorProfile && !u.mentorProfile.isVerified);
      setPendingMentors(unverified);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyMentor = async (mentorUserId: string) => {
    try {
      await api.verifyMentor(mentorUserId, 'APPROVED');
      showToast('success', 'Mentor Verified', 'Verified badge granted to mentor.');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const handleRejectMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectMentorData) return;

    try {
      await api.verifyMentor(rejectMentorData.id, 'REJECTED', rejectReason);
      showToast('info', 'Mentor application declined.');
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Badge variant="danger">Administration</Badge>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Platform Governance & Operations
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Monitor platform metrics, verify industry mentor credentials, and moderate reports.
        </p>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Platform KPIs', icon: <BarChart3 size={16} /> },
          { id: 'users', label: 'Users Directory', count: users.length, icon: <Users size={16} /> },
          { id: 'verifications', label: 'Verification Queue', count: pendingMentors.length, icon: <ShieldCheck size={16} /> },
          { id: 'reports', label: 'Safety Reports', count: reports.filter(r => r.status === 'PENDING').length, icon: <FileWarning size={16} /> },
          { id: 'reviews', label: 'Review Moderation', count: reviews.length, icon: <Star size={16} /> }
        ]}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatCard
                  label="Total Students"
                  value={analytics.totalStudents}
                  icon={<Users size={18} />}
                  changeText="+14% this month"
                />
                <StatCard
                  label="Verified Mentors"
                  value={analytics.totalMentors}
                  icon={<ShieldCheck size={18} />}
                  iconBg="#EFF6FF"
                  iconColor="#2563EB"
                  changeText="Active"
                />
                <StatCard
                  label="Active Mentorships"
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
                />
              </div>

              {/* Projects Breakdown Card */}
              <Card padding="lg">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Project Status Distribution</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>In Progress</span>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{analytics.totalActiveMentorships}</p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completed</span>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success-dark)', marginTop: '2px' }}>{analytics.totalCompletedProjects}</p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Sessions</span>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--warning-dark)', marginTop: '2px' }}>{analytics.totalSessions}</p>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Open Reports</span>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--danger)', marginTop: '2px' }}>{analytics.pendingReports}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
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

          {/* TAB 3: VERIFICATION QUEUE */}
          {activeTab === 'verifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingMentors.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck size={28} />}
                  title="No pending mentor verifications"
                  description="All mentor credentials have been vetted."
                />
              ) : (
                pendingMentors.map((m) => (
                  <Card key={m.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar name={m.fullName} src={m.avatarUrl} size="md" />
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{m.fullName}</h4>
                          <p style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {m.mentorProfile?.title} @ {m.mentorProfile?.company}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Alma Mater: {m.mentorProfile?.college} • {m.mentorProfile?.yearsExperience}+ Years Exp
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectMentorData(m)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleVerifyMentor(m.id)}
                          leftIcon={<Check size={14} />}
                        >
                          Approve & Verify
                        </Button>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem' }}>
                      <strong>Bio & Credentials:</strong> {m.mentorProfile?.bio}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 4: SAFETY REPORTS */}
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

          {/* TAB 5: REVIEWS MODERATION */}
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
                    <Badge variant={rev.isApproved ? 'success' : 'neutral'} size="sm">
                      {rev.isApproved ? 'Approved' : 'Pending Moderation'}
                    </Badge>
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
