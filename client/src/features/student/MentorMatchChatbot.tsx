import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { RecommendedMentor, MentorRecommendationCriteria, MentorProfile, User } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal.js';
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  X,
  Star,
  ChevronRight,
  SkipForward,
  Flame,
  Check,
  MessageSquare,
  Users,
  SlidersHorizontal
} from 'lucide-react';

interface MentorMatchChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, params?: any) => void;
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

export const MentorMatchChatbot: React.FC<MentorMatchChatbotProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialCriteria
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Responsive view handling
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 860 : false
  );
  const [activeTab, setActiveTab] = useState<'chat' | 'mentors'>('chat');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Collected criteria
  const [projectIdea, setProjectIdea] = useState<string>(initialCriteria?.projectIdea || '');
  const [targetTech, setTargetTech] = useState<string[]>(initialCriteria?.targetTechnologies || []);
  const [helpNeeded, setHelpNeeded] = useState<string[]>(initialCriteria?.helpNeededAreas || []);
  const [preferences, setPreferences] = useState<string>(initialCriteria?.preferences || '');

  // Recommended mentors result
  const [recommendedMentors, setRecommendedMentors] = useState<RecommendedMentor[]>([]);

  // Request modal state
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<(MentorProfile & { user: User }) | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initiateConversation();
    }
  }, [isOpen]);

  const initiateConversation = async () => {
    setIsTyping(true);
    const initialMsgs: ChatMessage[] = [
      {
        id: 'msg_welcome',
        sender: 'bot',
        text: "👋 Hi there! I'm your Guidely Mentor Advisor. My job is to understand what you want to build and match you with verified engineering leads and research mentors. You can answer my simple questions below, or skip any question you're not sure about!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setTimeout(() => {
      initialMsgs.push({
        id: 'msg_step_1',
        sender: 'bot',
        text: "Step 1: What kind of project or system do you want to build?",
        options: [
          'Distributed Fault-Tolerant Task Queue in Go',
          'AI / Deep Learning Computer Vision Classifier',
          'Full-Stack Collaborative Web Platform',
          'Cyber Threat Intelligence & SOC Anomaly Detector',
          'Cloud Architecture & DevOps CI/CD Pipeline',
          'Cross-Platform Mobile App (React Native)'
        ],
        canSkip: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setMessages(initialMsgs);
      setIsTyping(false);
      fetchRecommendations({ projectIdea, targetTechnologies: targetTech, helpNeededAreas: helpNeeded, preferences });
    }, 500);
  };

  const fetchRecommendations = async (criteria: MentorRecommendationCriteria) => {
    setIsLoading(true);
    try {
      const results = await api.recommendMentors(criteria);
      setRecommendedMentors(results);
    } catch {
      // fallback to mock matching
      const results = api.rankMockMentors(criteria);
      setRecommendedMentors(results);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      processNextStep(text, false);
    }, 600);
  };

  const handleSkipStep = () => {
    const skipMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: '⏭️ Skipped question',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        botReply = `Got it! "${userText}" is a great project vision. Next, what tech stack or tools are you planning to use (or interested in learning)?`;
      } else {
        botReply = "No problem at all! Mentors will help you brainstorm ideas. Which programming languages or tools are you interested in working with?";
      }
      nextOptions = [
        'Go (Golang)',
        'Python & PyTorch',
        'React / Next.js & TypeScript',
        'Docker & Kubernetes',
        'Node.js & Express',
        'AWS Cloud & Linux',
        'Cyber Security & Forensics'
      ];
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!skipped && userText) {
        updatedTech = Array.from(new Set([...updatedTech, userText]));
        setTargetTech(updatedTech);
        botReply = `Great choice with ${userText}! Where do you anticipate needing the most mentor guidance or unblocking?`;
      } else {
        botReply = "No problem! We'll match generalist engineering leads. Where do you need the most guidance?";
      }
      nextOptions = [
        'Architecture & System Design',
        'Concurrency & Deadlock Prevention',
        '1-on-1 Code Reviews & Clean Code',
        'CI/CD Pipelines & Cloud Deployment',
        'Project Ideation & 0-to-1 Scoping',
        'AI Model Integration & Prompts'
      ];
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!skipped && userText) {
        updatedHelp = Array.from(new Set([...updatedHelp, userText]));
        setHelpNeeded(updatedHelp);
        botReply = `Understood! Guidance in ${userText} will help you avoid major pitfalls. Lastly, do you have any mentor background preferences?`;
      } else {
        botReply = "All good! Your mentor will start with a discovery session. Any mentor company or background preferences?";
      }
      nextOptions = [
        'Big Tech Engineers (Google / Microsoft / AWS)',
        'Academic Guides & University Professors',
        'Fast-Paced Startup Engineers',
        'No preference / Best overall match'
      ];
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!skipped && userText && !userText.includes('No preference')) {
        updatedPrefs = userText;
        setPreferences(userText);
        botReply = `Noted your preference for ${userText}! I've synthesized your project vision and ranked our verified mentors. Take a look at your top recommendations!`;
      } else {
        botReply = "Perfect! I've synthesized all your project needs and ranked our verified mentors by relevance. Here are the top engineers ready to guide you!";
      }
      nextOptions = undefined;
      canSkip = false;
      setCurrentStep(5);
    } else {
      botReply = `Thanks for sharing! I've recalibrated your recommendations based on "${userText}". Check the updated matches below or feel free to request mentorship directly.`;
      updatedProjectIdea = `${updatedProjectIdea} ${userText}`.trim();
      setProjectIdea(updatedProjectIdea);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    setActiveTab('chat');
    initiateConversation();
  };

  const handleOpenRequest = (mentor: RecommendedMentor) => {
    setSelectedMentorForRequest({
      userId: mentor.userId || mentor.id,
      title: mentor.title,
      company: mentor.company,
      college: mentor.college || '',
      yearsExperience: mentor.yearsExperience || mentor.years_experience || 5,
      bio: '',
      skills: mentor.skills || [],
      technologies: mentor.technologies || [],
      mentoringTopics: mentor.mentoringTopics || [],
      availabilitySchedule: mentor.availabilitySchedule || mentor.availability_schedule || '',
      hourlyRate: 0,
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: mentor.rating || 5.0,
      reviewsCount: mentor.reviewsCount || mentor.reviews_count || 10,
      studentsHelpedCount: mentor.studentsHelpedCount || mentor.students_helped_count || 10,
      onboardingStep: 9,
      isCompleted: true,
      createdAt: '',
      updatedAt: '',
      user: (mentor.user as User) || {
        id: mentor.userId || mentor.id,
        fullName: mentor.fullName || mentor.full_name || mentor.title,
        avatarUrl: mentor.avatarUrl || mentor.avatar_url,
        headline: mentor.headline,
        role: 'MENTOR',
        status: 'ACTIVE',
        email: 'mentor@guidely.app',
        createdAt: '',
        updatedAt: ''
      }
    });
    setIsRequestModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '8px' : '20px'
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1120px',
          height: isMobile ? '98vh' : '90vh',
          maxHeight: isMobile ? '98vh' : '840px',
          backgroundColor: '#FFFFFF',
          borderRadius: isMobile ? '12px' : '16px',
          border: '1.5px solid #CBD5E1',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0F172A'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: isMobile ? '12px 14px' : '16px 22px',
            borderBottom: '1.5px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: isMobile ? '36px' : '42px',
                height: isMobile ? '36px' : '42px',
                borderRadius: '12px',
                backgroundColor: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                flexShrink: 0
              }}
            >
              <Bot size={isMobile ? 20 : 22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Guidely Mentor Advisor
                </h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Live Matcher
                </span>
              </div>
              {!isMobile && (
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Explain what you want to build and get paired with the best verified human mentor
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RefreshCw size={14} />}
              title="Reset conversation"
              style={{ color: '#475569' }}
            >
              {isMobile ? 'Reset' : 'Restart'}
            </Button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              borderBottom: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              flexShrink: 0
            }}
          >
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: activeTab === 'chat' ? '#FFFFFF' : 'transparent',
                borderBottom: activeTab === 'chat' ? '2.5px solid #4F46E5' : '2.5px solid transparent',
                color: activeTab === 'chat' ? '#4F46E5' : '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={15} />
              <span>Advisor Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: activeTab === 'mentors' ? '#FFFFFF' : 'transparent',
                borderBottom: activeTab === 'mentors' ? '2.5px solid #4F46E5' : '2.5px solid transparent',
                color: activeTab === 'mentors' ? '#4F46E5' : '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Users size={15} />
              <span>Matches ({recommendedMentors.length})</span>
            </button>
          </div>
        )}

        {/* Active Criteria Chips Bar */}
        {(projectIdea || targetTech.length > 0 || helpNeeded.length > 0) && (
          <div
            style={{
              padding: '6px 16px',
              backgroundColor: '#EEF2FF',
              borderBottom: '1px solid #C7D2FE',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338CA', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SlidersHorizontal size={11} /> Criteria:
            </span>
            {projectIdea && (
              <span
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#3730A3',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid #C7D2FE'
                }}
              >
                Vision: {projectIdea.slice(0, 30)}...
              </span>
            )}
            {targetTech.map(t => (
              <span
                key={t}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#3730A3',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid #C7D2FE'
                }}
              >
                {t}
              </span>
            ))}
            {helpNeeded.map(h => (
              <span
                key={h}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#3730A3',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid #C7D2FE'
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Main Content: Split Columns on Desktop, Single View on Mobile */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: 'row' }}>
          {/* Left: Chat Conversation (Visible on desktop or when activeTab === 'chat' on mobile) */}
          {(!isMobile || activeTab === 'chat') && (
            <div
              style={{
                flex: isMobile ? 1 : 1.15,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#F8FAFC',
                borderRight: !isMobile ? '1.5px solid #E2E8F0' : 'none',
                height: '100%',
                position: 'relative'
              }}
            >
              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: isMobile ? '14px 12px' : '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  backgroundColor: '#F8FAFC'
                }}
              >
                {messages.map((msg, index) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isBot ? 'flex-start' : 'flex-end',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px', maxWidth: isMobile ? '92%' : '85%' }}>
                        {isBot && (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              backgroundColor: '#4F46E5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              flexShrink: 0
                            }}
                          >
                            <Sparkles size={16} />
                          </div>
                        )}
                        <div
                          style={{
                            backgroundColor: isBot ? '#FFFFFF' : '#4F46E5',
                            color: isBot ? '#0F172A' : '#FFFFFF',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderTopLeftRadius: isBot ? '4px' : '16px',
                            borderTopRightRadius: isBot ? '16px' : '4px',
                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
                            border: isBot ? '1.5px solid #E2E8F0' : 'none',
                            fontSize: '0.92rem',
                            lineHeight: '1.5',
                            fontWeight: isBot ? 500 : 600
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>

                      {/* Interactive Clickable Options & Skip Button for latest bot message */}
                      {isBot && msg.options && index === messages.length - 1 && (
                        <div
                          style={{
                            marginTop: '10px',
                            marginLeft: isMobile ? '10px' : '42px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            maxWidth: '92%'
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {msg.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => handleSendMessage(opt)}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  border: '1.5px solid #4F46E5',
                                  color: '#4338CA',
                                  padding: '7px 14px',
                                  borderRadius: '999px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 1px 2px rgba(79, 70, 229, 0.1)'
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.backgroundColor = '#4F46E5';
                                  e.currentTarget.style.color = '#FFFFFF';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                  e.currentTarget.style.color = '#4338CA';
                                }}
                              >
                                <span>{opt}</span>
                                <ChevronRight size={13} />
                              </button>
                            ))}
                          </div>

                          {/* Skip Button */}
                          {msg.canSkip && (
                            <div style={{ marginTop: '4px' }}>
                              <button
                                onClick={handleSkipStep}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  border: '1.5px dashed #94A3B8',
                                  color: '#475569',
                                  padding: '6px 14px',
                                  borderRadius: '999px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.color = '#0F172A';
                                  e.currentTarget.style.borderColor = '#475569';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.color = '#475569';
                                  e.currentTarget.style.borderColor = '#94A3B8';
                                }}
                              >
                                <SkipForward size={13} />
                                <span>Skip this question / Not sure yet</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '4px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        backgroundColor: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <Bot size={16} />
                    </div>
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        padding: '8px 14px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                        Advisor is analyzing mentors...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Floating Mobile Matches Banner */}
              {isMobile && recommendedMentors.length > 0 && (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ECFDF5',
                    borderTop: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700 }}>
                    ⭐ {recommendedMentors.length} Mentors matched ({recommendedMentors[0]?.matchScore || 95}% top match)
                  </span>
                  <button
                    onClick={() => setActiveTab('mentors')}
                    style={{
                      background: '#10B981',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Matches →
                  </button>
                </div>
              )}

              {/* Text Input Row */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  padding: isMobile ? '10px 12px' : '14px 18px',
                  borderTop: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Explain what you want to build or ask questions..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={!inputText.trim()}
                  rightIcon={<Send size={15} />}
                >
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* Right: Live Recommended Mentors (Visible on desktop or when activeTab === 'mentors' on mobile) */}
          {(!isMobile || activeTab === 'mentors') && (
            <div
              style={{
                flex: isMobile ? 1 : 0.85,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                height: '100%',
                overflow: 'hidden'
              }}
            >
              {/* Recommendations Header */}
              <div
                style={{
                  padding: isMobile ? '12px 14px' : '16px 20px',
                  borderBottom: '1.5px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={16} color="#F59E0B" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Top Recommended Mentors ({recommendedMentors.length})
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Ranked by relevance to your answers
                  </p>
                </div>
                {isLoading && (
                  <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 700 }}>
                    Updating...
                  </span>
                )}
              </div>

              {/* Mentors Scrollable List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: isMobile ? '12px' : '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#F8FAFC'
                }}
              >
                {recommendedMentors.length === 0 ? (
                  <div
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#64748B',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <Bot size={36} color="#4F46E5" />
                    <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      Answer questions or explain what you want to build to see recommended mentors!
                    </p>
                  </div>
                ) : (
                  recommendedMentors.map(mentor => {
                    const matchScore = mentor.matchScore || 90;
                    const matchColor = matchScore >= 85 ? '#059669' : matchScore >= 70 ? '#4F46E5' : '#D97706';
                    return (
                      <Card
                        key={mentor.id}
                        padding="md"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)'
                        }}
                      >
                        {/* Top Row: Avatar & Match Badge */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar
                              name={mentor.fullName || mentor.full_name || mentor.title}
                              src={mentor.avatarUrl || mentor.avatar_url}
                              size="md"
                              isVerified
                              isOnline
                            />
                            <div>
                              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                {mentor.fullName || mentor.full_name}
                              </h4>
                              <p style={{ fontSize: '0.78rem', color: '#4F46E5', fontWeight: 700, margin: 0 }}>
                                {mentor.title}
                              </p>
                              <p style={{ fontSize: '0.74rem', color: '#64748B', margin: 0 }}>
                                {mentor.company}
                              </p>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div
                            style={{
                              backgroundColor: `${matchColor}15`,
                              color: matchColor,
                              border: `1px solid ${matchColor}40`,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0
                            }}
                          >
                            <Sparkles size={11} />
                            {mentor.matchScore}% Match
                          </div>
                        </div>

                        {/* Match Reasons */}
                        {mentor.matchReasons && mentor.matchReasons.length > 0 && (
                          <div
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '3px'
                            }}
                          >
                            {mentor.matchReasons.slice(0, 2).map((reason, ri) => (
                              <div key={ri} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <Check size={12} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 500, lineHeight: 1.3 }}>
                                  {reason}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Technology Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(mentor.technologies || []).slice(0, 4).map(tech => (
                            <span
                              key={tech}
                              style={{
                                backgroundColor: '#F1F5F9',
                                color: '#334155',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                border: '1px solid #E2E8F0'
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Bottom Action Bar */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #E2E8F0',
                            paddingTop: '8px',
                            marginTop: '2px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                              ⭐ {mentor.rating ? mentor.rating.toFixed(1) : '5.0'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              ({mentor.studentsHelpedCount || mentor.students_helped_count || 12} helped)
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                onClose();
                                onNavigate('mentor-profile', { mentorId: mentor.id });
                              }}
                              style={{ fontSize: '0.75rem', padding: '4px 9px', minHeight: '28px' }}
                            >
                              Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenRequest(mentor)}
                              style={{ fontSize: '0.75rem', padding: '4px 11px', minHeight: '28px' }}
                            >
                              Request
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mentorship Request Modal pre-filled from chat conversation */}
      {selectedMentorForRequest && (
        <MentorshipRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          mentor={selectedMentorForRequest}
          zIndex={10100}
          onSuccess={() => {
            setIsRequestModalOpen(false);
            onClose();
          }}
          initialValues={{
            projectTitle: projectIdea.trim(),
            projectDescription: projectIdea.trim()
              ? `I want to build: ${projectIdea.trim()}. Looking for mentor guidance on architecture, code quality, and implementation milestones.`
              : '',
            currentKnowledge: targetTech.length > 0 ? targetTech.join(', ') : '',
            techKnown: targetTech,
            helpNeeded: helpNeeded,
            preferredTimes: preferences || '',
            additionalMessage: preferences ? `Preferred mentor background: ${preferences}` : ''
          }}
        />
      )}
    </div>
  );
};
