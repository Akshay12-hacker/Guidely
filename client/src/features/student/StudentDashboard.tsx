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
  Clock,
  Video,
  ExternalLink,
  Camera,
  Bot
} from 'lucide-react';
import { ProfilePhotoModal } from '../../components/ui/ProfilePhotoModal.js';
import { MentorMatchChatbot } from './MentorMatchChatbot.js';

interface StudentDashboardProps {
  onNavigate: (route: string, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton width="280px" height="32px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const {
    profileCompletionPercentage = 85,
    activeProject,
    nextSession,
    pendingRequests = [],
    recommendedMentors = []
  } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              name={user?.fullName || 'Student'}
              src={user?.avatarUrl}
              size="lg"
            />
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              title="Update profile photo on Cloudinary"
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <Camera size={11} />
            </button>
          </div>

          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {greetingTime()}, {user?.fullName?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Welcome back to your project development workspace.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigate('find-mentor')} leftIcon={<Compass size={15} />}>
            Find a Mentor
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('student-sessions')} leftIcon={<Calendar size={15} />}>
            Schedule Session
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('messages')} leftIcon={<MessageSquare size={15} />}>
            Messages
          </Button>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletionPercentage < 100 && (
        <Card
          padding="sm"
          style={{
            backgroundColor: 'var(--primary-light)',
            borderColor: 'var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>
                Profile is {profileCompletionPercentage}% complete
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Complete your target technologies to get higher match rates with mentors.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('student-onboarding')}>
            Complete Profile →
          </Button>
        </Card>
      )}

      {/* Main Grid: Active Project & Next Mentoring Session */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Active Project Card */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {activeProject.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {activeProject.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Completion Progress</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{activeProject.progress_percentage}%</span>
                  </div>
                  <ProgressBar value={activeProject.progress_percentage} size="md" />
                </div>

                {/* Mentor Info */}
                {activeProject.mentor_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <Avatar name={activeProject.mentor_name} src={activeProject.mentor_avatar} size="sm" isVerified={true} />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {activeProject.mentor_name}
                      </span>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {activeProject.mentor_title || 'Mentor'} {activeProject.mentor_company ? `@ ${activeProject.mentor_company}` : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--warning-text)', backgroundColor: 'var(--warning-light)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--warning-border)' }}>
                    Awaiting mentor assignment
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<FolderKanban size={24} />}
                title="No active project yet"
                description="Propose your capstone idea to a verified engineer to start building."
                actionText="Find Your Mentor →"
                onAction={() => onNavigate('find-mentor')}
              />
            )}
          </div>

          {activeProject && (
            <Button onClick={() => onNavigate('student-project')} rightIcon={<ArrowRight size={15} />}>
              Open Project Workspace
            </Button>
          )}
        </Card>

        {/* Next Mentoring Session Card */}
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Next Video Session
              </span>
              {nextSession && (
                <Badge variant={nextSession.status === 'CONFIRMED' ? 'success' : 'pending'}>
                  {nextSession.status}
                </Badge>
              )}
            </div>

            {nextSession ? (
              <>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {nextSession.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {nextSession.agenda}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Clock size={15} color="var(--primary)" />
                    <span>{new Date(nextSession.scheduled_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name={nextSession.mentor_name} src={nextSession.mentor_avatar} size="xs" isVerified={true} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Mentor: <strong>{nextSession.mentor_name}</strong> {nextSession.mentor_company ? `(${nextSession.mentor_company})` : ''}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Calendar size={24} />}
                title="No upcoming sessions"
                description="Need feedback on system architecture or debugging? Schedule a 1-on-1 video call."
                actionText="Schedule Session"
                onAction={() => onNavigate('student-sessions')}
              />
            )}
          </div>

          {nextSession && nextSession.meeting_url && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={nextSession.meeting_url}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1 }}
              >
                <Button variant="success" leftIcon={<Video size={15} />} style={{ width: '100%' }}>
                  Join Meeting Room
                </Button>
              </a>
              <Button variant="secondary" onClick={() => onNavigate('student-sessions')}>
                Details
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Pending Proposals ({pendingRequests.length})
            </h3>
            <button
              onClick={() => onNavigate('student-requests')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
            >
              View all requests →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {pendingRequests.map((req: any) => (
              <Card key={req.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Badge variant={req.status === 'INFO_REQUESTED' ? 'warning' : 'pending'} size="sm">
                    {req.status === 'INFO_REQUESTED' ? 'Info Requested' : 'Awaiting Mentor'}
                  </Badge>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {req.project_title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Mentor: {req.mentor_name} {req.mentor_company ? `(${req.mentor_company})` : ''}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onNavigate('student-requests')}>
                  View Status
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Mentors */}
      <div>
        {/* AI Mentor Advisor Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--primary-light)',
            border: '1.5px solid var(--primary-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Not sure which mentor fits your project?
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Chat with our AI Mentor Advisor. Explain what you want to build and get tailored human mentor recommendations.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsChatbotOpen(true)}
            leftIcon={<Sparkles size={14} />}
          >
            Talk with Advisor
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recommended Mentors For You
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Engineers matched to your project vision, target technologies & guidance needs
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChatbotOpen(true)}
              leftIcon={<Bot size={14} />}
            >
              AI Match Chatbot
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('find-mentor')} rightIcon={<ArrowRight size={14} />}>
              Explore All
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {recommendedMentors.map((mentor: any) => {
            const matchScore = mentor.matchScore || 90;
            const matchColor = matchScore >= 85 ? '#10B981' : matchScore >= 70 ? '#6366F1' : '#F59E0B';
            return (
              <Card key={mentor.id} hoverable padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={mentor.full_name || mentor.fullName} src={mentor.avatar_url || mentor.avatarUrl} size="md" isVerified={true} isOnline={true} />
                      <div>
                        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {mentor.full_name || mentor.fullName}
                        </h4>
                        <p style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {mentor.title} @ {mentor.company}
                        </p>
                      </div>
                    </div>
                    {mentor.matchScore && (
                      <span
                        style={{
                          backgroundColor: `${matchColor}15`,
                          color: matchColor,
                          border: `1px solid ${matchColor}40`,
                          padding: '2px 7px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {mentor.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {mentor.matchReasons && mentor.matchReasons.length > 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.3 }}>
                      ✓ {mentor.matchReasons[0]}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {(mentor.technologies || []).slice(0, 3).map((t: string) => (
                      <span key={t} style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontSize: '0.72rem', fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ⭐ {mentor.rating ? mentor.rating.toFixed(1) : '5.0'}
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => onNavigate('find-mentor', { mentorId: mentor.id })}>
                    Request
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      <MentorMatchChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigate={onNavigate}
        initialCriteria={{
          projectIdea: data?.profile?.projectIdea || data?.activeProject?.title,
          targetTechnologies: data?.profile?.targetTechnologies,
          helpNeededAreas: data?.profile?.helpNeededAreas
        }}
      />
    </div>
  );
};
