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
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  FolderKanban,
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
      showToast('success', 'Details Sent', 'The mentor has been notified with your updated details.');
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
        return <Badge variant="warning">Mentor Requested Info</Badge>;
      case 'INFO_PROVIDED':
        return <Badge variant="info">Info Provided • Under Review</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="pending">Awaiting Mentor Review</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          My Mentorship Requests
        </h1>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Track the status of your project mentorship proposals.
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No mentorship requests yet"
          description="Browse through industry mentors and propose your project idea."
          actionText="Find a Mentor →"
          onAction={() => onNavigate('find-mentor')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map(req => (
            <Card key={req.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Avatar name={req.mentor?.fullName || 'Mentor'} src={req.mentor?.avatarUrl} size="md" isVerified={true} />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {req.projectTitle}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Mentor: <strong>{req.mentor?.fullName}</strong> ({req.mentor?.title || 'Mentor'} @ {req.mentor?.company || ''})
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getStatusBadge(req.status)}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {req.projectDescription}
              </div>

              {/* Mentor Notes / Feedback if requested info */}
              {req.mentorNotes && (
                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.86rem', color: '#92400E' }}>
                  <strong>Mentor Note:</strong> {req.mentorNotes}
                </div>
              )}

              {/* Actions depending on status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                {req.status === 'ACCEPTED' && (
                  <Button onClick={() => onNavigate('student-project')} rightIcon={<ArrowRight size={16} />}>
                    Open Project Workspace
                  </Button>
                )}

                {req.status === 'INFO_REQUESTED' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedReqForInfo(req);
                      setAdditionalMessage('');
                    }}
                    leftIcon={<Send size={16} />}
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
        title="Provide Additional Project Details"
        subtitle={`Reply to ${selectedReqForInfo?.mentor?.fullName}'s request`}
      >
        <form onSubmit={handleProvideInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFFBEB', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: '#92400E' }}>
            <strong>Mentor's Note:</strong> {selectedReqForInfo?.mentorNotes}
          </div>

          <Textarea
            label="Your Clarification / Details"
            placeholder="e.g. For Raft consensus, I plan to use the hashicorp/raft library or write a clean state machine in pure Go channels..."
            value={additionalMessage}
            onChange={(e) => setAdditionalMessage(e.target.value)}
            rows={5}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setSelectedReqForInfo(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingInfo} rightIcon={<Send size={16} />}>
              Submit Details to Mentor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
