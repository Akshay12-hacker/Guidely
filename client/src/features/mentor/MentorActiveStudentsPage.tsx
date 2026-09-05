import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Input } from '../../components/ui/Input.js';
import {
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  MessageSquare,
  ArrowRight,
  Search,
  ExternalLink,
  Layers,
  Filter
} from 'lucide-react';

interface MentorActiveStudentsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MentorActiveStudentsPage: React.FC<MentorActiveStudentsPageProps> = ({ onNavigate }) => {
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [incomingRequestsCount, setIncomingRequestsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'HIGH_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.getMentorActiveStudents();
        setActiveProjects(res.activeProjects || []);
        setIncomingRequestsCount(res.incomingRequestsCount || 0);
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute available technologies across projects
  const allTechnologies = useMemo(() => {
    const set = new Set<string>();
    activeProjects.forEach(p => {
      const techs = p.targetTechnologies || p.target_technologies || [];
      if (Array.isArray(techs)) {
        techs.forEach((t: string) => set.add(t));
      }
    });
    return Array.from(set);
  }, [activeProjects]);

  // Filter projects by search, status, and technology
  const filteredProjects = useMemo(() => {
    return activeProjects.filter(p => {
      const studentName = (p.student_name || '').toLowerCase();
      const studentCollege = (p.student_college || '').toLowerCase();
      const projectTitle = (p.title || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch = !q ||
        studentName.includes(q) ||
        studentCollege.includes(q) ||
        projectTitle.includes(q) ||
        description.includes(q);

      if (!matchesSearch) return false;

      const progress = p.progressPercentage ?? p.progress_percentage ?? 0;
      if (statusFilter === 'IN_PROGRESS' && p.status === 'COMPLETED') return false;
      if (statusFilter === 'COMPLETED' && p.status !== 'COMPLETED') return false;
      if (statusFilter === 'HIGH_PROGRESS' && progress < 70) return false;

      if (selectedTech) {
        const techs: string[] = p.targetTechnologies || p.target_technologies || [];
        if (!techs.some(t => t.toLowerCase() === selectedTech.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [activeProjects, searchQuery, statusFilter, selectedTech]);

  // Aggregate metrics
  const totalStudents = activeProjects.length;
  const avgProgress = totalStudents > 0
    ? Math.round(activeProjects.reduce((acc, p) => acc + (p.progressPercentage ?? p.progress_percentage ?? 0), 0) / totalStudents)
    : 0;
  const completedProjectsCount = activeProjects.filter(p => p.status === 'COMPLETED').length;
  const inProgressCount = totalStudents - completedProjectsCount;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              Active Students
            </h1>
            <Badge variant="primary" size="md">{totalStudents} Total Mentees</Badge>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Monitor your students' capstone journey, review engineering deliverables, and jump straight into project workspaces.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigate('mentor-requests')} leftIcon={<BookOpen size={15} />}>
            Proposals Queue {incomingRequestsCount > 0 ? `(${incomingRequestsCount})` : ''}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('mentor-sessions')} leftIcon={<Calendar size={15} />}>
            Schedule Sync
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('messages')} leftIcon={<MessageSquare size={15} />}>
            Messages
          </Button>
        </div>
      </div>

      {/* Proposals Waiting Banner */}
      {incomingRequestsCount > 0 && (
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1.5px solid var(--primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.3rem' }}>📬</span>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                {incomingRequestsCount} Pending Student Proposal{incomingRequestsCount > 1 ? 's' : ''} Awaiting Review
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--primary)', margin: 0 }}>
                Accept new proposals to expand your active student cohort and create collaborative capstone workspaces.
              </p>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={() => onNavigate('mentor-requests')} rightIcon={<ArrowRight size={14} />}>
            Review Proposals
          </Button>
        </div>
      )}

      {/* Cohort KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Active Cohort"
          value={totalStudents}
          icon={<Users size={18} />}
          changeText={totalStudents > 0 ? `${inProgressCount} in progress` : "No active students"}
        />
        <StatCard
          label="Average Progress"
          value={`${avgProgress}%`}
          icon={<Layers size={18} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          changeText="Cohort Milestone Completion"
        />
        <StatCard
          label="Projects In Progress"
          value={inProgressCount}
          icon={<Clock size={18} />}
          iconBg="#FFFBEB"
          iconColor="#D97706"
        />
        <StatCard
          label="Completed Capstones"
          value={completedProjectsCount}
          icon={<CheckCircle2 size={18} />}
          iconBg="var(--success-light)"
          iconColor="var(--success-dark)"
        />
      </div>

      {/* Search & Filter Controls */}
      <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search by student name, college, or project title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
              Status:
            </span>
            <Button
              size="sm"
              variant={statusFilter === 'ALL' ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({totalStudents})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'IN_PROGRESS' ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter('IN_PROGRESS')}
            >
              In Progress ({inProgressCount})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'HIGH_PROGRESS' ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter('HIGH_PROGRESS')}
            >
              High Progress (&gt;70%)
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'COMPLETED' ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter('COMPLETED')}
            >
              Completed ({completedProjectsCount})
            </Button>
          </div>
        </div>

        {/* Tech Stack Chips */}
        {allTechnologies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
              Technologies:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTech(null)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: !selectedTech ? 700 : 500,
                backgroundColor: !selectedTech ? 'var(--primary)' : 'var(--bg-subtle)',
                color: !selectedTech ? '#FFFFFF' : 'var(--text-main)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              All Tech
            </button>
            {allTechnologies.map(tech => {
              const isSel = selectedTech === tech;
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setSelectedTech(isSel ? null : tech)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: isSel ? 700 : 500,
                    backgroundColor: isSel ? 'var(--primary-light)' : '#FFFFFF',
                    color: isSel ? 'var(--primary)' : 'var(--text-main)',
                    border: isSel ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  {tech}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Students List or Empty State */}
      {filteredProjects.length === 0 ? (
        <Card padding="lg" style={{ textAlign: 'center' }}>
          {totalStudents === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="No Active Students Yet"
              description="You haven't accepted any student project proposals yet. Review incoming proposals or share your mentor profile to start mentoring students."
              actionText="Check Proposals Queue"
              onAction={() => onNavigate('mentor-requests')}
              actionIcon={<ArrowRight size={15} />}
            />
          ) : (
            <EmptyState
              icon={<Filter size={32} />}
              title="No matching students found"
              description={`No students matched "${searchQuery}" with the selected filters.`}
              actionText="Reset All Filters"
              onAction={() => { setSearchQuery(''); setStatusFilter('ALL'); setSelectedTech(null); }}
            />
          )}
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((p: any) => {
            const progress = p.progressPercentage ?? p.progress_percentage ?? 0;
            const techs: string[] = p.targetTechnologies || p.target_technologies || [];
            const milestones = p.milestones || [];
            const completedM = Array.isArray(milestones) ? milestones.filter((m: any) => m.status === 'COMPLETED').length : 0;
            const totalM = Array.isArray(milestones) ? milestones.length : 0;

            return (
              <Card
                key={p.id}
                padding="lg"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Student Bio Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={p.student_name} src={p.student_avatar} size="md" />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                        {p.student_name}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {p.student_college || 'Engineering Student'} {p.student_degree ? `• ${p.student_degree}` : ''}
                      </p>
                    </div>
                  </div>

                  <Badge variant={p.status === 'COMPLETED' ? 'success' : 'in_progress'} size="sm">
                    {p.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                {/* Project Header & Category */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.04em' }}>
                      {p.category || 'Capstone Project'}
                    </span>
                    {p.currentStage && (
                      <>
                        <span style={{ color: 'var(--text-subtle)' }}>•</span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {p.currentStage}
                        </span>
                      </>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35, marginBottom: '6px' }}>
                    {p.title}
                  </h4>
                  <p style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {p.description || 'PBL capstone collaborative engineering project.'}
                  </p>
                </div>

                {/* Tech Stack Pills */}
                {techs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {techs.slice(0, 4).map(t => (
                      <span
                        key={t}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: 'var(--text-main)'
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    {techs.length > 4 && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>
                        +{techs.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Progress & Milestone Counter */}
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Capstone Completion
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar value={progress} size="sm" />

                  {totalM > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Milestones: {completedM} of {totalM} reached</span>
                      <span>Stage: {p.currentStage || 'Active'}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onNavigate('messages')}
                      leftIcon={<MessageSquare size={14} />}
                      title="Send instant message"
                    >
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onNavigate('mentor-sessions')}
                      leftIcon={<Calendar size={14} />}
                      title="Schedule review session"
                    >
                      Sync
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onNavigate('student-project', { projectId: p.id })}
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Open Workspace
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
