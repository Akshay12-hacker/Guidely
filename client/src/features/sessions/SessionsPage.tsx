import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { MentorshipSession, SessionStatus } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Select } from '../../components/ui/Select.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  ExternalLink,
  Plus,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface SessionsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const SessionsPage: React.FC<SessionsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'upcoming' | 'past'>('upcoming');

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionAgenda, setSessionAgenda] = useState('');
  const [sessionDateTime, setSessionDateTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(45);
  const [selectedMentorId, setSelectedMentorId] = useState('usr_mentor_priya');

  const [rescheduleModal, setRescheduleModal] = useState<MentorshipSession | null>(null);
  const [newDateTime, setNewDateTime] = useState('');

  const [completeModal, setCompleteModal] = useState<MentorshipSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const [feedbackModal, setFeedbackModal] = useState<MentorshipSession | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMySessions();
      setSessions(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRequestSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle || !sessionAgenda || !sessionDateTime) return;
    try {
      await api.requestSession({
        mentorId: selectedMentorId,
        title: sessionTitle,
        agenda: sessionAgenda,
        scheduledAt: new Date(sessionDateTime).toISOString(),
        durationMinutes: sessionDuration
      });
      showToast('success', 'Session Requested! 📅', 'Your mentor has been notified.');
      setIsRequestModalOpen(false);
      setSessionTitle('');
      setSessionAgenda('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Request failed', err.message);
    }
  };

  const handleConfirm = async (sessionId: string) => {
    try {
      await api.confirmSession(sessionId);
      showToast('success', 'Session Confirmed! 🎉', 'Video meeting room is ready.');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Confirmation failed', err.message);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModal || !newDateTime) return;
    try {
      await api.rescheduleSession(rescheduleModal.id, new Date(newDateTime).toISOString());
      showToast('success', 'Session Rescheduled');
      setRescheduleModal(null);
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Reschedule failed', err.message);
    }
  };

  const handleCancel = async (sessionId: string) => {
    try {
      await api.cancelSession(sessionId);
      showToast('info', 'Session Cancelled');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Cancellation failed', err.message);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModal || !sessionNotes) return;
    try {
      await api.completeSession(completeModal.id, sessionNotes);
      showToast('success', 'Session Marked as Completed');
      setCompleteModal(null);
      setSessionNotes('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Completion failed', err.message);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModal) return;
    try {
      await api.submitSessionFeedback(feedbackModal.id, feedbackText, feedbackRating);
      showToast('success', 'Feedback Submitted! ⭐', 'Thank you for rating your mentor.');
      setFeedbackModal(null);
      setFeedbackText('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Feedback submission failed', err.message);
    }
  };

  const isUpcoming = (scheduledAt: string) => new Date(scheduledAt) >= new Date();

  const filteredSessions = sessions.filter(s => {
    if (viewMode === 'upcoming') return isUpcoming(s.scheduledAt) && s.status !== 'CANCELLED' && s.status !== 'COMPLETED';
    if (viewMode === 'past') return !isUpcoming(s.scheduledAt) || s.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            1-on-1 Mentoring Sessions
          </h1>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Schedule video conferences, code reviews, and architecture deep-dives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.role === 'STUDENT' && (
            <Button onClick={() => setIsRequestModalOpen(true)} leftIcon={<Plus size={16} />}>
              Request New Session
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'upcoming', label: 'Upcoming Sessions' },
          { id: 'past', label: 'Past & Completed' },
          { id: 'list', label: 'All Sessions History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: viewMode === tab.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: viewMode === tab.id ? 'var(--primary-light)' : '#FFFFFF',
              color: viewMode === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.86rem',
              fontWeight: viewMode === tab.id ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={32} />}
          title={viewMode === 'upcoming' ? 'No upcoming sessions scheduled' : 'No sessions found in this view'}
          description="Request a 1-on-1 video call to review architecture decisions or resolve tricky code bugs."
          actionText={user?.role === 'STUDENT' ? 'Schedule a Session' : undefined}
          onAction={() => setIsRequestModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredSessions.map(session => {
            const partner = user?.role === 'STUDENT' ? session.mentor : session.student;
            const partnerRole = user?.role === 'STUDENT' ? 'Mentor' : 'Student';

            return (
              <Card key={session.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Avatar name={partner?.fullName || 'Partner'} src={partner?.avatarUrl} size="md" isVerified={partnerRole === 'Mentor'} />
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {session.title}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        With {partnerRole}: <strong>{partner?.fullName}</strong> {session.mentor?.company ? `(${session.mentor.company})` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant={session.status === 'CONFIRMED' ? 'success' : session.status === 'COMPLETED' ? 'completed' : session.status === 'CANCELLED' ? 'danger' : 'pending'}>
                      {session.status}
                    </Badge>
                  </div>
                </div>

                {/* Agenda */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong>Agenda:</strong> {session.agenda}
                </div>

                {/* Meeting time details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.86rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <Clock size={16} color="var(--primary)" />
                    {new Date(session.scheduledAt).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span>Duration: <strong>{session.durationMinutes} mins</strong></span>
                </div>

                {/* Session Notes if completed */}
                {session.sessionNotes && (
                  <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.86rem', color: '#065F46' }}>
                    <strong>Mentor Notes & Key Takeaways:</strong>
                    <p style={{ marginTop: '4px' }}>{session.sessionNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '14px', flexWrap: 'wrap' }}>
                  {session.status === 'CONFIRMED' && session.meetingUrl && (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="success" size="sm" leftIcon={<Video size={16} />}>
                        Join Video Meeting
                      </Button>
                    </a>
                  )}

                  {session.status === 'REQUESTED' && user?.role === 'MENTOR' && (
                    <Button variant="success" size="sm" onClick={() => handleConfirm(session.id)} leftIcon={<CheckCircle2 size={16} />}>
                      Confirm Session
                    </Button>
                  )}

                  {session.status === 'CONFIRMED' && user?.role === 'MENTOR' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setCompleteModal(session);
                        setSessionNotes('');
                      }}
                    >
                      Complete Session & Add Notes
                    </Button>
                  )}

                  {session.status === 'COMPLETED' && user?.role === 'STUDENT' && !session.studentRating && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setFeedbackModal(session);
                        setFeedbackRating(5);
                        setFeedbackText('');
                      }}
                      leftIcon={<Star size={15} />}
                    >
                      Rate & Review Mentor
                    </Button>
                  )}

                  {session.status !== 'CANCELLED' && session.status !== 'COMPLETED' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRescheduleModal(session);
                          setNewDateTime('');
                        }}
                        leftIcon={<RotateCcw size={15} />}
                      >
                        Reschedule
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(session.id)}
                        style={{ color: 'var(--danger)' }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Request Session */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Schedule 1-on-1 Mentoring Session">
        <form onSubmit={handleRequestSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Session Topic / Title"
            placeholder="e.g. Worker Lease Architecture & Concurrency Review"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            required
          />
          <Textarea
            label="Agenda & Questions to Discuss"
            placeholder="List specific code sections or questions you want your mentor to review..."
            value={sessionAgenda}
            onChange={(e) => setSessionAgenda(e.target.value)}
            rows={4}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input
              label="Date & Time"
              type="datetime-local"
              value={sessionDateTime}
              onChange={(e) => setSessionDateTime(e.target.value)}
              required
            />
            <Select
              label="Duration"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))}
              options={[
                { value: 30, label: '30 mins' },
                { value: 45, label: '45 mins' },
                { value: 60, label: '60 mins' }
              ]}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
            <Button type="submit">Send Schedule Request</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reschedule */}
      <Modal isOpen={!!rescheduleModal} onClose={() => setRescheduleModal(null)} title="Reschedule Mentoring Session">
        <form onSubmit={handleReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Select a new proposed date and time for "{rescheduleModal?.title}".
          </p>
          <Input
            label="New Date & Time"
            type="datetime-local"
            value={newDateTime}
            onChange={(e) => setNewDateTime(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setRescheduleModal(null)}>Cancel</Button>
            <Button type="submit">Confirm New Time</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Complete Session */}
      <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Session & Record Notes">
        <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Record takeaways, feedback, and next steps for the student.
          </p>
          <Textarea
            label="Session Summary & Action Items"
            placeholder="e.g. Reviewed gRPC schemas. Recommended separating coordinator packages. Student understands channel select patterns clearly."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={5}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button type="submit">Complete Session</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Feedback */}
      <Modal isOpen={!!feedbackModal} onClose={() => setFeedbackModal(null)} title="Rate & Review Your Mentor">
        <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.86rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Your Rating (1 to 5 Stars)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star size={28} color="#F59E0B" fill={star <= feedbackRating ? '#F59E0B' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Written Review"
            placeholder="Describe what you learned and how your mentor helped your project..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setFeedbackModal(null)}>Cancel</Button>
            <Button type="submit">Submit Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
