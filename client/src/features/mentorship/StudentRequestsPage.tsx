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
  Send,
  ArrowRight
} from 'lucide-react';

interface StudentRequestsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const StudentRequestsPage: React.FC<StudentRequestsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReqForInfo, setSelectedReqForInfo] = useState<MentorshipRequest | null>(null);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudentRequests();
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

  const handleProvideInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForInfo || !additionalMessage.trim()) return;

    setIsSubmittingInfo(true);
    try {
      await api.provideAdditionalRequestInfo(selectedReqForInfo.id, additionalMessage);
      showToast('success', 'Details Sent', 'The mentor has been notified with your updated information.');
      setSelectedReqForInfo(null);
      setAdditionalMessage('');
      fetchRequests();
    } catch (err: any) {
      showToast('error', 'Failed to send details', err.message);
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="accepted">Accepted 🎉</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Declined</Badge>;
      case 'INFO_REQUESTED':
        return <Badge variant="warning">Info Requested</Badge>;
      case 'INFO_PROVIDED':
        return <Badge variant="info">Info Provided • Under Review</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="pending">Awaiting Review</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          My Mentorship Proposals
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Track the review status of your project mentorship inquiries.
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
          title="No mentorship proposals yet"
          description="Browse through verified industry mentors and propose your project idea."
          actionText="Find a Mentor →"
          onAction={() => onNavigate('find-mentor')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map(req => (
            <Card key={req.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={req.mentor?.fullName || 'Mentor'} src={req.mentor?.avatarUrl} size="md" isVerified={true} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {req.projectTitle}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Mentor: <strong>{req.mentor?.fullName}</strong> ({req.mentor?.title || 'Mentor'} @ {req.mentor?.company || ''})
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusBadge(req.status)}
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {req.projectDescription}
              </div>

              {/* Mentor Notes / Feedback if requested info */}
              {req.mentorNotes && (
                <div style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning-border)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--warning-text)' }}>
                  <strong>Mentor Note:</strong> {req.mentorNotes}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {req.status === 'ACCEPTED' && (
                  <Button size="sm" onClick={() => onNavigate('student-project')} rightIcon={<ArrowRight size={14} />}>
                    Open Project Workspace
                  </Button>
                )}

                {req.status === 'INFO_REQUESTED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedReqForInfo(req);
                      setAdditionalMessage('');
                    }}
                    leftIcon={<Send size={14} />}
                  >
                    Provide Requested Details
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for providing additional information */}
      <Modal
        isOpen={!!selectedReqForInfo}
        onClose={() => setSelectedReqForInfo(null)}
        title="Provide Project Clarifications"
        subtitle={`Reply to ${selectedReqForInfo?.mentor?.fullName}'s inquiry`}
      >
        <form onSubmit={handleProvideInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: 'var(--warning-light)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--warning-text)' }}>
            <strong>Mentor Note:</strong> {selectedReqForInfo?.mentorNotes}
          </div>

          <Textarea
            label="Your Clarification / Updated Details"
            placeholder="Explain the details or specific choices the mentor inquired about..."
            value={additionalMessage}
            onChange={(e) => setAdditionalMessage(e.target.value)}
            rows={4}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setSelectedReqForInfo(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingInfo} rightIcon={<Send size={14} />}>
              Submit to Mentor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
