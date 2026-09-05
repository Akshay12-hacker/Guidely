import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { MentorProfile, User } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal.js';
import {
  Star,
  GraduationCap,
  Users,
  Briefcase,
  Clock,
  Send,
  CheckCircle2,
  ArrowLeft,
  Camera,
  Award
} from 'lucide-react';
import { ProfilePhotoModal } from '../../components/ui/ProfilePhotoModal.js';

interface MentorProfilePageProps {
  mentorId?: string;
  onNavigate: (route: string, params?: any) => void;
}

export const MentorProfilePage: React.FC<MentorProfilePageProps> = ({ mentorId, onNavigate }) => {
  const { user } = useAuth();
  const targetId = mentorId || user?.id || '';

  const [detail, setDetail] = useState<{
    mentor: MentorProfile & { user: User };
    reviews: any[];
    studentsHelped: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    if (!targetId) {
      setIsLoading(false);
      return;
    }
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px', margin: '0 auto' }}>
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
          Back to Mentors
        </Button>
      </div>
    );
  }

  const { mentor, reviews = [] } = detail;
  const isOwnProfile = user?.id === mentor.userId;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
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
          fontSize: '0.84rem',
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        <ArrowLeft size={15} /> Back to Mentors
      </button>

      {/* Profile Header Banner */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                name={mentor.user.fullName}
                src={mentor.user.avatarUrl}
                size="xl"
                isVerified={mentor.isVerified}
                isOnline={true}
              />
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  title="Update photo on Cloudinary"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: '24px',
                    height: '24px',
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
                  <Camera size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {mentor.user.fullName}
                </h1>
                {mentor.isVerified && (
                  <Badge variant="verified">Verified Mentor</Badge>
                )}
              </div>

              <p style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
                {mentor.title} @ {mentor.company}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GraduationCap size={15} /> {mentor.college}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={15} /> {mentor.yearsExperience}+ Years Exp
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--text-main)' }}>
                  <Star size={15} color="#F59E0B" fill="#F59E0B" /> {mentor.rating.toFixed(1)} ({mentor.reviewsCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {isOwnProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPhotoModalOpen(true)}
              leftIcon={<Camera size={15} />}
            >
              Update Photo
            </Button>
          ) : user?.role === 'STUDENT' ? (
            <Button size="md" onClick={() => setIsRequestModalOpen(true)} rightIcon={<Send size={16} />}>
              Request Mentorship
            </Button>
          ) : null}
        </div>
      </Card>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }} className="profile-grid-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* About Section */}
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>About the Mentor</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {mentor.bio}
            </p>
          </Card>

          {/* Engineering Experience & Highlights */}
          {((mentor.experienceHighlights && mentor.experienceHighlights.length > 0) || mentor.projectsExperience) && (
            <Card padding="lg">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--primary)" /> Engineering Highlights & Notable Systems
              </h3>
              {mentor.experienceHighlights && mentor.experienceHighlights.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: mentor.projectsExperience ? '12px' : '0' }}>
                  {mentor.experienceHighlights.map((hl, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FCD34D',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      <Award size={12} color="#D97706" /> {hl}
                    </span>
                  ))}
                </div>
              )}
              {mentor.projectsExperience && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                  {mentor.projectsExperience}
                </p>
              )}
            </Card>
          )}

          {/* Mentoring Topics */}
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Mentoring Specializations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {mentor.mentoringTopics.map((topic, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={15} color="var(--primary)" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews Section */}
          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Reviews</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Verified project feedback
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1rem', fontWeight: 800 }}>
                <Star size={18} color="#F59E0B" fill="#F59E0B" />
                <span>{mentor.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No student reviews yet. Be the first to build a project with {mentor.user.fullName}!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={rev.student_name} src={rev.student_avatar} size="xs" />
                        <div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {rev.student_name}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({rev.student_college || 'Student'})
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={13} color="#F59E0B" fill={s <= rev.rating ? '#F59E0B' : 'transparent'} />
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>

                    {rev.project_title && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>
                        Project: {rev.project_title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card padding="md">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--primary)" /> Availability
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {mentor.availabilitySchedule}
            </p>
          </Card>

          <Card padding="md">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Skills & Expertise</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
              {mentor.skills.map(s => (
                <Badge key={s} variant="neutral" size="sm">{s}</Badge>
              ))}
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Technologies</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {mentor.technologies.map(t => (
                <Badge key={t} variant="primary" size="sm">{t}</Badge>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--primary)" /> Students Guided ({mentor.studentsHelpedCount})
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoUpdated={(newUrl) => {
          setDetail(prev => prev ? {
            ...prev,
            mentor: {
              ...prev.mentor,
              user: {
                ...prev.mentor.user,
                avatarUrl: newUrl
              }
            }
          } : null);
        }}
      />
    </div>
  );
};
