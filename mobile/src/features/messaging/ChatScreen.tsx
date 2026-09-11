// Production Real-time 1-on-1 Chat Room Screen for Guidely Mobile
// Inverted virtualized FlatList, real-time WebSocket sync, image/media attachment picker, MediaViewerModal

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useToast } from '../../context/ToastContext';
import { messagingService } from '../../services/messaging.service';
import { apiClient } from '../../api/client';
import { Message } from '../../types';
import { Header } from '../../components/common/Header';
import { Avatar } from '../../components/common/Avatar';
import { Icon } from '../../components/icons/Icon';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { MediaViewerModal } from '../../components/common/MediaViewerModal';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatTime } from '../../utils/formatters';

export interface ChatScreenProps {
  conversationId: string;
  counterpartName: string;
  counterpartAvatar?: string;
  counterpartId?: string;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversationId,
  counterpartName,
  counterpartAvatar,
  counterpartId,
  onBack
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { onlineUsers, typingState, latestMessage, sendTyping, sendReadReceipt } = useWebSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fullscreen media modal
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video' | 'file'>('image');

  const typingTimerRef = useRef<any>(null);

  const isOnline = counterpartId ? onlineUsers.has(counterpartId) : false;
  const isTyping = conversationId && typingState[conversationId]?.isTyping;

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await messagingService.getMessages(conversationId);
      setMessages(res.messages || []);
      await messagingService.markRead(conversationId);
    } catch (err: any) {
      setHasError(true);
      setErrorMessage(err.message || 'Failed to load conversation messages.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle incoming live message via WebSocket
  useEffect(() => {
    if (latestMessage && latestMessage.conversationId === conversationId) {
      setMessages(prev => {
        if (prev.some(m => m.id === latestMessage.message.id)) return prev;
        return [...prev, latestMessage.message];
      });
      if (counterpartId) {
        sendReadReceipt(counterpartId, conversationId);
      }
    }
  }, [latestMessage, conversationId, counterpartId, sendReadReceipt]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (counterpartId) {
      sendTyping(counterpartId, conversationId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        sendTyping(counterpartId, conversationId, false);
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    if (counterpartId) {
      sendTyping(counterpartId, conversationId, false);
    }

    try {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      const newMsg = await messagingService.sendMessage(conversationId, { text: textToSend });
      setMessages(prev => [...prev, newMsg]);
    } catch (err: any) {
      showToast('error', 'Message Failed', err.message || 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handlePickAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploading(true);
      showToast('info', 'Uploading Media...', 'Sending attachment to Cloudinary storage.');

      const uploaded = await apiClient.uploadMedia(asset.uri, 'guidely/chat');

      const isVideo = asset.type === 'video' || asset.uri.endsWith('.mp4');
      const attachmentPayload = {
        type: isVideo ? 'VIDEO' : 'IMAGE',
        url: uploaded.secureUrl || uploaded.url,
        fileName: asset.fileName || (isVideo ? 'video.mp4' : 'image.jpg'),
        fileSize: asset.fileSize || 0
      };

      const newMsg = await messagingService.sendMessage(conversationId, {
        text: isVideo ? '🎥 Shared a video' : '📷 Shared an image',
        attachments: [attachmentPayload]
      });

      setMessages(prev => [...prev, newMsg]);
      showToast('success', 'Attachment Sent!');
    } catch (err: any) {
      showToast('error', 'Upload Failed', err.message || 'Could not upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenMedia = (url: string, type: 'image' | 'video' = 'image') => {
    setActiveMediaUrl(url);
    setActiveMediaType(type);
  };

  // Inverted FlatList requires data in reversed order
  const reversedMessages = [...messages].reverse();

  const renderMessageItem = ({ item: msg }: { item: Message }) => {
    const isMe = msg.senderId === user?.id;
    const hasAttachments = msg.attachments && msg.attachments.length > 0;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft
        ]}
      >
        {!isMe && (
          <Avatar
            name={counterpartName}
            src={counterpartAvatar}
            size="xs"
            style={{ marginRight: 6, alignSelf: 'flex-end', marginBottom: 4 }}
          />
        )}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleRight : styles.bubbleLeft
          ]}
        >
          {/* Attachments */}
          {hasAttachments && (
            <View style={styles.attachmentsContainer}>
              {msg.attachments!.map((att, idx) => {
                const isVideo = att.type === 'VIDEO';
                return (
                  <TouchableOpacity
                    key={att.url || idx}
                    activeOpacity={0.85}
                    onPress={() => handleOpenMedia(att.url, isVideo ? 'video' : 'image')}
                    style={styles.attachmentWrapper}
                  >
                    <Image
                      source={{ uri: att.url }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                    {isVideo && (
                      <View style={styles.videoBadge}>
                        <Icon name="video" size={16} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Text Message */}
          {msg.text && (!hasAttachments || (msg.text !== '📷 Shared an image' && msg.text !== '🎥 Shared a video')) ? (
            <Text
              style={[
                typography.body,
                { color: isMe ? colors.white : colors.textMain, fontSize: 14.5 }
              ]}
            >
              {msg.text}
            </Text>
          ) : null}

          <View style={styles.bubbleFooter}>
            <Text
              style={[
                typography.caption,
                {
                  color: isMe ? 'rgba(255, 255, 255, 0.75)' : colors.textSubtle,
                  fontSize: 10
                }
              ]}
            >
              {formatTime(msg.createdAt)}
            </Text>
            {isMe && (
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 10, marginLeft: 4 }}>
                ✓✓
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <Header
        showBack
        onBack={onBack}
        title={counterpartName}
        subtitle={isOnline ? 'Online now' : 'Offline'}
        rightAction={
          <Avatar
            name={counterpartName}
            src={counterpartAvatar}
            size="sm"
            isOnline={isOnline}
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : hasError ? (
          /* Error State */
          <ErrorState
            title="Failed to Load Messages"
            message={errorMessage}
            onRetry={fetchMessages}
          />
        ) : messages.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <EmptyState
              iconName="message-square"
              title="Start the Conversation"
              description={`Say hello to ${counterpartName}! Share project ideas, code snippets, or ask questions.`}
            />
          </View>
        ) : (
          /* Success State - Inverted FlatList */
          <FlatList
            data={reversedMessages}
            inverted
            renderItem={renderMessageItem}
            keyExtractor={(item, index) => item.id || String(index)}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              isTyping ? (
                <View style={styles.typingIndicatorRow}>
                  <View style={styles.typingBubble}>
                    <Text style={[typography.caption, { color: colors.primary, fontStyle: 'italic' }]}>
                      ● {counterpartName.split(' ')[0]} is typing...
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          {/* Attachment Picker */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePickAttachment}
            disabled={isUploading}
            style={styles.attachBtn}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="paperclip" size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder={`Message ${counterpartName.split(' ')[0]}...`}
            placeholderTextColor={colors.textSubtle}
            value={inputText}
            onChangeText={handleInputChange}
            multiline
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
            style={[
              styles.sendBtn,
              inputText.trim() ? styles.sendBtnActive : styles.sendBtnDisabled
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="send" size={16} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Fullscreen Media Viewer Modal */}
      <MediaViewerModal
        visible={!!activeMediaUrl}
        mediaUrl={activeMediaUrl}
        mediaType={activeMediaType}
        title="Guidely Attachment"
        onClose={() => setActiveMediaUrl(null)}
      />
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
  loadingBox: {
    padding: spacing.lg
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg
  },
  flatListContent: {
    padding: spacing.lg,
    paddingBottom: spacing.sm
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%'
  },
  messageRowLeft: {
    alignSelf: 'flex-start'
  },
  messageRowRight: {
    alignSelf: 'flex-end'
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...shadows.sm
  },
  bubbleLeft: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 3
  },
  bubbleRight: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 3
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  attachmentsContainer: {
    marginBottom: spacing.xs
  },
  attachmentWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative'
  },
  attachmentImage: {
    width: 200,
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: radius.full,
    padding: 6
  },
  typingIndicatorRow: {
    alignSelf: 'flex-start',
    marginVertical: spacing.xs
  },
  typingBubble: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontSize: 14.5,
    color: colors.textMain
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.sm
  },
  sendBtnDisabled: {
    backgroundColor: colors.textSubtle,
    opacity: 0.5
  }
});
