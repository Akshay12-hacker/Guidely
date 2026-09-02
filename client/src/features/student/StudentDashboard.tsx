import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { LoadingSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Compass,
  FolderKanban,
  Calendar,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  Video,
  CheckCircle2,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (route: string, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getStudentDashboard();
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
        <LoadingSkeleton width="300px" height="36px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const {
    profile,
    profileCompletionPercentage = 85,
    activeProject,
    nextSession,
    pendingRequests = [],
    recommendedMentors = []
  } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Top Section: Greeting & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {greetingTime()}, {user?.fullName?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Welcome back to your project development workspace.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigate('find-mentor')} leftIcon={<Compass size={16} />}>
            Find a Mentor
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('student-sessions')} leftIcon={<Calendar size={16} />}>
            Schedule Session
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('messages')} leftIcon={<MessageSquare size={16} />}>
            Open Messages
          </Button>
        </div>
      </div>

      {/* Profile Completion Alert if incomplete */}
      {profileCompletionPercentage < 100 && (
        <Card
          padding="sm"
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E40AF' }}>
                Profile {profileCompletionPercentage}% complete
              </span>
              <p style={{ fontSize: '0.8rem', color: '#3B82F6' }}>
                Complete your remaining project preferences to get higher match rates with top mentors.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('student-onboarding')}>
            Finish Setup →
          </Button>
        </Card>
      )}

      {/* Main Grid: Active Project & Next Mentoring Session */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Active Project Card */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Project
              </span>
              {activeProject ? (
                <Badge variant={activeProject.status === 'COMPLETED' ? 'completed' : 'in_progress'}>
                  {activeProject.status}
                </Badge>
              ) : (
                <Badge variant="neutral">No Active Project</Badge>
              )}
            </div>

            {activeProject ? (
              <>
                <h3 style={{ fontSize: '1.24rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {activeProject.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {activeProject.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Project Progress</span>
                    <span style={{ color: 'var(--primary)' }}>{activeProject.progress_percentage}%</span>
                  </div>
                  <ProgressBar value={activeProject.progress_percentage} size="md" />
                </div>

                {/* Assigned Mentor */}
                {activeProject.mentor_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                    <Avatar name={activeProject.mentor_name} src={activeProject.mentor_avatar} size="sm" isVerified={true} />
                    <div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {activeProject.mentor_name}
                      </span>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {activeProject.mentor_title || 'Mentor'} • {activeProject.mentor_company || ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: 'var(--warning)', backgroundColor: 'var(--warning-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    Pending mentor assignment
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<FolderKanban size={24} />}
                title="You don't have an active project yet"
                description="Start your engineering journey by requesting mentorship from an industry engineer."
                actionText="Find Your Mentor →"
                onAction={() => onNavigate('find-mentor')}
              />
            )}
          </div>

          {activeProject && (
            <Button onClick={() => onNavigate('student-project')} rightIcon={<ArrowRight size={16} />}>
              Open Project Workspace
            </Button>
          )}
        </Card>

        {/* Next Mentoring Session Card */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Next Mentoring Session
              </span>
              {nextSession && (
                <Badge variant={nextSession.status === 'CONFIRMED' ? 'success' : 'pending'}>
                  {nextSession.status}
                </Badge>
              )}
            </div>

            {nextSession ? (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {nextSession.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {nextSession.agenda}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Clock size={16} color="var(--primary)" />
                    <span>{new Date(nextSession.scheduled_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={nextSession.mentor_name} src={nextSession.mentor_avatar} size="xs" isVerified={true} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Mentor: <strong>{nextSession.mentor_name}</strong> ({nextSession.mentor_company})
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Calendar size={24} />}
                title="No upcoming sessions"
                description="Need advice on architecture or debugging? Request a 1-on-1 video call with your mentor."
                actionText="Schedule Session"
                onAction={() => onNavigate('student-sessions')}
              />
            )}
          </div>

          {nextSession && nextSession.meeting_url && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={nextSession.meeting_url}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1 }}
              >
                <Button variant="success" leftIcon={<Video size={16} />} style={{ width: '100%' }}>
                  Join Video Room
                </Button>
              </a>
              <Button variant="secondary" onClick={() => onNavigate('student-sessions')}>
                Details
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Pending Mentorship Requests (if any) */}
      {pendingRequests.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Pending Mentorship Requests ({pendingRequests.length})
            </h3>
            <button
              onClick={() => onNavigate('student-requests')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer' }}
            >
              View all requests →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {pendingRequests.map((req: any) => (
              <Card key={req.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Badge variant={req.status === 'INFO_REQUESTED' ? 'warning' : 'pending'}>
                    {req.status === 'INFO_REQUESTED' ? 'Info Requested' : 'Awaiting Mentor'}
                  </Badge>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {req.project_title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Mentor: {req.mentor_name} ({req.mentor_company})
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onNavigate('student-requests')}>
                  View Status
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Mentors Carousel / Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.24rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recommended Mentors For You
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Engineers specializing in your target technologies
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('find-mentor')} rightIcon={<ArrowRight size={15} />}>
            Explore All Mentors
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {recommendedMentors.map((mentor: any) => (
            <Card key={mentor.id} hoverable padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Avatar name={mentor.full_name} src={mentor.avatar_url} size="md" isVerified={true} isOnline={true} />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {mentor.full_name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {mentor.title} @ {mentor.company}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {(mentor.technologies || []).slice(0, 3).map((t: string) => (
                    <span key={t} style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-main)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontSize: '0.72rem', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <span>{mentor.rating || 5.0}</span>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onNavigate('find-mentor', { mentorId: mentor.id })}>
                  Request Mentorship
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
