// Mobile Star Rating & Mentor Review Modal

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal } from '../../components/common/Modal';
import { TextArea } from '../../components/common/TextArea';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/icons/Icon';
import { reviewService } from '../../services/review.service';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
  projectId?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  mentorId,
  mentorName,
  projectId,
  onReviewSubmitted
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('Incredible session! Provided crystal clear guidance on concurrency locks and system design tradeoffs.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      showToast('warning', 'Review Required', 'Please provide feedback for the mentor.');
      return;
    }
    setIsLoading(true);
    try {
      await reviewService.submitReview({
        mentorId,
        projectId,
        rating,
        comment: comment.trim()
      });
      showToast('success', 'Review Submitted! ⭐', `Thank you for reviewing ${mentorName}.`);
      onClose();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      showToast('error', 'Review Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Rate Mentoring Session"
      subtitle={`Share feedback on your 1-on-1 guidance with ${mentorName}`}
    >
      <View style={styles.container}>
        {/* Star Rating Picker */}
        <Text style={[typography.captionBold, styles.label]}>OVERALL RATING</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              activeOpacity={0.7}
              onPress={() => setRating(star)}
              style={styles.starBtn}
            >
              <Icon
                name="star"
                size={32}
                color={star <= rating ? '#F59E0B' : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[typography.bodyBold, styles.ratingText]}>
          {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional Guidance' : `${rating} out of 5 Stars`}
        </Text>

        <TextArea
          label="Your Feedback & Key Learnings"
          placeholder="What went well? How did the mentor help unblock your project?"
          rows={4}
          value={comment}
          onChangeText={setComment}
        />

        <Button
          size="lg"
          variant="primary"
          onPress={handleSubmit}
          isLoading={isLoading}
          fullWidth
          rightIcon={<Icon name="check" size={16} color={colors.white} />}
          style={{ marginTop: spacing.md }}
        >
          Publish Verified Review
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs
  },
  label: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  starBtn: {
    padding: spacing.xs
  },
  ratingText: {
    textAlign: 'center',
    color: colors.textMain,
    marginBottom: spacing.lg
  }
});
