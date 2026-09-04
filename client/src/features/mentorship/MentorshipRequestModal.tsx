import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { MentorProfile, User } from '../../../../shared/types.js';
import { HELP_NEEDED_AREAS, NO_IDEA_HELP } from '../../constants/skills.js';
import { Send, HelpCircle } from 'lucide-react';

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

      showToast('success', 'Proposal Dispatched', `Your mentorship proposal was sent to ${mentor.user.fullName}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHelpArea = (area: string) => {
    setHelpNeeded(prev => {
      if (area === NO_IDEA_HELP) {
        return prev.includes(NO_IDEA_HELP) ? [] : [NO_IDEA_HELP];
      } else {
        const withoutNoIdea = prev.filter(a => a !== NO_IDEA_HELP);
        return withoutNoIdea.includes(area)
          ? withoutNoIdea.filter(a => a !== area)
          : [...withoutNoIdea, area];
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Mentorship from ${mentor.user.fullName}`}
      subtitle={`${mentor.title} @ ${mentor.company}`}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Mentors evaluate technical proposals before accepting. Provide specific details to increase alignment.
        </div>

        <Input
          label="Project Title"
          placeholder="e.g. Distributed Fault-Tolerant Task Queue in Go"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          required
        />

        <Textarea
          label="Project Description & Architecture Vision"
          placeholder="Explain what the system does, primary components, and target requirements..."
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Areas Where Guidance Is Most Needed
            </label>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Select specific topics or "No idea"
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
            {HELP_NEEDED_AREAS.map(area => {
              const isSelected = helpNeeded.includes(area);
              const isNoIdea = area === NO_IDEA_HELP;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleHelpArea(area)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected
                      ? 'var(--primary-light)'
                      : isNoIdea
                      ? 'var(--bg-subtle)'
                      : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : isNoIdea ? 600 : 500,
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left',
                    gridColumn: isNoIdea ? '1 / -1' : undefined
                  }}
                >
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{isSelected ? '✓' : '•'}</span>
                  <span>{area}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Expected Project Outcome"
          placeholder="e.g. Deployed system, published paper, open-source release"
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} rightIcon={<Send size={15} />}>
            Send Proposal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
