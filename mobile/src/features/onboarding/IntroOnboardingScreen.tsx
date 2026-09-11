// Introductory First-Launch Onboarding Screen for Guidely Mobile
// 3 interactive slides with dot indicators, Skip, Continue, Get Started, and haptic feedback

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from '../../components/icons/Icon';
import { Button } from '../../components/common/Button';

const { width } = Dimensions.get('window');

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: IconName;
  iconBg: string;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    badge: '1-ON-1 GUIDANCE',
    title: 'Find the Right Mentor',
    subtitle: 'Connect with verified industry engineers and tech leaders matching your exact tech stack, career goals, and pace.',
    icon: 'users',
    iconBg: '#3B82F6'
  },
  {
    id: '2',
    badge: 'HANDS-ON PROGRESS',
    title: 'Learn by Building',
    subtitle: 'Transform ideas into production software with synchronized goals, tasks, resource sharing, and real code reviews.',
    icon: 'folder-kanban',
    iconBg: '#10B981'
  },
  {
    id: '3',
    badge: 'CAREER ACCELERATION',
    title: 'Build Your Future',
    subtitle: 'Schedule 1-on-1 mentorship sessions, join live video syncs, and showcase verified portfolio projects.',
    icon: 'sparkles',
    iconBg: '#8B5CF6'
  }
];

interface IntroOnboardingScreenProps {
  onFinish: () => void;
}

export const IntroOnboardingScreen: React.FC<IntroOnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const handleFinish = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    onFinish();
  };

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    handleFinish();
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlide = ({ item }: { item: SlideItem }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
          <Icon name={item.icon} size={48} color={colors.white} />
        </View>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>

        <Text style={[typography.h1, styles.title]}>{item.title}</Text>
        <Text style={[typography.body, styles.subtitle]}>{item.subtitle}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Header with Skip Button */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.miniLogo}>
            <Icon name="compass" size={16} color={colors.white} />
          </View>
          <Text style={styles.brandName}>Guidely</Text>
        </View>

        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          try {
            Haptics.selectionAsync();
          } catch {}
        }}
        style={styles.carousel}
      />

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onPress={handleNext}
            rightIcon={
              !isLastSlide ? (
                <Icon name="arrow-right" size={18} color={colors.white} />
              ) : (
                <Icon name="sparkles" size={18} color={colors.white} />
              )
            }
          >
            {isLastSlide ? 'Get Started' : 'Continue'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    height: 56
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  miniLogo: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    ...typography.h3,
    color: colors.white,
    fontSize: 18,
    fontWeight: '700'
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  skipText: {
    ...typography.bodyBold,
    color: colors.textMuted,
    fontSize: 14
  },
  carousel: {
    flex: 1
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl
  },
  iconContainer: {
    width: 104,
    height: 104,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    ...shadows.lg
  },
  badgeContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.md
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.primary,
    letterSpacing: 1.2,
    fontSize: 11
  },
  title: {
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 28,
    lineHeight: 34
  },
  subtitle: {
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    maxWidth: 320
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs
  },
  dot: {
    height: 6,
    borderRadius: 3
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#334155'
  },
  actionContainer: {
    width: '100%'
  }
});
