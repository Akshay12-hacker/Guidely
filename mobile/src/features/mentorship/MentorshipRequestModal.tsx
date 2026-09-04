// Mobile Mentorship Proposal Request Bottom Sheet Modal

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomSheet } from '../../components/common/BottomSheet';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { Chip } from '../../components/common/Chip';
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
  onRequestSubmitted?: () => void;
}

export const MentorshipRequestModal: React.FC<MentorshipRequestModalProps> = ({
  visible,
  onClose,
  mentorId,
  mentorName,
  onRequestSubmitted
}) => {
  const { showToast } = useToast();

  const [projectTitle, setProjectTitle] = useState('Distributed Fault-Tolerant Task Queue in Go');
  const [projectDescription, setProjectDescription] = useState('Building a distributed async task queue with Raft consensus, worker crash heartbeats, and exponential backoff retry queues.');
  const [currentKnowledge, setCurrentKnowledge] = useState('Intermediate in Go syntax and basic concurrency, but need guidance on leader election and network partitions.');
  const [selectedTech, setSelectedTech] = useState<string[]>(['Go (Golang)', 'gRPC', 'PostgreSQL']);
  const [selectedHelp, setSelectedHelp] = useState<string[]>(['Architecture & System Design', '1-on-1 Code Reviews']);
  const [expectedOutcome, setExpectedOutcome] = useState('A production-grade open source repo with benchmarks and Docker compose setup.');
  const [preferredTimes, setPreferredTimes] = useState('Weekdays after 6:30 PM IST or Weekend mornings');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

        <Button
          size="lg"
          variant="primary"
          onPress={handleSubmit}
          isLoading={isLoading}
          fullWidth
          rightIcon={<Icon name="send" size={16} color={colors.white} />}
          style={{ marginTop: spacing.md }}
        >
          Send Proposal to {mentorName.split(' ')[0]}
        </Button>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl
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
