// Mobile Conversations List Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { messagingService } from '../../services/messaging.service';
import { Conversation } from '../../types';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Icon } from '../../components/icons/Icon';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatRelativeTime } from '../../utils/formatters';

export interface ConversationsScreenProps {
  onSelectConversation: (conversationId: string, counterpartName: string, counterpartAvatar?: string, counterpartId?: string) => void;
  onNavigate: (route: string) => void;
}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  onSelectConversation,
  onNavigate
}) => {
  const { user } = useAuth();
  const { onlineUsers, latestMessage } = useWebSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Update conversation when new WebSocket message arrives
  useEffect(() => {
    if (latestMessage) {
      fetchConversations();
    }
  }, [latestMessage, fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Messages & Mentoring Chat"
        subtitle="Real-time 1-on-1 sync with your mentors and mentees"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {isLoading ? (
          <View>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : conversations.length === 0 ? (
          <EmptyState
            iconName="message-square"
            title="No Active Conversations"
            description="Start building a project with a mentor to unlock direct real-time communication."
            actionText="Explore Mentors"
            onAction={() => onNavigate('discover')}
          />
        ) : (
          conversations.map(conv => {
            const isMentor = user?.role === 'MENTOR';
            const counterpartId = isMentor ? conv.studentId : conv.mentorId;
            const counterpartName = isMentor ? conv.student?.fullName : conv.mentor?.fullName;
            const counterpartAvatar = isMentor ? conv.student?.avatarUrl : conv.mentor?.avatarUrl;
            const counterpartTitle = isMentor ? 'Student Mentee' : `${conv.mentor?.title || 'Mentor'} @ ${conv.mentor?.company || ''}`;
            const unreadCount = isMentor ? conv.unreadMentorCount : conv.unreadStudentCount;
            const isOnline = onlineUsers.has(counterpartId || '');

            return (
              <Card
                key={conv.id}
                padding="md"
                style={styles.convCard}
                onPress={() => onSelectConversation(conv.id, counterpartName || 'Chat', counterpartAvatar, counterpartId)}
              >
                <View style={styles.convRow}>
                  <Avatar
                    name={counterpartName || 'Collaborator'}
                    src={counterpartAvatar}
                    size="lg"
                    isOnline={isOnline}
                    isVerified={!isMentor}
                  />

                  <View style={styles.convInfo}>
                    <View style={styles.convHeaderRow}>
                      <Text style={[typography.bodyBold, styles.nameText]} numberOfLines={1}>
                        {counterpartName}
                      </Text>
                      {conv.lastMessageAt && (
                        <Text style={[typography.caption, styles.timeText]}>
                          {formatRelativeTime(conv.lastMessageAt)}
                        </Text>
                      )}
                    </View>

                    <Text style={[typography.caption, styles.titleText]} numberOfLines={1}>
                      {counterpartTitle}
                    </Text>

                    <View style={styles.lastMsgRow}>
                      <Text
                        style={[
                          typography.body,
                          {
                            color: unreadCount > 0 ? colors.textMain : colors.textMuted,
                            fontWeight: unreadCount > 0 ? '700' : '400',
                            flex: 1,
                            fontSize: 13
                          }
                        ]}
                        numberOfLines={1}
                      >
                        {conv.lastMessageText || 'Start the conversation...'}
                      </Text>

                      {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  convCard: {
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  convInfo: {
    flex: 1,
    marginLeft: spacing.md
  },
  convHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  nameText: {
    color: colors.textMain,
    maxWidth: 180
  },
  timeText: {
    color: colors.textSubtle,
    fontSize: 11
  },
  titleText: {
    color: colors.primary,
    marginTop: 1,
    marginBottom: 4,
    fontSize: 11.5
  },
  lastMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 6
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800'
  }
});
