// Mobile Mentor Match Chatbot Modal

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Chip } from '../../components/common/Chip';
import { Icon } from '../../components/icons/Icon';
import { studentService } from '../../services/student.service';
import { RecommendedMentor, MentorRecommendationCriteria } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface MentorMatchChatModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMentor: (mentorId: string) => void;
  initialCriteria?: MentorRecommendationCriteria;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  canSkip?: boolean;
  timestamp: string;
}

export const MentorMatchChatModal: React.FC<MentorMatchChatModalProps> = ({
  visible,
  onClose,
  onSelectMentor,
  initialCriteria
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [projectIdea, setProjectIdea] = useState(initialCriteria?.projectIdea || '');
  const [targetTech, setTargetTech] = useState<string[]>(initialCriteria?.targetTechnologies || []);
  const [helpNeeded, setHelpNeeded] = useState<string[]>(initialCriteria?.helpNeededAreas || []);
  const [preferences, setPreferences] = useState(initialCriteria?.preferences || '');

  const [recommendedMentors, setRecommendedMentors] = useState<RecommendedMentor[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && messages.length === 0) {
      initConversation();
    }
  }, [visible]);

  const initConversation = () => {
    setIsTyping(true);
    const initial: ChatMessage[] = [
      {
        id: 'msg_welcome',
        sender: 'bot',
        text: "👋 Hi! I'm your Guidely Mentor Advisor. Tell me what you're building or what help you need, and I'll match you with verified engineering leads. You can skip any question you're not sure about!",
        timestamp: 'Just now'
      }
    ];

    setTimeout(() => {
      initial.push({
        id: 'msg_step1',
        sender: 'bot',
        text: "Step 1: What kind of project or system do you want to build?",
        options: [
          'Distributed Task Queue in Go',
          'AI / Computer Vision Classifier',
          'Full-Stack Web Platform',
          'Cyber Security Threat Anomaly Detector',
          'Cloud Architecture & CI/CD Pipeline',
          'Mobile App (React Native)'
        ],
        canSkip: true,
        timestamp: 'Just now'
      });
      setMessages(initial);
      setIsTyping(false);
      fetchRecommendations({ projectIdea, targetTechnologies: targetTech, helpNeededAreas: helpNeeded });
    }, 500);
  };

  const fetchRecommendations = async (criteria: MentorRecommendationCriteria) => {
    setIsLoading(true);
    try {
      const results = await studentService.recommendMentors(criteria);
      if (Array.isArray(results)) {
        setRecommendedMentors(results);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      processNextStep(text, false);
    }, 600);
  };

  const handleSkip = () => {
    const skipMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: '⏭️ Skipped question',
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, skipMsg]);
    setIsTyping(true);

    setTimeout(() => {
      processNextStep('', true);
    }, 500);
  };

  const processNextStep = (userText: string, skipped: boolean) => {
    let botReply = '';
    let nextOptions: string[] | undefined = undefined;
    let canSkip = true;

    let updatedProjectIdea = projectIdea;
    let updatedTech = [...targetTech];
    let updatedHelp = [...helpNeeded];
    let updatedPrefs = preferences;

    if (currentStep === 1) {
      if (!skipped && userText) {
        updatedProjectIdea = userText;
        setProjectIdea(userText);
        botReply = `Great vision! What tech stack or tools are you planning to use or want advice on?`;
      } else {
        botReply = "No problem! Your mentor can help you brainstorm. What technologies are you interested in?";
      }
      nextOptions = [
        'Go (Golang)',
        'Python & PyTorch',
        'React & TypeScript',
        'Docker & Kubernetes',
        'Node.js / Express',
        'AWS Cloud & Linux'
      ];
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!skipped && userText) {
        updatedTech = Array.from(new Set([...updatedTech, userText]));
        setTargetTech(updatedTech);
        botReply = `Noted ${userText}! Where do you anticipate needing the most mentor guidance?`;
      } else {
        botReply = "All good! We'll match generalist engineering architects. Where do you need the most help?";
      }
      nextOptions = [
        'Architecture & System Design',
        'Concurrency & High Throughput',
        'Research & Paper Writing',
        'Code Reviews & Clean Code',
        'CI/CD & Cloud Deployment',
        '0-to-1 Project Discovery'
      ];
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!skipped && userText) {
        updatedHelp = Array.from(new Set([...updatedHelp, userText]));
        setHelpNeeded(updatedHelp);
        botReply = `Got it! Guidance in ${userText} will unblock you fast. Any mentor background preferences?`;
      } else {
        botReply = "Understood! Any specific mentor company or background preferences?";
      }
      nextOptions = [
        'Big Tech (Google / Microsoft / AWS)',
        'Academic Guides & Professors',
        'Fast-Paced Startup Engineers',
        'No preference / Best match'
      ];
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!skipped && userText && !userText.includes('No preference')) {
        updatedPrefs = userText;
        setPreferences(userText);
      }
      botReply = "Done! I've analyzed our verified mentors according to your project needs. Check your matches below!";
      nextOptions = undefined;
      canSkip = false;
      setCurrentStep(5);
    } else {
      updatedProjectIdea = `${updatedProjectIdea} ${userText}`.trim();
      setProjectIdea(updatedProjectIdea);
      botReply = `Updated your criteria with "${userText}"! Recommendations refreshed below.`;
      canSkip = false;
    }

    const updatedCriteria: MentorRecommendationCriteria = {
      projectIdea: updatedProjectIdea,
      targetTechnologies: updatedTech,
      helpNeededAreas: updatedHelp,
      preferences: updatedPrefs
    };

    fetchRecommendations(updatedCriteria);

    const botMsg: ChatMessage = {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: botReply,
      options: nextOptions,
      canSkip,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentStep(1);
    setProjectIdea('');
    setTargetTech([]);
    setHelpNeeded([]);
    setPreferences('');
    initConversation();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="AI Mentor Advisor"
      subtitle="Explain what you want to build and find your verified human mentor"
    >
      <View style={styles.container}>
        {/* Reset Action */}
        <View style={styles.topBar}>
          <Text style={[typography.captionBold, { color: colors.textMuted }]}>
            STEP {Math.min(currentStep, 4)} OF 4
          </Text>
          <TouchableOpacity onPress={handleReset} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="refresh" size={12} color={colors.primary} />
            <Text style={[typography.captionBold, { color: colors.primary }]}>Restart</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Feed */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isBot ? styles.botRow : styles.userRow
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isBot ? styles.botBubble : styles.userBubble
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      { color: isBot ? colors.textMain : colors.white, fontSize: 13.5 }
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                {/* Option Chips for latest bot message */}
                {isBot && msg.options && index === messages.length - 1 && (
                  <View style={styles.optionsWrap}>
                    {msg.options.map(opt => (
                      <Chip
                        key={opt}
                        label={opt}
                        onPress={() => handleSendMessage(opt)}
                        style={{ marginBottom: 4 }}
                      />
                    ))}
                    {msg.canSkip && (
                      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={[typography.captionBold, { color: colors.textMuted }]}>
                          ⏭️ Skip this question
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.messageRow, styles.botRow]}>
              <View style={[styles.messageBubble, styles.botBubble, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  Advisor is analyzing mentors...
                </Text>
              </View>
            </View>
          )}

          {/* Recommended Mentors Section inside Chat */}
          {recommendedMentors.length > 0 && (
            <View style={styles.recomSection}>
              <View style={styles.recomHeader}>
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  TOP RECOMMENDED HUMAN MENTORS ({recommendedMentors.length})
                </Text>
                {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
              </View>

              {recommendedMentors.map(mentor => {
                const matchScore = mentor.matchScore || 90;
                return (
                  <Card key={mentor.id} padding="sm" style={styles.mentorCard}>
                    <View style={styles.mentorHeader}>
                      <Avatar
                        name={mentor.fullName || mentor.full_name || mentor.title}
                        src={mentor.avatarUrl || mentor.avatar_url}
                        size="md"
                        isVerified
                      />
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[typography.bodyBold, { fontSize: 13.5 }]} numberOfLines={1}>
                            {mentor.fullName || mentor.full_name}
                          </Text>
                          <Badge variant={matchScore >= 80 ? 'success' : 'primary'} size="sm">
                            {matchScore}% Match
                          </Badge>
                        </View>
                        <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]} numberOfLines={1}>
                          {mentor.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textMuted, fontSize: 11 }]} numberOfLines={1}>
                          {mentor.company}
                        </Text>
                      </View>
                    </View>

                    {mentor.matchReasons && mentor.matchReasons.length > 0 && (
                      <View style={styles.reasonBox}>
                        <Text style={[typography.caption, { color: colors.textMain, fontSize: 11 }]}>
                          ✓ {mentor.matchReasons[0]}
                        </Text>
                      </View>
                    )}

                    <View style={styles.mentorActions}>
                      <Text style={[typography.captionBold, { color: colors.textMain, fontSize: 11.5 }]}>
                        ⭐ {mentor.rating ? mentor.rating.toFixed(1) : '5.0'}
                      </Text>
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={() => {
                          onClose();
                          onSelectMentor(mentor.id);
                        }}
                        style={{ paddingHorizontal: 12, minHeight: 30 }}
                      >
                        View & Request
                      </Button>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Text Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Explain what you want to build..."
            placeholderTextColor={colors.textSubtle}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  chatScroll: {
    maxHeight: 380,
    marginBottom: spacing.sm
  },
  messageRow: {
    marginBottom: 4
  },
  botRow: {
    alignItems: 'flex-start'
  },
  userRow: {
    alignItems: 'flex-end'
  },
  messageBubble: {
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    maxWidth: '88%'
  },
  botBubble: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border
  },
  userBubble: {
    backgroundColor: colors.primary
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginTop: 4
  },
  recomSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  recomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  mentorCard: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reasonBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xs,
    padding: 6,
    marginTop: 6
  },
  mentorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 6
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.xs
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    fontSize: 13,
    color: colors.textMain,
    backgroundColor: colors.surface
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
