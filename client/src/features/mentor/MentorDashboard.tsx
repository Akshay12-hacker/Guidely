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
  Video,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <LoadingSkeleton width="320px" height="36px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <LoadingSkeleton height="100px" />
          <LoadingSkeleton height="100px" />
          <LoadingSkeleton height="100px" />
          <LoadingSkeleton height="100px" />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const {
    profile,
    activeMenteesCount = 1,
    completedMenteesCount = 4,
    hoursMentored = 28,
    averageRating = 4.95,
    pendingRequests = [],
    activeProjects = [],
    upcomingSessions = []
  } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {greetingTime()}, {user?.fullName?.split(' ')[0] || 'Mentor'} 👋
            </h1>
            <Badge variant="verified">Verified Mentor</Badge>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {profile?.title || 'Engineer'} @ {profile?.company || 'Guidly'} • Mentoring Portal
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigate('mentor-requests')} leftIcon={<BookOpen size={16} />}>
            View Requests ({pendingRequests.length})
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('messages')} leftIcon={<MessageSquare size={16} />}>
            Open Messages
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard
          label="Active Students"
          value={activeMenteesCount}
          icon={<Users size={20} />}
          changeText="In Progress"
        />
        <StatCard
          label="Completed Projects"
          value={completedMenteesCount}
          icon={<CheckCircle2 size={20} />}
          iconBg="var(--success-light)"
          iconColor="var(--success)"
        />
        <StatCard
          label="Hours Mentored"
          value={`${hoursMentored} hrs`}
          icon={<Clock size={20} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          label="Average Rating"
          value={`${averageRating} ⭐`}
          icon={<Star size={20} />}
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
        />
      </div>

      {/* Incoming Requests Triage Queue */}
      {pendingRequests.length > 0 && (
        <Card padding="lg" style={{ border: '2px solid var(--primary-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="warning">Action Needed</Badge>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Incoming Mentorship Proposals ({pendingRequests.length})
              </h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('mentor-requests')} rightIcon={<ArrowRight size={15} />}>
              Review All Requests
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map((req: any) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={req.student_name} src={req.student_avatar} size="sm" />
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {req.project_title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Active Projects */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Active Student Projects
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {activeProjects.length} active
            </span>
          </div>

          {activeProjects.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No active projects"
              description="Accept a student proposal to start mentoring."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeProjects.map((p: any) => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={p.student_name} src={p.student_avatar} size="xs" />
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {p.student_name}
                      </span>
                    </div>
                    <Badge variant="in_progress" size="sm">{p.progress_percentage}%</Badge>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.title}
                  </h4>

                  <ProgressBar value={p.progress_percentage} size="sm" />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Button size="sm" variant="outline" onClick={() => onNavigate('student-project', { projectId: p.id })} rightIcon={<ArrowRight size={14} />}>
                      Open Workspace
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Mentoring Sessions */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Upcoming Sessions
            </h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('mentor-sessions')}>
              View All
            </Button>
          </div>

          {upcomingSessions.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="No sessions scheduled"
              description="Upcoming video syncs with students will appear here."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingSessions.map((s: any) => (
                <div
                  key={s.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge variant={s.status === 'CONFIRMED' ? 'success' : 'pending'} size="sm">
                      {s.status}
                    </Badge>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {new Date(s.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
