import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { MentorProfile, User, Review } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal.js';
import {
  Star,
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  Briefcase,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Calendar,
  ExternalLink,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface MentorProfilePageProps {
  mentorId?: string;
  onNavigate: (route: string, params?: any) => void;
}

export const MentorProfilePage: React.FC<MentorProfilePageProps> = ({ mentorId, onNavigate }) => {
  const { user } = useAuth();
  const targetId = mentorId || user?.id || 'usr_mentor_priya';

  const [detail, setDetail] = useState<{
    mentor: MentorProfile & { user: User };
    reviews: any[];
    studentsHelped: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.getMentorDetail(targetId);
        setDetail(res);
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [targetId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>Mentor profile not found</h3>
        <Button onClick={() => onNavigate('find-mentor')} style={{ marginTop: '16px' }}>
          Back to Mentor Discovery
        </Button>
      </div>
    );
  }

  const { mentor, reviews = [], studentsHelped = [] } = detail;
  const isOwnProfile = user?.id === mentor.userId;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('find-mentor')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        <ArrowLeft size={16} /> Back to Mentors
      </button>

      {/* Profile Header Banner Card */}
      <Card padding="lg" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <Avatar
              name={mentor.user.fullName}
              src={mentor.user.avatarUrl}
              size="xl"
              isVerified={mentor.isVerified}
              isOnline={true}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {mentor.user.fullName}
                </h1>
                {mentor.isVerified && (
                  <Badge variant="verified">Verified Industry Mentor</Badge>
                )}
              </div>

              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
                {mentor.title} @ {mentor.company}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <GraduationCap size={16} /> {mentor.college}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Briefcase size={16} /> {mentor.yearsExperience}+ Years Experience
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: 'var(--text-main)' }}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" /> {mentor.rating.toFixed(1)} ({mentor.reviewsCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {!isOwnProfile && user?.role === 'STUDENT' && (
            <Button size="lg" onClick={() => setIsRequestModalOpen(true)} rightIcon={<Send size={18} />}>
              Request Mentorship
            </Button>
          )}
        </div>
      </Card>

      {/* Grid Layout: Left Column (About, Topics, Reviews) + Right Column (Sidebar) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="profile-grid-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* About Section */}
          <Card padding="lg">
            <h3 style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: '12px' }}>About the Mentor</h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {mentor.bio}
            </p>
          </Card>

          {/* Mentoring Topics */}
          <Card padding="lg">
            <h3 style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: '14px' }}>Mentoring Topics & Specializations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {mentor.mentoringTopics.map((topic, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Verified Reviews Section */}
          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 700 }}>Student Reviews & Feedback</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Verified project mentorship feedback
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 800 }}>
                <Star size={20} color="#F59E0B" fill="#F59E0B" />
                <span>{mentor.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No student reviews yet. Be the first to build a project with {mentor.user.fullName}!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={rev.student_name} src={rev.student_avatar} size="xs" />
                        <div>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {rev.student_name}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({rev.student_college || 'Student'})
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} color="#F59E0B" fill={s <= rev.rating ? '#F59E0B' : 'transparent'} />
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>

                    {rev.project_title && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600 }}>
                        Project: {rev.project_title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Availability */}
          <Card padding="md">
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={17} color="var(--primary)" /> Availability
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {mentor.availabilitySchedule}
            </p>
          </Card>

          {/* Skills & Technologies */}
          <Card padding="md">
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '10px' }}>Skills & Expertise</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {mentor.skills.map(s => (
                <Badge key={s} variant="neutral" size="sm">{s}</Badge>
              ))}
            </div>

            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '10px' }}>Technologies</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {mentor.technologies.map(t => (
                <Badge key={t} variant="primary" size="sm">{t}</Badge>
              ))}
            </div>
          </Card>

          {/* Students Helped */}
          <Card padding="md">
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={17} color="var(--primary)" /> Students Guided ({mentor.studentsHelpedCount})
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Actively guiding students on production-level capstone and research architectures.
            </p>
          </Card>
        </div>
      </div>

      <MentorshipRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        mentor={mentor}
        onSuccess={() => onNavigate('student-requests')}
      />
    </div>
  );
};
