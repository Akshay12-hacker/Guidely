import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { LoadingSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Users,
  CheckCircle2,
  Clock,
  Star,
  BookOpen,
  Calendar,
  MessageSquare,
  ArrowRight,
  Video
} from 'lucide-react';
import { formatGreetingName } from '../../utils/formatters.js';

interface MentorDashboardProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getMentorDashboard();
        setData(res);
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton width="300px" height="32px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <LoadingSkeleton height="80px" />
          <LoadingSkeleton height="80px" />
          <LoadingSkeleton height="80px" />
          <LoadingSkeleton height="80px" />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const profile = data?.profile;
  const stats = data?.stats || {};
  const activeMenteesCount = stats.activeStudents ?? data?.activeMenteesCount ?? (data?.activeProjects?.length || 0);
  const completedMenteesCount = stats.completedProjects ?? data?.completedMenteesCount ?? 0;
  const hoursMentored = stats.completedSessions ?? data?.hoursMentored ?? 0;
  const totalReviews = stats.totalReviews ?? profile?.reviewsCount ?? 0;
  const averageRating = (totalReviews > 0 || (profile?.reviewsCount && profile.reviewsCount > 0)) ? (stats.averageRating || profile?.rating || 5.0) : 0;
  const pendingRequests = data?.incomingRequests || data?.pendingRequests || [];
  const activeProjects = data?.activeProjects || data?.activeMentees || [];
  const upcomingSessions = data?.upcomingSessions || [];

  const mentorFullName = user?.fullName || profile?.fullName || profile?.user?.fullName;
  const greetingName = formatGreetingName(mentorFullName, 'Mentor');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {greetingTime()}, {greetingName} 👋
            </h1>
            {profile?.isVerified || profile?.verificationStatus === 'APPROVED' ? (
              <Badge variant="verified">Verified Mentor</Badge>
            ) : profile?.verificationStatus === 'REJECTED' ? (
              <Badge variant="danger">Verification Rejected</Badge>
            ) : (
              <Badge variant="warning">Verification Pending</Badge>
            )}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {profile?.title || 'Engineer'} {profile?.company ? `@ ${profile.company}` : ''} • Mentoring Workspace
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigate('mentor-requests')} leftIcon={<BookOpen size={15} />}>
            Proposals ({pendingRequests.length})
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('mentor-students')} leftIcon={<Users size={15} />}>
            Active Students ({activeMenteesCount})
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('messages')} leftIcon={<MessageSquare size={15} />}>
            Messages
          </Button>
        </div>
      </div>

      {/* Verification Notice Banner if Pending */}
      {(!profile?.isVerified && profile?.verificationStatus !== 'APPROVED') && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400E', margin: 0 }}>
                Profile Under Admin Verification
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#B45309', margin: 0 }}>
                Your mentor application has been registered. You can set up your tech skills, availability schedule, and accept student requests.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('mentor-profile')}>
            Edit Profile
          </Button>
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Active Students"
          value={activeMenteesCount}
          icon={<Users size={18} />}
          changeText={activeMenteesCount > 0 ? `${activeMenteesCount} active project${activeMenteesCount > 1 ? 's' : ''}` : "No active students"}
        />
        <StatCard
          label="Completed Projects"
          value={completedMenteesCount}
          icon={<CheckCircle2 size={18} />}
          iconBg="var(--success-light)"
          iconColor="var(--success-dark)"
        />
        <StatCard
          label="Sessions Completed"
          value={hoursMentored}
          icon={<Clock size={18} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          label="Mentor Rating"
          value={averageRating > 0 ? `${averageRating.toFixed(1)} ⭐` : 'New ⭐'}
          icon={<Star size={18} />}
          iconBg="#FFFBEB"
          iconColor="#D97706"
        />
      </div>

      {/* Action Needed Queue */}
      {pendingRequests.length > 0 && (
        <Card padding="lg" style={{ border: '1.5px solid var(--primary-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="warning">Action Needed</Badge>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Incoming Mentorship Proposals ({pendingRequests.length})
              </h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('mentor-requests')} rightIcon={<ArrowRight size={14} />}>
              Review All
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingRequests.map((req: any) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={req.student_name} src={req.student_avatar} size="sm" />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {req.project_title}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Student: {req.student_name} ({req.student_college})
                    </p>
                  </div>
                </div>

                <Button size="sm" variant="primary" onClick={() => onNavigate('mentor-requests')}>
                  Review Proposal
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Grid: Active Student Projects & Upcoming Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Active Projects */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Active Student Projects
            </h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('mentor-students')} rightIcon={<ArrowRight size={14} />}>
              View All ({activeProjects.length})
            </Button>
          </div>

          {activeProjects.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No active projects yet"
              description="Review and accept pending student proposals to start guiding their capstone projects."
              actionText="Check Proposals Queue"
              onAction={() => onNavigate('mentor-requests')}
              actionIcon={<ArrowRight size={13} />}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeProjects.map((p: any) => {
                const progress = p.progressPercentage ?? p.progress_percentage ?? 0;
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={p.student_name} src={p.student_avatar} size="xs" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.student_name}
                        </span>
                      </div>
                      <Badge variant="in_progress" size="sm">{progress}%</Badge>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {p.title}
                    </h4>

                    <ProgressBar value={progress} size="sm" />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <Button size="sm" variant="secondary" onClick={() => onNavigate('student-project', { projectId: p.id })} rightIcon={<ArrowRight size={13} />}>
                        Open Workspace
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming Mentoring Sessions */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Upcoming Syncs
            </h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('mentor-sessions')}>
              View All
            </Button>
          </div>

          {upcomingSessions.length === 0 ? (
            <EmptyState
              icon={<Calendar size={24} />}
              title="No upcoming syncs"
              description="Scheduled 1-on-1 video reviews will appear here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingSessions.map((s: any) => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge variant={s.status === 'CONFIRMED' ? 'success' : 'pending'} size="sm">
                      {s.status}
                    </Badge>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {new Date(s.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Student: {s.student_name}
                  </p>

                  {s.meeting_url && (
                    <a href={s.meeting_url} target="_blank" rel="noreferrer" style={{ marginTop: '4px' }}>
                      <Button size="sm" variant="success" leftIcon={<Video size={14} />} style={{ width: '100%' }}>
                        Join Video Meeting
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
