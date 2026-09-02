import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { MentorProfile, User, MentorFilters } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal.js';
import {
  Compass,
  Search,
  Filter,
  Star,
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  Briefcase,
  Sparkles,
  ArrowUpDown,
  Check
} from 'lucide-react';

interface MentorDiscoveryProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MentorDiscovery: React.FC<MentorDiscoveryProps> = ({ onNavigate }) => {
  const [mentors, setMentors] = useState<(MentorProfile & { user: User })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [minExp, setMinExp] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'students' | 'name'>('rating');
  const [companyFilter, setCompanyFilter] = useState('');

  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<(MentorProfile & { user: User }) | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const filters: MentorFilters = {
        search: search.trim() || undefined,
        technologies: selectedTech.length > 0 ? selectedTech : undefined,
        minExperience: minExp > 0 ? minExp : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        company: companyFilter.trim() || undefined,
        sortBy
      };
      const res = await api.discoverMentors(filters);
      setMentors(res);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [selectedTech, minExp, minRating, sortBy, companyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMentors();
  };

  const techOptions = [
    'Go (Golang)', 'PyTorch', 'Rust', 'Kubernetes', 'WebRTC', 'React',
    'Solidity', 'Apache Spark', 'Docker', 'gRPC', 'TypeScript', 'Kafka'
  ];

  const toggleTechFilter = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleOpenRequest = (mentor: MentorProfile & { user: User }) => {
    setSelectedMentorForRequest(mentor);
    setIsRequestModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <Badge variant="verified" style={{ marginBottom: '8px' }}>Verified Industry Mentors</Badge>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Discover Mentors & Engineering Leads
        </h1>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Connect 1-on-1 with verified software engineers, architects, and research scientists from top tech firms.
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '8px' }}>
          <Input
            placeholder="Search by mentor name, company (Google, Microsoft), title, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={15} /> Sort:
          </span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            options={[
              { value: 'rating', label: 'Highest Rated' },
              { value: 'experience', label: 'Most Experience' },
              { value: 'students', label: 'Most Students Helped' },
              { value: 'name', label: 'Alphabetical' }
            ]}
          />
        </div>
      </div>

      {/* Main Filter Sidebar & Mentors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }} className="discovery-layout">
        {/* Filter Sidebar */}
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.94rem' }}>
              <Filter size={16} color="var(--primary)" />
              <span>Filters</span>
            </div>
            {(selectedTech.length > 0 || minExp > 0 || minRating > 0 || companyFilter) && (
              <button
                onClick={() => {
                  setSelectedTech([]);
                  setMinExp(0);
                  setMinRating(0);
                  setCompanyFilter('');
                  setSearch('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Tech Filter */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
              Technologies
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {techOptions.map(tech => {
                const isSelected = selectedTech.includes(tech);
                return (
                  <button
                    key={tech}
                    onClick={() => toggleTechFilter(tech)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {tech} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Experience */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
              Minimum Experience
            </label>
            <Select
              value={minExp}
              onChange={(e) => setMinExp(parseInt(e.target.value, 10))}
              options={[
                { value: 0, label: 'Any Experience' },
                { value: 4, label: '4+ Years' },
                { value: 6, label: '6+ Years' },
                { value: 8, label: '8+ Years' },
                { value: 10, label: '10+ Years' }
              ]}
            />
          </div>

          {/* Min Rating */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
              Minimum Rating
            </label>
            <Select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              options={[
                { value: 0, label: 'Any Rating' },
                { value: 4.5, label: '⭐ 4.5 & above' },
                { value: 4.8, label: '⭐ 4.8 & above' },
                { value: 4.9, label: '⭐ 4.9 & above' }
              ]}
            />
          </div>
        </Card>

        {/* Mentors Grid */}
        <div>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : mentors.length === 0 ? (
            <EmptyState
              icon={<Compass size={32} />}
              title="No mentors matched your filters"
              description="Try adjusting your technology or experience filters to find matching mentors."
              actionText="Reset All Filters"
              onAction={() => {
                setSelectedTech([]);
                setMinExp(0);
                setMinRating(0);
                setSearch('');
              }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {mentors.map((mentor) => (
                <Card
                  key={mentor.userId}
                  hoverable
                  padding="md"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}
                >
                  <div>
                    {/* Top Row: Avatar & Details */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      <Avatar
                        name={mentor.user.fullName}
                        src={mentor.user.avatarUrl}
                        size="lg"
                        isVerified={mentor.isVerified}
                        isOnline={true}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mentor.user.fullName}
                          </h3>
                        </div>
                        <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.3 }}>
                          {mentor.title}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Building size={12} /> {mentor.company}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {mentor.bio}
                    </p>

                    {/* Tech Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                      {mentor.technologies.slice(0, 4).map(tech => (
                        <span
                          key={tech}
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-main)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.74rem',
                            fontWeight: 600
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {mentor.technologies.length > 4 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', padding: '2px 4px' }}>
                          +{mentor.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Metrics & Actions */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--text-main)' }}>
                        <Star size={15} color="#F59E0B" fill="#F59E0B" />
                        <span>{mentor.rating.toFixed(1)}</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          ({mentor.reviewsCount} reviews)
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        <strong>{mentor.studentsHelpedCount}</strong> students helped
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('mentor-profile', { mentorId: mentor.userId })}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenRequest(mentor)}
                      >
                        Request
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <MentorshipRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        mentor={selectedMentorForRequest}
        onSuccess={() => onNavigate('student-requests')}
      />
    </div>
  );
};
