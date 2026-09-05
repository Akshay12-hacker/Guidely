import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { MentorProfile, User } from '../../../../shared/types.js';
import { HELP_NEEDED_AREAS, NO_IDEA_HELP } from '../../constants/skills.js';
import { Send, Star, Check, Sparkles, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';

interface MentorshipRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: (MentorProfile & { user: User }) | null;
  onSuccess?: () => void;
  zIndex?: number;
  initialValues?: {
    projectTitle?: string;
    projectDescription?: string;
    currentKnowledge?: string;
    techKnown?: string[];
    helpNeeded?: string[];
    expectedOutcome?: string;
    preferredTimes?: string;
    additionalMessage?: string;
  };
}

export const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({
  isOpen,
  onClose,
  mentor,
  onSuccess,
  zIndex = 10050,
  initialValues
}) => {
  const { showToast } = useToast();

  const [projectTitle, setProjectTitle] = useState(initialValues?.projectTitle || '');
  const [projectDescription, setProjectDescription] = useState(initialValues?.projectDescription || '');
  const [currentKnowledge, setCurrentKnowledge] = useState(
    initialValues?.currentKnowledge ||
    (initialValues?.techKnown && initialValues.techKnown.length > 0 ? initialValues.techKnown.join(', ') : '')
  );
  const [techKnown, setTechKnown] = useState<string[]>(initialValues?.techKnown || []);
  const [helpNeeded, setHelpNeeded] = useState<string[]>(initialValues?.helpNeeded || []);
  const [expectedOutcome, setExpectedOutcome] = useState(initialValues?.expectedOutcome || '');
  const [preferredTimes, setPreferredTimes] = useState(initialValues?.preferredTimes || '');
  const [additionalMessage, setAdditionalMessage] = useState(initialValues?.additionalMessage || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setProjectTitle(initialValues?.projectTitle || '');
      setProjectDescription(initialValues?.projectDescription || '');
      setCurrentKnowledge(
        initialValues?.currentKnowledge ||
        (initialValues?.techKnown && initialValues.techKnown.length > 0 ? initialValues.techKnown.join(', ') : '')
      );
      setTechKnown(initialValues?.techKnown || []);
      setHelpNeeded(initialValues?.helpNeeded || []);
      setExpectedOutcome(initialValues?.expectedOutcome || '');
      setPreferredTimes(initialValues?.preferredTimes || '');
      setAdditionalMessage(initialValues?.additionalMessage || '');
    }
  }, [isOpen, initialValues]);

  if (!mentor) return null;

  const mentorName = mentor.user?.fullName || (mentor as any).fullName || (mentor as any).full_name || mentor.title || 'Mentor';
  const mentorAvatar = mentor.user?.avatarUrl || (mentor as any).avatarUrl || (mentor as any).avatar_url;
  const mentorRating = mentor.rating || (mentor as any).rating || 5.0;
  const reviewsCount = mentor.reviewsCount || (mentor as any).reviewsCount || (mentor as any).reviews_count || 12;
  const experienceYears = mentor.yearsExperience || (mentor as any).yearsExperience || (mentor as any).years_experience || 5;
  const studentsHelped = mentor.studentsHelpedCount || (mentor as any).studentsHelpedCount || (mentor as any).students_helped_count || 15;
  const mentorTech = mentor.technologies || (mentor as any).technologies || [];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectTitle.trim() || !projectDescription.trim()) {
      showToast('warning', 'Missing Information', 'Please provide a project title and description.');
      return;
    }

    setIsLoading(true);
    try {
      await api.createMentorshipRequest({
        mentorId: mentor.userId || (mentor as any).id,
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        currentKnowledge,
        techKnown,
        helpNeeded,
        expectedOutcome,
        preferredTimes,
        additionalMessage
      });

      showToast('success', 'Proposal Dispatched! 🚀', `Your mentorship proposal was sent to ${mentorName}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isAreaSelected = (area: string) => {
    return helpNeeded.some(h =>
      h.toLowerCase() === area.toLowerCase() ||
      (h.trim().length > 3 && (area.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(area.toLowerCase())))
    );
  };

  const toggleHelpArea = (area: string) => {
    setHelpNeeded(prev => {
      if (area === NO_IDEA_HELP) {
        return prev.includes(NO_IDEA_HELP) ? [] : [NO_IDEA_HELP];
      } else {
        const withoutNoIdea = prev.filter(a => a !== NO_IDEA_HELP);
        const currentlySelected = withoutNoIdea.some(h =>
          h.toLowerCase() === area.toLowerCase() ||
          (h.trim().length > 3 && (area.toLowerCase().includes(h.toLowerCase()) || h.toLowerCase().includes(area.toLowerCase())))
        );
        if (currentlySelected) {
          return withoutNoIdea.filter(a =>
            a.toLowerCase() !== area.toLowerCase() &&
            !(a.trim().length > 3 && (area.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(area.toLowerCase())))
          );
        } else {
          return [...withoutNoIdea, area];
        }
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Mentorship"
      subtitle={`Send a structured project proposal to ${mentorName}`}
      maxWidth="680px"
      zIndex={zIndex}
      footer={
        <div
          className="modal-footer-content"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '12px'
          }}
        >
          <div
            className="modal-footer-hint"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>Direct dispatch to mentor dashboard</span>
          </div>
          <div
            className="modal-footer-buttons"
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{ minWidth: '95px' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit()}
              isLoading={isLoading}
              rightIcon={<Send size={15} />}
              style={{ minWidth: '150px' }}
            >
              Send Proposal
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="mentorship-request-form"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '8px' }}
      >
        {/* PROPER MENTOR PROFILE CARD */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Avatar
                name={mentorName}
                src={mentorAvatar}
                size="lg"
                isVerified={true}
                isOnline={true}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {mentorName}
                  </h4>
                  <span
                    style={{
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldCheck size={12} /> Verified Mentor
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary, #4F46E5)', margin: '3px 0 0 0' }}>
                  {mentor.title} {mentor.company ? `@ ${mentor.company}` : ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748B', marginTop: '5px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700, color: '#0F172A' }}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
                    {Number(mentorRating).toFixed(1)}
                    <span style={{ fontWeight: 500, color: '#64748B' }}>({reviewsCount} reviews)</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={13} /> {experienceYears}+ yrs exp
                  </span>
                  <span>•</span>
                  <span>{studentsHelped} students guided</span>
                  {mentor.college && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <GraduationCap size={13} /> {mentor.college}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ alignSelf: 'flex-start' }}>
              <span
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  border: '1px solid #C7D2FE',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                Capstone Guidance
              </span>
            </div>
          </div>

          {/* Mentor Tech Stack Badges */}
          {mentorTech.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, marginRight: '4px' }}>
                Expertise:
              </span>
              {mentorTech.slice(0, 6).map((tech: string) => (
                <span
                  key={tech}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tip Box */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #BFDBFE',
            fontSize: '0.82rem',
            color: '#1E40AF',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
          <span>
            Mentors evaluate proposals for technical alignment. Be specific about your architecture goals and where you need 1-on-1 guidance.
          </span>
        </div>

        {/* Form Inputs */}
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
          rows={3}
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

        {/* Guidance Needed Areas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Areas Where Guidance Is Most Needed
            </label>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Select specific topics or "No idea"
            </span>
          </div>
          <div
            className="guidance-areas-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '6px',
              maxHeight: '190px',
              overflowY: 'auto',
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
            {HELP_NEEDED_AREAS.map(area => {
              const isSelected = isAreaSelected(area);
              const isNoIdea = area === NO_IDEA_HELP;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleHelpArea(area)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid var(--primary, #4F46E5)' : '1px solid #CBD5E1',
                    backgroundColor: isSelected
                      ? '#EEF2FF'
                      : isNoIdea
                      ? '#F1F5F9'
                      : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : isNoIdea ? 600 : 500,
                    color: isSelected ? '#4F46E5' : '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    gridColumn: isNoIdea ? '1 / -1' : undefined,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: isSelected ? '1.5px solid #4F46E5' : '1.5px solid #94A3B8',
                      backgroundColor: isSelected ? '#4F46E5' : 'transparent',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span style={{ lineHeight: 1.3 }}>{area}</span>
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
          rows={2}
        />
      </form>
    </Modal>
  );
};
