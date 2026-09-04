import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { MentorshipRequest } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Modal } from '../../components/ui/Modal.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface MentorRequestsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MentorRequestsPage: React.FC<MentorRequestsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<{
    request: MentorshipRequest;
    action: 'ACCEPT' | 'REJECT' | 'REQUEST_INFO';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMentorRequests();
      setRequests(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    setIsSubmitting(true);
    try {
      await api.respondToRequest(activeModal.request.id, activeModal.action, notes);
      const actionMsg = activeModal.action === 'ACCEPT'
        ? 'Proposal accepted! Project workspace initialized.'
        : activeModal.action === 'REJECT'
        ? 'Request declined.'
        : 'Information requested from student.';
      showToast('success', 'Response Recorded', actionMsg);
      setActiveModal(null);
      setNotes('');
      fetchRequests();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Mentorship Proposals & Inquiries
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Review student project ideas and accept mentorship engagements.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No pending proposals"
          description="You are all caught up! New student project proposals will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map(req => (
            <Card key={req.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={req.student?.fullName || 'Student'} src={req.student?.avatarUrl} size="md" />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {req.projectTitle}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Proposed by: <strong>{req.student?.fullName}</strong> • {req.student?.degree || 'Student'} ({req.student?.college})
                    </p>
                  </div>
                </div>

                <Badge variant={req.status === 'ACCEPTED' ? 'accepted' : req.status === 'REJECTED' ? 'danger' : 'pending'}>
                  {req.status}
                </Badge>
              </div>

              {/* Description */}
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
                <strong>Project Proposal:</strong> {req.projectDescription}
              </div>

              {/* Key Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Tech Known</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {req.techKnown.map(t => <Badge key={t} variant="neutral" size="sm">{t}</Badge>)}
                  </div>
                </div>

                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Help Needed In</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {req.helpNeeded.map(h => <Badge key={h} variant="warning" size="sm">{h}</Badge>)}
                  </div>
                </div>

                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>Schedule</span>
                  <p style={{ marginTop: '4px', color: 'var(--text-main)', fontWeight: 500 }}>{req.preferredTimes}</p>
                </div>
              </div>

              {/* Additional message if present */}
              {req.additionalMessage && (
                <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#075985' }}>
                  <strong>Student Clarification:</strong> "{req.additionalMessage}"
                </div>
              )}

              {/* Action Buttons for Pending or Info Provided */}
              {(req.status === 'PENDING' || req.status === 'INFO_PROVIDED' || req.status === 'INFO_REQUESTED') && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveModal({ request: req, action: 'REJECT' });
                      setNotes('');
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setActiveModal({ request: req, action: 'REQUEST_INFO' });
                      setNotes('');
                    }}
                  >
                    Request Info
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setActiveModal({ request: req, action: 'ACCEPT' });
                      setNotes('Excited to collaborate with you on this project!');
                    }}
                    leftIcon={<CheckCircle2 size={15} />}
                  >
                    Accept Proposal
                  </Button>
                </div>
              )}

              {req.status === 'ACCEPTED' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <Button size="sm" onClick={() => onNavigate('mentor-students')} rightIcon={<ArrowRight size={14} />}>
                    View Active Student Projects
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Response Confirmation Modal */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal?.action === 'ACCEPT'
            ? 'Accept Mentorship Proposal'
            : activeModal?.action === 'REJECT'
            ? 'Decline Proposal'
            : 'Request Additional Information'
        }
      >
        <form onSubmit={handleRespond} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {activeModal?.action === 'ACCEPT'
              ? 'Accepting will provision a shared Project Workspace and start a direct conversation with the student.'
              : activeModal?.action === 'REJECT'
              ? 'Please provide constructive feedback or a brief reason for declining.'
              : 'Specify what details or clarifications you need from the student.'}
          </p>

          <Textarea
            label={activeModal?.action === 'ACCEPT' ? 'Welcome Note to Student' : 'Feedback / Inquiry Details'}
            placeholder="Write your note here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            required={activeModal?.action !== 'ACCEPT'}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={activeModal?.action === 'ACCEPT' ? 'success' : activeModal?.action === 'REJECT' ? 'danger' : 'primary'}
              isLoading={isSubmitting}
            >
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
