import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Conversation, Message } from '../../../../shared/types.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Input } from '../../components/ui/Input.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Check,
  CheckCheck,
  Phone,
  Video,
  FileText,
  Clock
} from 'lucide-react';

export const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const { onlineUsers, latestMessage, typingState, sendTyping, sendReadReceipt } = useWebSocket();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await api.getMessages(activeConvId);
        setMessages(res.messages);
      } catch {
        // fallback
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConvId]);

  // Listen for incoming WebSocket messages
  useEffect(() => {
    if (latestMessage) {
      if (latestMessage.conversationId === activeConvId) {
        setMessages(prev => [...prev, latestMessage.message]);
        if (activeConvId && user) {
          api.markConversationRead(activeConvId);
        }
      }
      fetchConversations();
    }
  }, [latestMessage, activeConvId, user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConvId);
  const partner = user?.role === 'STUDENT' ? activeConversation?.mentor : activeConversation?.student;
  const partnerId = user?.role === 'STUDENT' ? activeConversation?.mentorId : activeConversation?.studentId;
  const isPartnerOnline = partnerId ? onlineUsers.has(partnerId) : false;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const sentMsg = await api.sendMessage(activeConvId, { text });
      setMessages(prev => [...prev, sentMsg]);
      fetchConversations();
    } catch (err: any) {
      showToast('error', 'Send Failed', err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (partnerId && activeConvId) {
      sendTyping(partnerId, activeConvId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        sendTyping(partnerId, activeConvId, false);
      }, 2000);
    }
  };

  const isTyping = activeConvId && typingState[activeConvId]?.isTyping;

  const filteredConversations = conversations.filter(c => {
    const p = user?.role === 'STUDENT' ? c.mentor : c.student;
    return p?.fullName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
           c.lastMessageText?.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div
      style={{
        height: 'calc(100vh - var(--header-height) - 70px)',
        minHeight: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        overflow: 'hidden'
      }}
      className="messaging-container animate-fade-in"
    >
      {/* Left Sidebar: Conversations List */}
      <div
        style={{
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Search header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            Messages
          </h2>
          <Input
            placeholder="Search chats..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoadingConvs ? (
            <div style={{ padding: '16px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No active conversations yet.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const p = user?.role === 'STUDENT' ? conv.mentor : conv.student;
              const pId = user?.role === 'STUDENT' ? conv.mentorId : conv.studentId;
              const isOnline = pId ? onlineUsers.has(pId) : false;
              const isActive = conv.id === activeConvId;
              const unreadCount = user?.role === 'STUDENT' ? conv.unreadStudentCount : conv.unreadMentorCount;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Avatar name={p?.fullName || 'User'} src={p?.avatarUrl} size="md" isOnline={isOnline} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p?.fullName}
                      </span>
                      {conv.lastMessageAt && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: unreadCount > 0 ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {conv.lastMessageText || 'No messages yet'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Chat Window */}
      {activeConversation ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Chat Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar name={partner?.fullName || 'User'} src={partner?.avatarUrl} size="md" isOnline={isPartnerOnline} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {partner?.fullName}
                </h4>
                <span style={{ fontSize: '0.78rem', color: isPartnerOnline ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {isPartnerOnline ? '● Online now' : '○ Offline'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="sm" variant="secondary" leftIcon={<Video size={16} />} onClick={() => showToast('info', 'Video Room', 'Launch via Sessions tab for recording support.')}>
                Video Call
              </Button>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-body)' }}>
            {isLoadingMessages ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading chat history...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Say hello to your {user?.role === 'STUDENT' ? 'mentor' : 'student'} to begin collaborating!
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      alignSelf: isMine ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isMine && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px', marginLeft: '4px', fontWeight: 600 }}>
                        {msg.senderName || 'Mentor'}
                      </span>
                    )}

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        backgroundColor: isMine ? 'var(--primary)' : '#FFFFFF',
                        color: isMine ? '#FFFFFF' : 'var(--text-main)',
                        border: isMine ? 'none' : '1px solid var(--border)',
                        boxShadow: 'var(--shadow-xs)',
                        fontSize: '0.92rem',
                        lineHeight: 1.45,
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.text}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && <CheckCheck size={13} color="var(--primary)" />}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                <span className="typing-dot">●</span>
                <span>{partner?.fullName} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputText}
              onChange={handleInputChange}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            />
            <Button type="submit" variant="primary" style={{ borderRadius: 'var(--radius-full)', padding: '10px 18px' }} rightIcon={<Send size={15} />}>
              Send
            </Button>
          </form>
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare size={36} />}
          title="No Conversation Selected"
          description="Select a conversation from the sidebar to chat in real time."
        />
      )}
    </div>
  );
};
