import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { MentorProfile, User } from '../../../../shared/types.js';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';

interface MentorshipRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: (MentorProfile & { user: User }) | null;
  onSuccess?: () => void;
}

export const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({
  isOpen,
  onClose,
  mentor,
  onSuccess
}) => {
  const { showToast } = useToast();

  const [projectTitle, setProjectTitle] = useState('Distributed Fault-Tolerant Task Queue in Go');
  const [projectDescription, setProjectDescription] = useState('Building a high-throughput distributed task scheduler in Go with Raft consensus, worker health heartbeats, and exponential backoff.');
  const [currentKnowledge, setCurrentKnowledge] = useState('Intermediate Go, C++, Linux primitives, Basic Concurrency');
  const [techKnown, setTechKnown] = useState<string[]>(['Go', 'C++', 'Linux', 'Docker']);
  const [helpNeeded, setHelpNeeded] = useState<string[]>([
    'Architecture Design',
    'Concurrency Primitives & Channel Leaks',
    'Worker Crash Failover Strategy'
  ]);
  const [expectedOutcome, setExpectedOutcome] = useState('Production-grade GitHub repo with benchmarks and deep distributed systems understanding');
  const [preferredTimes, setPreferredTimes] = useState('Weekends 10 AM - 2 PM IST & Tuesday/Thursday evenings');
  const [additionalMessage, setAdditionalMessage] = useState('Excited to learn systems architecture and best practices from your experience!');
  const [isLoading, setIsLoading] = useState(false);

  if (!mentor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectDescription) {
      showToast('warning', 'Missing Information', 'Please provide a project title and description.');
      return;
    }

    setIsLoading(true);
    try {
      await api.createMentorshipRequest({
        mentorId: mentor.userId,
        projectTitle,
        projectDescription,
        currentKnowledge,
        techKnown,
        helpNeeded,
        expectedOutcome,
        preferredTimes,
        additionalMessage
      });

      showToast('success', 'Request Sent! 🎉', `Your mentorship proposal was dispatched to ${mentor.user.fullName}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHelpArea = (area: string) => {
    setHelpNeeded(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Mentorship from ${mentor.user.fullName}`}
      subtitle={`${mentor.title} @ ${mentor.company}`}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Mentors review your project proposal before accepting. Provide specific details to increase match probability.
        </div>

        <Input
          label="Project Title"
          placeholder="e.g. Distributed Fault-Tolerant Task Queue in Go"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          required
        />

        <Textarea
          label="Project Description & Vision"
          placeholder="Explain what the project does, key features, and your intended architecture..."
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          rows={4}
          required
        />

        <Input
          label="What Technologies Do You Currently Know?"
          placeholder="e.g. Go, C++, Linux, Docker (comma separated)"
          value={currentKnowledge}
          onChange={(e) => {
            setCurrentKnowledge(e.target.value);
            setTechKnown(e.target.value.split(',').map(s => s.trim()).filter(Boolean));
          }}
        />

        <div>
          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
            What Areas Do You Need Guidance On?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              'Architecture Design',
              'Concurrency Primitives & Channel Leaks',
              'Worker Crash Failover Strategy',
              'Database Schema & Indexing',
              '1-on-1 Code Reviews',
              'Load Testing & Benchmarking'
            ].map(area => {
              const isSelected = helpNeeded.includes(area);
              return (
                <div
                  key={area}
                  onClick={() => toggleHelpArea(area)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: 'var(--primary)' }}>{isSelected ? '✓' : '•'}</span>
                  <span>{area}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Input
          label="Expected Project Outcome"
          placeholder="e.g. Deployed system, published research paper, open-source release"
          value={expectedOutcome}
          onChange={(e) => setExpectedOutcome(e.target.value)}
        />

        <Input
          label="Preferred Meeting Schedule"
          placeholder="e.g. Weekends 10 AM - 2 PM IST & Tuesday/Thursday evenings"
          value={preferredTimes}
          onChange={(e) => setPreferredTimes(e.target.value)}
          required
        />

        <Textarea
          label="Personal Note to Mentor"
          placeholder="Introduce yourself and why you chose this mentor..."
          value={additionalMessage}
          onChange={(e) => setAdditionalMessage(e.target.value)}
          rows={3}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} rightIcon={<Send size={16} />}>
            Send Mentorship Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
