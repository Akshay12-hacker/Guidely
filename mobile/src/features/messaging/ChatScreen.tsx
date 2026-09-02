// Mobile Real-time 1-on-1 Chat Room Screen

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { messagingService } from '../../services/messaging.service';
import { Message } from '../../types';
import { Header } from '../../components/common/Header';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/icons/Icon';
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
  const { onlineUsers, typingState, latestMessage, sendTyping, sendReadReceipt } = useWebSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimerRef = useRef<any>(null);

  const isOnline = counterpartId ? onlineUsers.has(counterpartId) : false;
  const isTyping = conversationId && typingState[conversationId]?.isTyping;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagingService.getMessages(conversationId);
      setMessages(res.messages || []);
      await messagingService.markRead(conversationId);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch {
      // ignore
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle incoming live message
  useEffect(() => {
    if (latestMessage && latestMessage.conversationId === conversationId) {
      setMessages(prev => {
        if (prev.some(m => m.id === latestMessage.message.id)) return prev;
        return [...prev, latestMessage.message];
      });
      sendReadReceipt(conversationId, latestMessage.message.id);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [latestMessage, conversationId, sendReadReceipt]);

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
      const newMsg = await messagingService.sendMessage(conversationId, { text: textToSend });
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      console.warn('Send error:', err);
    } finally {
      setIsSending(false);
    }
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
        {/* Messages Feed */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <Icon name="lock" size={13} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted, fontSize: 11 }]}>
              Direct mentor-student messaging for technical collaboration
            </Text>
          </View>

          {messages.map((msg, index) => {
            const isMe = msg.senderId === user?.id;
            return (
              <View
                key={msg.id || index}
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
                  <Text
                    style={[
                      typography.body,
                      { color: isMe ? colors.white : colors.textMain, fontSize: 14.5 }
                    ]}
                  >
                    {msg.text}
                  </Text>

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
                      <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 10, marginLeft: 3 }}>
                        ✓✓
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingIndicatorRow}>
              <View style={styles.typingBubble}>
                <Text style={[typography.caption, { color: colors.primary, fontStyle: 'italic' }]}>
                  ● {counterpartName.split(' ')[0]} is typing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
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
            <Icon name="send" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  messagesScroll: {
    padding: spacing.lg,
    paddingBottom: spacing.lg
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    gap: 6,
    marginBottom: spacing.lg
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
  typingIndicatorRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm
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
    borderColor: colors.border
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
    justifyContent: 'center',
    marginLeft: spacing.sm
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
