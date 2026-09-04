import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { MentorshipSession } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Star,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

interface SessionsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const SessionsPage: React.FC<SessionsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionAgenda, setSessionAgenda] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(45);

  const [rescheduleSession, setRescheduleSession] = useState<MentorshipSession | null>(null);
  const [newScheduleTime, setNewScheduleTime] = useState('');

  const [completeSessionData, setCompleteSessionData] = useState<MentorshipSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const [rateSessionData, setRateSessionData] = useState<MentorshipSession | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle || !sessionTime) return;

    setIsSubmitting(true);
    try {
      // For demo session creation, use mentor ID or default to Nitin
      const mentorId = user?.role === 'MENTOR' ? user.id : (sessions[0]?.mentorId || 'usr_mentor_nitin');
      await api.requestSession({
        mentorId,
        title: sessionTitle,
        agenda: sessionAgenda,
        scheduledAt: new Date(sessionTime).toISOString(),
        durationMinutes: sessionDuration
      });
      showToast('success', 'Session Scheduled', 'Meeting room ready and invite sent.');
      setIsScheduleModalOpen(false);
      setSessionTitle('');
      setSessionAgenda('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Scheduling Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleSession || !newScheduleTime) return;

    setIsSubmitting(true);
    try {
      await api.rescheduleSession(rescheduleSession.id, new Date(newScheduleTime).toISOString());
      showToast('success', 'Session Rescheduled');
      setRescheduleSession(null);
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Reschedule Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeSessionData) return;

    setIsSubmitting(true);
    try {
      await api.completeSession(completeSessionData.id, sessionNotes);
      showToast('success', 'Session Completed! 🎉');
      setCompleteSessionData(null);
      setSessionNotes('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Completion Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateSessionData) return;

    setIsSubmitting(true);
    try {
      await api.submitSessionFeedback(rateSessionData.id, reviewComment, ratingVal);
      showToast('success', 'Review Submitted! Thank you for the feedback.');
      setRateSessionData(null);
      setReviewComment('');
      fetchSessions();
    } catch (err: any) {
      showToast('error', 'Review Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingSessions = sessions.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED');
  const pastSessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');
  const displayedSessions = activeTab === 'UPCOMING' ? upcomingSessions : pastSessions;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            1-on-1 Video Syncs & Code Reviews
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Schedule direct architectural reviews and debugging sessions over high-definition video.
          </p>
        </div>

        <Button onClick={() => setIsScheduleModalOpen(true)} leftIcon={<Plus size={16} />}>
          Schedule 1-on-1 Session
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as any)}
        tabs={[
          { id: 'UPCOMING', label: 'Upcoming Sessions', count: upcomingSessions.length, icon: <CalendarDays size={16} /> },
          { id: 'PAST', label: 'Past & Completed', count: pastSessions.length, icon: <CheckCircle2 size={16} /> }
        ]}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : displayedSessions.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title={activeTab === 'UPCOMING' ? 'No upcoming sessions' : 'No past sessions yet'}
          description={activeTab === 'UPCOMING' ? 'Schedule a 1-on-1 sync with your mentor to review system design or debug code.' : 'Completed meetings and feedback will be catalogued here.'}
          actionText={activeTab === 'UPCOMING' ? 'Schedule New Session' : undefined}
          onAction={activeTab === 'UPCOMING' ? () => setIsScheduleModalOpen(true) : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedSessions.map((s) => {
            const isStudent = user?.role === 'STUDENT';
            const partner = isStudent ? s.mentor : s.student;
            const partnerRole = isStudent ? 'Mentor' : 'Student';
            const mentorCompany = s.mentor?.company;

            return (
              <Card key={s.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={partner?.fullName || 'Partner'} src={partner?.avatarUrl} size="md" isVerified={partnerRole === 'Mentor'} />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {partnerRole}: <strong>{partner?.fullName}</strong> {isStudent && mentorCompany ? `(${mentorCompany})` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={s.status === 'COMPLETED' ? 'completed' : s.status === 'CONFIRMED' ? 'success' : 'pending'}>
                      {s.status}
                    </Badge>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {s.agenda}
                </p>

                {/* Schedule Info Box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flexWrap: 'wrap', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <Calendar size={15} color="var(--primary)" />
                    <span>{new Date(s.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
                    <Clock size={15} color="var(--primary)" />
                    <span>{new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.durationMinutes} mins)</span>
                  </div>
                </div>

                {/* Session Notes if completed */}
                {s.sessionNotes && (
                  <div style={{ backgroundColor: 'var(--bg-body)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.84rem' }}>
                    <strong>Session Wrap-Up Notes:</strong> {s.sessionNotes}
                  </div>
                )}

                {/* Student review rating if available */}
                {s.studentRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 600 }}>Student Rating:</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} color="#F59E0B" fill={star <= s.studentRating! ? '#F59E0B' : 'transparent'} />
                      ))}
                    </div>
                    {s.studentFeedback && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '6px' }}>"{s.studentFeedback}"</span>}
                  </div>
                )}

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', flexWrap: 'wrap' }}>
                  {s.status !== 'COMPLETED' && s.status !== 'CANCELLED' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRescheduleSession(s);
                          setNewScheduleTime('');
                        }}
                      >
                        Reschedule
                      </Button>

                      {user?.role === 'MENTOR' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setCompleteSessionData(s);
                            setSessionNotes('');
                          }}
                        >
                          Mark as Completed
                        </Button>
                      )}

                      {s.meetingUrl && (
                        <a href={s.meetingUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="success" leftIcon={<Video size={14} />}>
                            Join Video Call
                          </Button>
                        </a>
                      )}
                    </>
                  )}

                  {s.status === 'COMPLETED' && isStudent && !s.studentRating && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setRateSessionData(s);
                        setRatingVal(5);
                        setReviewComment('');
                      }}
                      leftIcon={<Star size={14} />}
                    >
                      Rate & Review Session
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule Session */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule 1-on-1 Video Session">
        <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Session Title" placeholder="e.g. Architecture Review: Raft Consensus Engine" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} required />
          <Textarea label="Agenda & Discussion Topics" placeholder="List the specific components, PRs, or bugs to review..." value={sessionAgenda} onChange={(e) => setSessionAgenda(e.target.value)} rows={3} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Date & Time" type="datetime-local" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required />
            <Input label="Duration (Minutes)" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))} min={15} max={120} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Video size={14} />}>Confirm & Create Room</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reschedule */}
      <Modal isOpen={!!rescheduleSession} onClose={() => setRescheduleSession(null)} title="Reschedule Session">
        <form onSubmit={handleReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Choose a new date and time for: <strong>{rescheduleSession?.title}</strong>
          </p>
          <Input label="New Date & Time" type="datetime-local" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setRescheduleSession(null)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Update Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Complete Session */}
      <Modal isOpen={!!completeSessionData} onClose={() => setCompleteSessionData(null)} title="Mark Session as Completed">
        <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Summarize the key outcomes or next action items for the student.
          </p>
          <Textarea label="Mentoring Notes & Next Steps" placeholder="Discussed worker crash failover, assigned Milestone 2 task..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} rows={4} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setCompleteSessionData(null)}>Cancel</Button>
            <Button type="submit" variant="success" isLoading={isSubmitting}>Save & Mark Completed</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Rate & Review */}
      <Modal isOpen={!!rateSessionData} onClose={() => setRateSessionData(null)} title="Rate Your Mentoring Session">
        <form onSubmit={handleRate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
              How helpful was this session?
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star size={24} color="#F59E0B" fill={star <= ratingVal ? '#F59E0B' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Review & Public Feedback" placeholder="Explain what made the session valuable..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setRateSessionData(null)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Submit Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
