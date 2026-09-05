// Mobile Mentorship Proposal Request Bottom Sheet Modal

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheet } from '../../components/common/BottomSheet';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { Chip } from '../../components/common/Chip';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { mentorshipService } from '../../services/mentorship.service';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon } from '../../components/icons/Icon';
import {
  TARGET_TECHNOLOGIES,
  HELP_NEEDED_AREAS,
  NO_IDEA_TECH,
  NO_IDEA_HELP
} from '../../constants/skills';

export interface MentorshipRequestModalProps {
  visible: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
  mentorTitle?: string;
  mentorCompany?: string;
  mentorAvatar?: string;
  mentorRating?: number;
  mentorReviewsCount?: number;
  mentorTechnologies?: string[];
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
  onRequestSubmitted?: () => void;
}

export const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({
  visible,
  onClose,
  mentorId,
  mentorName,
  mentorTitle,
  mentorCompany,
  mentorAvatar,
  mentorRating,
  mentorReviewsCount,
  mentorTechnologies,
  initialValues,
  onRequestSubmitted
}) => {
  const { showToast } = useToast();

  const [projectTitle, setProjectTitle] = useState(initialValues?.projectTitle || '');
  const [projectDescription, setProjectDescription] = useState(initialValues?.projectDescription || '');
  const [currentKnowledge, setCurrentKnowledge] = useState(initialValues?.currentKnowledge || '');
  const [selectedTech, setSelectedTech] = useState<string[]>(initialValues?.techKnown || []);
  const [selectedHelp, setSelectedHelp] = useState<string[]>(initialValues?.helpNeeded || []);
  const [expectedOutcome, setExpectedOutcome] = useState(initialValues?.expectedOutcome || '');
  const [preferredTimes, setPreferredTimes] = useState(initialValues?.preferredTimes || '');
  const [additionalMessage, setAdditionalMessage] = useState(initialValues?.additionalMessage || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setProjectTitle(initialValues?.projectTitle || '');
      setProjectDescription(initialValues?.projectDescription || '');
      setCurrentKnowledge(
        initialValues?.currentKnowledge ||
        (initialValues?.techKnown && initialValues.techKnown.length > 0 ? initialValues.techKnown.join(', ') : '')
      );
      setSelectedTech(initialValues?.techKnown || []);
      setSelectedHelp(initialValues?.helpNeeded || []);
      setExpectedOutcome(initialValues?.expectedOutcome || '');
      setPreferredTimes(initialValues?.preferredTimes || '');
      setAdditionalMessage(initialValues?.additionalMessage || '');
    }
  }, [visible, initialValues]);

  const availableTech = TARGET_TECHNOLOGIES;
  const availableHelp = HELP_NEEDED_AREAS;

  const toggleTech = (t: string) => {
    setSelectedTech(prev => {
      if (t === NO_IDEA_TECH) {
        return prev.includes(NO_IDEA_TECH) ? [] : [NO_IDEA_TECH];
      } else {
        const withoutNoIdea = prev.filter(x => x !== NO_IDEA_TECH);
        return withoutNoIdea.includes(t)
          ? withoutNoIdea.filter(x => x !== t)
          : [...withoutNoIdea, t];
      }
    });
  };

  const toggleHelp = (h: string) => {
    setSelectedHelp(prev => {
      if (h === NO_IDEA_HELP) {
        return prev.includes(NO_IDEA_HELP) ? [] : [NO_IDEA_HELP];
      } else {
        const withoutNoIdea = prev.filter(x => x !== NO_IDEA_HELP);
        return withoutNoIdea.includes(h)
          ? withoutNoIdea.filter(x => x !== h)
          : [...withoutNoIdea, h];
      }
    });
  };

  const handleSubmit = async () => {
    if (!projectTitle.trim() || !projectDescription.trim()) {
      showToast('warning', 'Missing Details', 'Please provide your project title and description.');
      return;
    }
    setIsLoading(true);
    try {
      await mentorshipService.createRequest({
        mentorId,
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        currentKnowledge,
        techKnown: selectedTech,
        helpNeeded: selectedHelp,
        expectedOutcome,
        preferredTimes,
        additionalMessage
      });
      showToast('success', 'Proposal Sent! 🚀', `Your request was delivered to ${mentorName}.`);
      onClose();
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Request Mentorship"
      subtitle={`Submit a structured project proposal to ${mentorName}`}
    >
      <View style={styles.content}>
        {/* Mentor Preview Card */}
        <View style={styles.mentorPreviewCard}>
          <View style={styles.cardHeaderRow}>
            <Avatar
              name={mentorName}
              src={mentorAvatar}
              size="md"
              isVerified
              isOnline
            />
            <View style={styles.mentorInfoCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={[typography.h3, styles.previewName]} numberOfLines={1}>
                  {mentorName}
                </Text>
                <Badge variant="verified" size="sm">Verified</Badge>
              </View>
              {mentorTitle ? (
                <Text style={[typography.captionBold, { color: colors.primary, marginTop: 1 }]} numberOfLines={1}>
                  {mentorTitle} {mentorCompany ? `@ ${mentorCompany}` : ''}
                </Text>
              ) : null}
              <View style={styles.ratingRow}>
                <Icon name="star" size={13} color="#F59E0B" />
                <Text style={[typography.captionBold, { color: colors.textMain, marginLeft: 3 }]}>
                  {mentorRating ? Number(mentorRating).toFixed(1) : '5.0'}
                </Text>
                {mentorReviewsCount ? (
                  <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 2 }]}>
                    ({mentorReviewsCount} reviews)
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {mentorTechnologies && mentorTechnologies.length > 0 ? (
            <View style={styles.mentorTechRow}>
              {mentorTechnologies.slice(0, 4).map(t => (
                <Badge key={t} variant="neutral" size="sm" style={{ marginRight: 4, marginBottom: 4 }}>
                  {t}
                </Badge>
              ))}
            </View>
          ) : null}
        </View>

        {/* Tip Box */}
        <View style={styles.tipBox}>
          <Icon name="sparkles" size={15} color={colors.primary} />
          <Text style={[typography.caption, styles.tipText]}>
            Mentors review technical details before accepting. Clearly explain your capstone architecture and learning goals.
          </Text>
        </View>

        <Input
          label="Project Title"
          placeholder="e.g. Distributed Task Queue in Go"
          value={projectTitle}
          onChangeText={setProjectTitle}
        />

        <TextArea
          label="Project Vision & Problem Statement"
          placeholder="What are you trying to build? What makes it technically interesting?"
          rows={4}
          value={projectDescription}
          onChangeText={setProjectDescription}
        />

        <TextArea
          label="Your Current Knowledge & Starting Point"
          placeholder="What parts do you already understand, and where are you currently stuck?"
          rows={3}
          value={currentKnowledge}
          onChangeText={setCurrentKnowledge}
        />

        {/* Tech Known */}
        <Text style={[typography.captionBold, styles.fieldLabel]}>
          TARGET TECHNOLOGIES
        </Text>
        <View style={styles.chipsRow}>
          {availableTech.map(t => (
            <Chip
              key={t}
              label={t}
              selected={selectedTech.includes(t)}
              onPress={() => toggleTech(t)}
            />
          ))}
        </View>

        {/* Help Needed */}
        <Text style={[typography.captionBold, styles.fieldLabel]}>
          GUIDANCE NEEDED
        </Text>
        <View style={styles.chipsRow}>
          {availableHelp.map(h => (
            <Chip
              key={h}
              label={h}
              selected={selectedHelp.includes(h)}
              onPress={() => toggleHelp(h)}
            />
          ))}
        </View>

        <Input
          label="Expected Project Outcome"
          placeholder="e.g. Open-source GitHub repo, paper, working demo"
          value={expectedOutcome}
          onChangeText={setExpectedOutcome}
        />

        <Input
          label="Preferred Sync Times"
          placeholder="e.g. Weekday evenings, Saturday mornings"
          value={preferredTimes}
          onChangeText={setPreferredTimes}
        />

        <TextArea
          label="Personal Note to Mentor (Optional)"
          placeholder="Share why you specifically chose this mentor..."
          rows={2}
          value={additionalMessage}
          onChangeText={setAdditionalMessage}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
          <Button
            size="lg"
            variant="secondary"
            onPress={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            variant="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            rightIcon={<Icon name="send" size={16} color={colors.white} />}
            style={{ flex: 2 }}
          >
            Send Proposal
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl
  },
  mentorPreviewCard: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mentorInfoCol: {
    marginLeft: spacing.sm,
    flex: 1
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  previewName: {
    color: colors.textMain,
    fontSize: 14
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  mentorTechRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  tipText: {
    flex: 1,
    color: colors.primaryDark,
    lineHeight: 16
  },
  fieldLabel: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: 11
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md
  }
});
