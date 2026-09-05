import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { RecommendedMentor, MentorRecommendationCriteria, MentorProfile, User } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Input } from '../../components/ui/Input.js';
import { MentorshipRequestModal } from '../mentorship/MentorshipRequestModal.js';
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  X,
  CheckCircle2,
  ArrowRight,
  Star,
  Building,
  GraduationCap,
  Clock,
  ShieldCheck,
  ChevronRight,
  SkipForward,
  HelpCircle,
  MessageSquare,
  Flame,
  Check
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
        text: "👋 Hi there! I'm your Guidely Mentor Advisor. My job is to understand what you want to build and match you with the best verified human engineering leads & professors. You can answer my simple questions, or feel free to skip any question you're unsure about!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setTimeout(() => {
      initialMsgs.push({
        id: 'msg_step_1',
        sender: 'bot',
        text: "Step 1: What kind of project or system do you want to build?",
        options: [
          'Distributed Fault-Tolerant Task Queue',
          'AI / Deep Learning Computer Vision Classifier',
          'Full-Stack Collaborative Web Platform',
          'Cyber Threat Intelligence & SOC Anomaly Detector',
          'Cloud Architecture & DevOps CI/CD Pipeline',
          'Mobile App with React Native & Expo'
        ],
        canSkip: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setMessages(initialMsgs);
      setIsTyping(false);
      fetchRecommendations({ projectIdea, targetTechnologies: targetTech, helpNeededAreas: helpNeeded, preferences });
    }, 600);
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

    // Process answer based on step or freeform
    setTimeout(() => {
      processNextStep(text, false);
    }, 700);
  };

  const handleSkipStep = () => {
    const skipMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: '⏭️ Skipped this question',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, skipMsg]);
    setIsTyping(true);

    setTimeout(() => {
      processNextStep('', true);
    }, 600);
  };

  const processNextStep = (userText: string, skipped: boolean) => {
    let nextStep = currentStep + 1;
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
        botReply = `Got it! "${userText}" sounds like an awesome project vision. Next, what tech stack or tools are you planning to use (or interested in learning)?`;
      } else {
        botReply = "No worries at all! Mentors can help you brainstorm project ideas. Which programming languages or tools are you interested in working with?";
      }
      nextOptions = [
        'Go (Golang)',
        'Python & PyTorch',
        'React / Next.js & TypeScript',
        'Docker & Kubernetes',
        'Node.js & Express',
        'AWS Cloud & Linux',
        'Cyber Security & Forensics Tools'
      ];
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!skipped && userText) {
        updatedTech = Array.from(new Set([...updatedTech, userText]));
        setTargetTech(updatedTech);
        botReply = `Great choice with ${userText}! Now, where do you anticipate needing the most guidance or unblocking?`;
      } else {
        botReply = "No problem! We'll recommend mentors with broad architectural experience. Where do you need the most mentorship guidance?";
      }
      nextOptions = [
        'Architecture & High-Level System Design',
        'Concurrency, Multithreading & Performance',
        'Research Guidance & Paper Writing',
        '1-on-1 Code Reviews & Clean Architecture',
        'CI/CD Pipelines & Cloud Deployment',
        '0-to-1 Project Discovery & Roadmap'
      ];
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!skipped && userText) {
        updatedHelp = Array.from(new Set([...updatedHelp, userText]));
        setHelpNeeded(updatedHelp);
        botReply = `Understood! Guidance in ${userText} is crucial for milestone success. Lastly, do you have any specific mentor background preferences?`;
      } else {
        botReply = "Totally fine! Your mentor will start with a 0-to-1 discovery session. Any mentor background preferences?";
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
        botReply = `Noted your preference for ${userText}! I've matched your profile against our verified mentors. Take a look at your top recommended mentors below!`;
      } else {
        botReply = "Perfect! I've synthesized all your project needs and ranked our verified mentors by relevance. Here are the top engineers ready to guide you!";
      }
      nextOptions = undefined;
      canSkip = false;
      setCurrentStep(5);
    } else {
      // Conversational follow-ups after wizard
      botReply = `Thanks for sharing! I've recalibrated your recommendations based on "${userText}". Check the updated list below or feel free to request mentorship directly.`;
      // Update criteria keywords
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1080px',
          height: '90vh',
          maxHeight: '820px',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Chatbot Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
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
                    color: '#10B981',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Live Matcher
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Explain what you want to build and discover the right human engineering mentor
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RefreshCw size={14} />}
              title="Reset conversation"
            >
              Restart
            </Button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chatbot Split Body: Left Chat, Right Recommended Mentors */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: 'row' }}>
          {/* Left: Chat Conversation (60% width) */}
          <div
            style={{
              flex: 1.1,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid var(--border)',
              backgroundColor: 'var(--surface)'
            }}
          >
            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
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
                      alignItems: isBot ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '88%' }}>
                      {isBot && (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--primary)',
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
                          backgroundColor: isBot ? 'var(--bg-subtle)' : 'var(--primary)',
                          color: isBot ? 'var(--text-main)' : '#FFFFFF',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          borderTopLeftRadius: isBot ? '4px' : '16px',
                          borderTopRightRadius: isBot ? '16px' : '4px',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '0.9rem',
                          lineHeight: '1.45'
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
                          marginLeft: '42px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          maxWidth: '85%'
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {msg.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleSendMessage(opt)}
                              style={{
                                backgroundColor: 'var(--surface)',
                                border: '1.5px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.backgroundColor = 'var(--primary)';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.backgroundColor = 'var(--surface)';
                                e.currentTarget.style.color = 'var(--primary)';
                              }}
                            >
                              <span>{opt}</span>
                              <ChevronRight size={12} />
                            </button>
                          ))}
                        </div>

                        {/* Skip Button */}
                        {msg.canSkip && (
                          <div style={{ marginTop: '4px' }}>
                            <button
                              onClick={handleSkipStep}
                              style={{
                                backgroundColor: 'transparent',
                                border: '1px dashed var(--border)',
                                color: 'var(--text-muted)',
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.color = 'var(--text-main)';
                                e.currentTarget.style.borderColor = 'var(--text-muted)';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.borderColor = 'var(--border)';
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
                      backgroundColor: 'var(--primary)',
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
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '8px 14px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Advisor is analyzing mentors...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '14px 18px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Explain what you want to build or ask any question..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-main)',
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

          {/* Right: Live Recommended Mentors (40% width) */}
          <div
            style={{
              flex: 0.9,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-subtle)',
              overflow: 'hidden'
            }}
          >
            {/* Recommendations Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} color="#F59E0B" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Recommended Mentors ({recommendedMentors.length})
                  </h4>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Live ranked by relevance to your answers
                </p>
              </div>
              {isLoading && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Updating...
                </span>
              )}
            </div>

            {/* Mentor Cards List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {recommendedMentors.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Bot size={36} color="var(--primary)" />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    Answer questions or type what you want to build to see recommended mentors!
                  </p>
                </div>
              ) : (
                recommendedMentors.map(mentor => {
                  const matchColor = mentor.matchScore >= 85 ? '#10B981' : mentor.matchScore >= 70 ? '#6366F1' : '#F59E0B';
                  return (
                    <Card
                      key={mentor.id}
                      padding="md"
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: 'var(--shadow-sm)'
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
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                              {mentor.fullName || mentor.full_name}
                            </h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>
                              {mentor.title}
                            </p>
                            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: 0 }}>
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

                      {/* Why Recommended / Match Reasons */}
                      {mentor.matchReasons && mentor.matchReasons.length > 0 && (
                        <div
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px'
                          }}
                        >
                          {mentor.matchReasons.slice(0, 2).map((reason, ri) => (
                            <div key={ri} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <Check size={12} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.3 }}>
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
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-secondary)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600
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
                          borderTop: '1px solid var(--border)',
                          paddingTop: '8px',
                          marginTop: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            ⭐ {mentor.rating ? mentor.rating.toFixed(1) : '5.0'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
                            style={{ fontSize: '0.75rem', padding: '4px 8px', minHeight: '28px' }}
                          >
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenRequest(mentor)}
                            style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '28px' }}
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
        </div>
      </div>

      {/* Mentorship Request Modal pre-filled from chat conversation */}
      {selectedMentorForRequest && (
        <MentorshipRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          mentor={selectedMentorForRequest}
          onSuccess={() => {
            setIsRequestModalOpen(false);
            onClose();
          }}
          initialValues={{
            projectTitle: projectIdea || 'Distributed Fault-Tolerant Task Queue in Go',
            projectDescription: projectIdea
              ? `I want to build: ${projectIdea}. Looking for mentor guidance on architecture, code quality, and implementation milestones.`
              : 'Building a high-throughput project and seeking mentor guidance on system design and milestone roadmap.',
            techKnown: targetTech.length > 0 ? targetTech : ['Go', 'Docker', 'Linux'],
            helpNeeded: helpNeeded.length > 0 ? helpNeeded : ['Architecture & System Design', 'Code Reviews']
          }}
        />
      )}
    </div>
  );
};
