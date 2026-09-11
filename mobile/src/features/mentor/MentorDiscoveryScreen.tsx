// Production Mentor Discovery & Marketplace Screen for Guidely Mobile
// Virtualized FlatList, debounced search, active technology filters, and 4 explicit states

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { mentorService } from '../../services/mentor.service';
import { MentorProfile, User } from '../../types';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Chip } from '../../components/common/Chip';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal';

export interface MentorDiscoveryScreenProps {
  onNavigate: (route: string, params?: any) => void;
}

export const MentorDiscoveryScreen: React.FC<MentorDiscoveryScreenProps> = ({ onNavigate }) => {
  const [mentors, setMentors] = useState<(MentorProfile & { user: User })[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'students'>('rating');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Proposal modal state
  const [selectedMentorForProposal, setSelectedMentorForProposal] = useState<any>(null);

  const debounceTimerRef = useRef<any>(null);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  };

  const fetchMentors = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const filters: any = { sortBy };
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
      if (selectedTech) filters.technologies = [selectedTech];
      const data = await mentorService.discoverMentors(filters);
      setMentors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setHasError(true);
      setErrorMessage(err.message || 'Could not fetch mentors. Please check connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedTech, sortBy]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentors();
  };

  const techFilters = ['All', 'Go', 'PyTorch', 'Rust', 'Kubernetes', 'React', 'TypeScript', 'Solidity'];

  const renderMentorCard = ({ item: m }: { item: MentorProfile & { user: User } }) => {
    return (
      <Card
        padding="md"
        style={styles.mentorCard}
        onPress={() => onNavigate('mentor-profile', { mentorId: m.userId })}
      >
        {/* Header Row */}
        <View style={styles.cardTop}>
          <Avatar
            name={m.user?.fullName || 'Mentor'}
            src={m.user?.avatarUrl}
            size="lg"
            isVerified
            isOnline
          />
          <View style={styles.cardHeaderInfo}>
            <View style={styles.nameRow}>
              <Text style={[typography.h3, styles.mentorName]} numberOfLines={1}>
                {m.user?.fullName}
              </Text>
              <Badge variant="verified" size="sm">Verified</Badge>
            </View>
            <Text style={[typography.bodyMedium, { color: colors.primary }]} numberOfLines={1}>
              {m.title} @ {m.company}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
              {m.college} • {m.yearsExperience} yrs exp
            </Text>
          </View>
        </View>

        {/* Bio */}
        {m.bio ? (
          <Text style={[typography.body, styles.bioText]} numberOfLines={2}>
            {m.bio}
          </Text>
        ) : null}

        {/* Tech Chips */}
        <View style={styles.chipsRow}>
          {m.technologies?.slice(0, 4).map(t => (
            <Badge key={t} variant="neutral" size="sm" style={{ marginRight: 4, marginBottom: 4 }}>
              {t}
            </Badge>
          ))}
          {(m.technologies?.length || 0) > 4 && (
            <Badge variant="neutral" size="sm">+{(m.technologies?.length || 0) - 4}</Badge>
          )}
        </View>

        {/* Stats & Actions Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={[typography.captionBold, styles.statText]}>{m.rating || 5.0}</Text>
              <Text style={[typography.caption, { color: colors.textSubtle, fontSize: 10.5 }]}>
                ({m.reviewsCount || 0})
              </Text>
            </View>
            <View style={styles.statDivider} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {m.studentsHelpedCount || 0} guided
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => setSelectedMentorForProposal(m)}
              rightIcon={<Icon name="send" size={12} color={colors.white} />}
            >
              Request
            </Button>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Search & Filter Bar */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search by mentor name, company, or tech..."
            value={search}
            onChangeText={handleSearchChange}
            leftIcon={<Icon name="search" size={18} color={colors.textMuted} />}
            containerStyle={{ marginBottom: spacing.xs }}
          />

          {/* Tech Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.techChipsRow}
          >
            {techFilters.map(t => {
              const isSelected = t === 'All' ? selectedTech === null : selectedTech === t;
              return (
                <Chip
                  key={t}
                  label={t}
                  selected={isSelected}
                  onPress={() => setSelectedTech(t === 'All' ? null : t)}
                />
              );
            })}
          </ScrollView>

          {/* Sort Tabs */}
          <View style={styles.sortRow}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {mentors.length} Verified Mentors
            </Text>
            <View style={styles.sortButtons}>
              {[
                { id: 'rating', label: '★ Rating' },
                { id: 'experience', label: 'Exp' },
                { id: 'students', label: 'Students' }
              ].map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSortBy(s.id as any)}
                  style={[
                    styles.sortBtn,
                    sortBy === s.id && styles.activeSortBtn
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: sortBy === s.id ? colors.primary : colors.textMuted, fontSize: 11 }
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 4 Explicit States: Loading, Error, Empty, Success (Virtualized FlatList) */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : hasError ? (
          <ErrorState
            title="Failed to Load Mentors"
            message={errorMessage}
            onRetry={fetchMentors}
          />
        ) : mentors.length === 0 ? (
          <EmptyState
            iconName="users"
            title="No Mentors Found"
            description="Try adjusting your search terms or clearing your technology filter."
            actionText="Reset Filters"
            onAction={() => {
              setSearch('');
              setDebouncedSearch('');
              setSelectedTech(null);
            }}
          />
        ) : (
          <FlatList
            data={mentors}
            renderItem={renderMentorCard}
            keyExtractor={(item) => item.userId || (item as any).id}
            contentContainerStyle={styles.cardsContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
          />
        )}
      </View>

      {/* Proposal Request Modal */}
      {selectedMentorForProposal && (
        <MentorshipRequestModal
          visible={!!selectedMentorForProposal}
          onClose={() => setSelectedMentorForProposal(null)}
          mentorId={selectedMentorForProposal.userId || selectedMentorForProposal.id}
          mentorName={selectedMentorForProposal.user?.fullName || selectedMentorForProposal.name}
          mentorTitle={selectedMentorForProposal.title}
          mentorCompany={selectedMentorForProposal.company}
          mentorAvatar={selectedMentorForProposal.user?.avatarUrl}
          mentorRating={selectedMentorForProposal.rating}
          mentorReviewsCount={selectedMentorForProposal.reviewsCount}
          mentorTechnologies={selectedMentorForProposal.technologies}
          onRequestSubmitted={() => {
            setSelectedMentorForProposal(null);
            onNavigate('requests');
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  techChipsRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    gap: spacing.xs
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.xs
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceSubtle
  },
  activeSortBtn: {
    backgroundColor: colors.primaryLight
  },
  loadingBox: {
    padding: spacing.lg
  },
  cardsContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  mentorCard: {
    marginBottom: spacing.md,
    ...shadows.sm
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: spacing.md
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mentorName: {
    color: colors.textMain,
    maxWidth: 160
  },
  bioText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 19
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  statText: {
    color: colors.textMain,
    fontSize: 12
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border
  },
  actionButtons: {
    flexDirection: 'row'
  }
});
