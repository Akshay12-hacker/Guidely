import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { User, AdminAnalytics } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  BarChart3,
  Users,
  ShieldCheck,
  FileWarning,
  Star,
  CheckCircle2,
  FolderKanban,
  Calendar,
  Search
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: string;
  onNavigate: (route: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview', onNavigate }) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter in Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Modals
  const [rejectModal, setRejectModal] = useState<{ mentorId: string; mentorName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [reportActionModal, setReportActionModal] = useState<{ reportId: string; action: 'RESOLVE' | 'DISMISS' } | null>(null);
  const [reportActionNotes, setReportActionNotes] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, verifsRes, reportsRes, reviewsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({}),
        api.getPendingVerifications(),
        api.getAdminReports(),
        api.getReviewsForModeration()
      ]);

      setAnalytics(statsRes);
      setUsers(usersRes.users || []);
      setVerifications(verifsRes || []);
      setReports(reportsRes || []);
      setReviews(reviewsRes || []);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(targetUser.id, nextStatus);
      showToast('success', 'User Status Updated', `${targetUser.fullName} is now ${nextStatus}.`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const handleApproveVerification = async (mentorId: string, mentorName: string) => {
    try {
      await api.verifyMentor(mentorId, 'APPROVED');
      showToast('success', 'Mentor Verified! 🛡️', `${mentorName} has been approved with a Verified Badge.`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Approval failed', err.message);
    }
  };

  const handleRejectVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal) return;
    try {
      await api.verifyMentor(rejectModal.mentorId, 'REJECTED', rejectReason);
      showToast('info', 'Application Rejected', 'Feedback was recorded.');
      setRejectModal(null);
      setRejectReason('');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action failed', err.message);
    }
  };

  const handleReportAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportActionModal) return;
    try {
      const status = reportActionModal.action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED';
      await api.resolveReport(reportActionModal.reportId, status, reportActionNotes);
      showToast('success', status === 'RESOLVED' ? 'Report Resolved' : 'Report Dismissed');
      setReportActionModal(null);
      setReportActionNotes('');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action failed', err.message);
    }
  };

  const handleModerateReview = async (reviewId: string, action: 'APPROVE' | 'REMOVE') => {
    try {
      await api.moderateReview(reviewId, action === 'APPROVE');
      showToast('success', action === 'APPROVE' ? 'Review Approved' : 'Review Removed');
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Action failed', err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'overview', label: 'Platform KPIs', icon: <BarChart3 size={17} /> },
    { id: 'users', label: 'Users Directory', count: users.length, icon: <Users size={17} /> },
    { id: 'verifications', label: 'Verification Queue', count: verifications.length, icon: <ShieldCheck size={17} /> },
    { id: 'reports', label: 'Reports & Issues', count: reports.filter(r => r.status === 'PENDING').length, icon: <FileWarning size={17} /> },
    { id: 'reviews', label: 'Reviews Moderation', count: reviews.length, icon: <Star size={17} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Badge variant="danger">System Administration</Badge>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Guidly Platform Governance & Moderation
        </h1>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)' }}>
          Manage user accounts, verify industry credentials, and moderate platform activity.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW KPIs */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
          {analytics ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <StatCard label="Total Registered Users" value={analytics.totalUsers} icon={<Users size={20} />} changeText="+12% this mo" />
                <StatCard label="Verified Mentors" value={analytics.totalMentors} icon={<ShieldCheck size={20} />} iconBg="#EFF6FF" iconColor="#2563EB" />
                <StatCard label="Student Builders" value={analytics.totalStudents} icon={<Users size={20} />} iconBg="var(--primary-light)" iconColor="var(--primary)" />
                <StatCard label="Active Mentorships" value={analytics.totalActiveMentorships} icon={<FolderKanban size={20} />} iconBg="var(--success-light)" iconColor="var(--success)" />
                <StatCard label="Completed Projects" value={analytics.totalCompletedProjects} icon={<CheckCircle2 size={20} />} iconBg="#ECFDF5" iconColor="#059669" />
                <StatCard label="Total Sessions" value={analytics.totalSessions} icon={<Calendar size={20} />} iconBg="#FFFBEB" iconColor="#D97706" />
                <StatCard label="Acceptance Rate" value={`${analytics.acceptanceRate}%`} icon={<Star size={20} />} iconBg="#FEF3C7" iconColor="#F59E0B" />
                <StatCard label="Pending Verifications" value={analytics.pendingVerifications} icon={<ShieldCheck size={20} />} iconBg="var(--warning-light)" iconColor="var(--warning)" />
              </div>

              {/* Activity breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <Card padding="lg">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Platform Health & Integrity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Database Engine</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>SQLite (WAL Mode) • 14 Tables</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>WebSocket Real-Time Server</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>Active (Port 5000)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Video Room Integration</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Jitsi Meet Server</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pending Moderation Reports</span>
                      <span style={{ fontWeight: 700, color: analytics.pendingReports > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {analytics.pendingReports} pending
                      </span>
                    </div>
                  </div>
                </Card>

                <Card padding="lg">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Quick Admin Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button variant="outline" onClick={() => setActiveTab('verifications')} leftIcon={<ShieldCheck size={16} />}>
                      Review Pending Mentor Verifications ({verifications.length})
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('users')} leftIcon={<Users size={16} />}>
                      Search Users & Manage Permissions
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('reports')} leftIcon={<FileWarning size={16} />}>
                      Review Reported Accounts ({reports.filter(r => r.status === 'PENDING').length})
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <CardSkeleton />
          )}
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <Card padding="lg" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'STUDENT', 'MENTOR', 'ADMIN'].map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: userRoleFilter === role ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: userRoleFilter === role ? 'var(--primary-light)' : '#FFFFFF',
                    color: userRoleFilter === role ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: userRoleFilter === role ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>User</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Joined Date</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={u.fullName} src={u.avatarUrl} size="sm" />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.fullName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'MENTOR' ? 'verified' : 'primary'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {u.role !== 'ADMIN' && (
                        <Button
                          size="sm"
                          variant={u.status === 'ACTIVE' ? 'ghost' : 'success'}
                          onClick={() => handleToggleUserStatus(u)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          {verifications.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck size={32} />}
              title="Verification Queue is Empty"
              description="All mentor applications have been reviewed and processed."
            />
          ) : (
            verifications.map(m => (
              <Card key={m.userId} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Avatar name={m.user?.fullName || 'Mentor'} src={m.user?.avatarUrl} size="md" />
                    <div>
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {m.user?.fullName}
                      </h3>
                      <p style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {m.title} @ {m.company}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {m.college} • {m.yearsExperience}+ Years Experience • {m.user?.email}
                      </p>
                    </div>
                  </div>

                  <Badge variant={m.isVerified ? 'verified' : 'pending'}>
                    {m.isVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {m.bio}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {m.skills?.map((s: string) => <Badge key={s} variant="neutral" size="sm">{s}</Badge>)}
                  {m.technologies?.map((t: string) => <Badge key={t} variant="primary" size="sm">{t}</Badge>)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRejectModal({ mentorId: m.userId, mentorName: m.user?.fullName });
                      setRejectReason('');
                    }}
                    style={{ color: 'var(--danger)' }}
                  >
                    Reject Application
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApproveVerification(m.userId, m.user?.fullName)}
                    leftIcon={<ShieldCheck size={16} />}
                  >
                    Approve & Grant Verified Badge
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          {reports.length === 0 ? (
            <EmptyState
              icon={<FileWarning size={32} />}
              title="No reports filed"
              description="No user misconduct or content reports are pending review."
            />
          ) : (
            reports.map(rep => (
              <Card key={rep.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Badge variant={rep.status === 'PENDING' ? 'warning' : 'neutral'}>
                    {rep.status}
                  </Badge>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Reported on {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)' }}>
                    Reason: {rep.reason}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginTop: '4px' }}>
                    {rep.details || 'No additional details.'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Reported User: <strong>{rep.reportedUser?.fullName}</strong> ({rep.reportedUser?.email})
                  </p>
                </div>

                {rep.status === 'PENDING' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setReportActionModal({ reportId: rep.id, action: 'DISMISS' })}
                    >
                      Dismiss Report
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setReportActionModal({ reportId: rep.id, action: 'RESOLVE' })}
                    >
                      Take Action & Resolve
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          {reviews.length === 0 ? (
            <EmptyState
              icon={<Star size={32} />}
              title="No reviews to moderate"
              description="All student reviews are in good standing."
            />
          ) : (
            reviews.map(rev => (
              <Card key={rev.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={rev.student?.fullName || 'Student'} size="xs" />
                    <div>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{rev.student?.fullName || 'Student'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        reviewed <strong>{rev.mentor?.fullName || 'Mentor'}</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} color="#F59E0B" fill={s <= rev.rating ? '#F59E0B' : 'transparent'} />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleModerateReview(rev.id, 'REMOVE')}
                    style={{ color: 'var(--danger)' }}
                  >
                    Remove Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleModerateReview(rev.id, 'APPROVE')}
                  >
                    Approve Review
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal: Reject Verification */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Mentor Application"
        subtitle={`Application for ${rejectModal?.mentorName}`}
      >
        <form onSubmit={handleRejectVerification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Textarea
            label="Reason for Rejection / Feedback"
            placeholder="e.g. Please provide a verified corporate email address or link your public GitHub / LinkedIn profile..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button type="submit" variant="danger">Confirm Rejection</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Report Action */}
      <Modal
        isOpen={!!reportActionModal}
        onClose={() => setReportActionModal(null)}
        title={reportActionModal?.action === 'RESOLVE' ? 'Resolve Report' : 'Dismiss Report'}
      >
        <form onSubmit={handleReportAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reportActionModal?.action === 'RESOLVE' ? (
            <Textarea
              label="Action Taken & Resolution Notes"
              placeholder="e.g. Warning issued to user regarding platform communication guidelines..."
              value={reportActionNotes}
              onChange={(e) => setReportActionNotes(e.target.value)}
              rows={4}
              required
            />
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Are you sure you want to dismiss this report without taking disciplinary action?
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setReportActionModal(null)}>Cancel</Button>
            <Button type="submit" variant={reportActionModal?.action === 'RESOLVE' ? 'danger' : 'primary'}>
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
