import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWebSocket } from '../../context/WebSocketContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Conversation, Message } from '../../../../shared/types.js';
import { Button } from '../../components/ui/Button.js';
import { Avatar } from '../../components/ui/Avatar.js';
import { Input } from '../../components/ui/Input.js';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { WhatsAppMediaViewer } from '../../components/ui/WhatsAppMediaViewer.js';
import { MediaSaveButton } from '../../components/ui/MediaSaveButton.js';
import { getOptimizedCloudinaryUrl, getVideoPosterUrl, formatBytes } from '../../utils/cloudinary.js';
import {
  MessageSquare,
  Send,
  Search,
  Video,
  Check,
  CheckCheck,
  Paperclip,
  Play,
  Loader2,
  FileText
} from 'lucide-react';

export const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isConnected: _isConnected, sendTyping: _sendTyping, typingState: _typingState } = useWebSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // WhatsApp-style Media Lightbox Viewer state
  const [viewerMedia, setViewerMedia] = useState<{
    isOpen: boolean;
    url: string;
    title?: string;
    type?: 'image' | 'video' | 'raw';
    senderName?: string;
    timestamp?: string;
    size?: number;
  }>({
    isOpen: false,
    url: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = user?.role === 'STUDENT';

  const fetchConversations = async () => {
    setIsLoadingConvs(true);
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
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

  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      setIsLoadingMsgs(true);
      try {
        const res = await api.getMessages(activeConversationId);
        setMessages(res.messages || []);
        await api.markConversationRead(activeConversationId);
      } catch {
        // fallback
      } finally {
        setIsLoadingMsgs(false);
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = activeConversation
    ? isStudent ? activeConversation.mentor : activeConversation.student
    : undefined;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeConversationId) return;

    const currentText = textInput.trim();
    setTextInput('');

    try {
      const newMsg = await api.sendMessage(activeConversationId, { text: currentText });
      setMessages(prev => [...prev, newMsg]);

      // Update conversations list snippet
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            lastMessageText: currentText,
            lastMessageAt: new Date().toISOString()
          };
        }
        return c;
      }));
    } catch {
      // fallback
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    // Validate size (max 50MB for video, 10MB for image)
    const isVid = file.type.startsWith('video/');
    const maxSize = isVid ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('error', 'File Too Large', `Exceeds limit of ${(maxSize / (1024 * 1024)).toFixed(0)}MB for Cloudinary Free Tier.`);
      return;
    }

    setIsUploadingMedia(true);
    setUploadProgress(15);

    try {
      const uploadRes = await api.uploadMedia(file, 'messages', (pct) => {
        setUploadProgress(Math.max(15, pct));
      });

      const messageText = textInput.trim() || (isVid ? 'Shared a video demo' : 'Shared an image attachment');
      setTextInput('');

      const newMsg = await api.sendMessage(activeConversationId, {
        text: messageText,
        attachments: [
          {
            name: uploadRes.originalFilename || file.name,
            url: uploadRes.secureUrl || uploadRes.url,
            type: uploadRes.resourceType === 'video' ? 'video/mp4' : file.type,
            size: uploadRes.bytes || file.size
          }
        ]
      });

      setMessages(prev => [...prev, newMsg]);
      showToast('success', 'Media Sent', 'Uploaded to Cloudinary and shared in chat.');
    } catch (err: any) {
      showToast('error', 'Upload Failed', err.message || 'Could not upload attachment.');
    } finally {
      setIsUploadingMedia(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredConversations = conversations.filter(c => {
    const other = isStudent ? c.mentor : c.student;
    if (!searchQuery.trim()) return true;
    return other?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 140px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
      {/* Left Sidebar: Conversations List */}
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>Direct Messages</h2>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoadingConvs ? (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <LoadingSkeleton height="48px" />
              <LoadingSkeleton height="48px" />
              <LoadingSkeleton height="48px" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              No conversations found.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const other = isStudent ? conv.mentor : conv.student;
              const isActive = conv.id === activeConversationId;
              const unreadCount = isStudent ? conv.unreadStudentCount : conv.unreadMentorCount;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Avatar
                    name={other?.fullName || 'User'}
                    src={other?.avatarUrl}
                    size="md"
                    isOnline={true}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {other?.fullName}
                      </span>
                      {conv.lastMessageAt && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: unreadCount > 0 ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                      {conv.lastMessageText || 'Start conversation...'}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Active Chat Window */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-body)' }}>
        {activeConversation && otherParticipant ? (
          <>
            {/* Chat Top Header */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar
                  name={otherParticipant.fullName}
                  src={otherParticipant.avatarUrl}
                  size="md"
                  isOnline={true}
                />
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {otherParticipant.fullName}
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 600 }}>
                    Active • Mentorship Workspace
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`https://meet.jit.si/guidely-session-${activeConversation.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="secondary" leftIcon={<Video size={14} />}>
                    Start Video Call
                  </Button>
                </a>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isLoadingMsgs ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <LoadingSkeleton height="36px" width="40%" />
                  <LoadingSkeleton height="36px" width="55%" style={{ alignSelf: 'flex-end' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  Send a message to start collaborating!
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '72%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isMine ? 'var(--primary)' : '#FFFFFF',
                          color: isMine ? '#FFFFFF' : 'var(--text-main)',
                          padding: '9px 13px',
                          borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          border: isMine ? 'none' : '1px solid var(--border)',
                          boxShadow: 'var(--shadow-xs)',
                          fontSize: '0.88rem',
                          lineHeight: 1.45,
                          wordBreak: 'break-word'
                        }}
                      >
                        {/* WhatsApp-Style Shared Media Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: msg.text ? '8px' : 0 }}>
                            {msg.attachments.map((att, idx) => {
                              const isImg = att.type?.startsWith('image/') || att.url?.match(/\.(png|jpg|jpeg|webp|gif)($|\?)/i) || (!att.type?.includes('video') && !att.url?.includes('/video/'));
                              const isVid = att.type?.startsWith('video/') || att.url?.includes('/video/') || att.url?.match(/\.(mp4|webm)($|\?)/i);

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    position: 'relative',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: isMine ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                                    backgroundColor: isMine ? 'rgba(0,0,0,0.15)' : '#F8FAFC'
                                  }}
                                >
                                  {isImg ? (
                                    <div
                                      onClick={() => setViewerMedia({
                                        isOpen: true,
                                        url: att.url,
                                        title: att.name,
                                        type: 'image',
                                        senderName: msg.senderName,
                                        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        size: att.size
                                      })}
                                      style={{ cursor: 'pointer', textAlign: 'center' }}
                                    >
                                      <img
                                        src={getOptimizedCloudinaryUrl(att.url, { width: 440, quality: 'auto:good' })}
                                        alt={att.name}
                                        loading="lazy"
                                        decoding="async"
                                        style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                                      />
                                    </div>
                                  ) : isVid ? (
                                    <div
                                      onClick={() => setViewerMedia({
                                        isOpen: true,
                                        url: att.url,
                                        title: att.name,
                                        type: 'video',
                                        senderName: msg.senderName,
                                        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        size: att.size
                                      })}
                                      style={{ position: 'relative', cursor: 'pointer' }}
                                    >
                                      <img
                                        src={getVideoPosterUrl(att.url, 440)}
                                        alt={att.name}
                                        loading="lazy"
                                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block', backgroundColor: '#000' }}
                                      />
                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          width: '42px',
                                          height: '42px',
                                          borderRadius: '50%',
                                          backgroundColor: 'rgba(0,0,0,0.6)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#FFFFFF'
                                        }}
                                      >
                                        <Play size={20} fill="#FFFFFF" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <FileText size={20} />
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{att.name}</div>
                                        <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{formatBytes(att.size)}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* WhatsApp-Style Save to Device / Gallery overlay button */}
                                  <div
                                    style={{
                                      position: 'absolute',
                                      bottom: '6px',
                                      right: '6px',
                                      zIndex: 3
                                    }}
                                  >
                                    <MediaSaveButton
                                      mediaUrl={att.url}
                                      filename={att.name}
                                      fileSizeBytes={att.size}
                                      variant="iconOnly"
                                      size="sm"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {msg.text}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && (
                          msg.isRead ? <CheckCheck size={12} color="var(--primary)" /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {/* Attachment Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleAttachFile}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingMedia}
                title="Attach photo or video to chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: isUploadingMedia ? 'not-allowed' : 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isUploadingMedia ? (
                  <Loader2 size={18} className="animate-spin" color="var(--primary)" />
                ) : (
                  <Paperclip size={18} />
                )}
              </button>

              <Input
                placeholder={isUploadingMedia ? `Uploading to Cloudinary (${uploadProgress}%)...` : `Message ${otherParticipant.fullName.split(' ')[0]}...`}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isUploadingMedia}
              />

              <Button type="submit" variant="primary" disabled={!textInput.trim() || isUploadingMedia}>
                <Send size={15} />
              </Button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={<MessageSquare size={32} />}
            title="Select a Conversation"
            description="Choose a student or mentor from the list on the left to start messaging."
            style={{ margin: 'auto' }}
          />
        )}
      </div>

      {/* WhatsApp Fullscreen Media Lightbox Viewer */}
      <WhatsAppMediaViewer
        isOpen={viewerMedia.isOpen}
        onClose={() => setViewerMedia(prev => ({ ...prev, isOpen: false }))}
        mediaUrl={viewerMedia.url}
        mediaType={viewerMedia.type}
        title={viewerMedia.title}
        senderName={viewerMedia.senderName}
        timestamp={viewerMedia.timestamp}
        fileSizeBytes={viewerMedia.size}
      />
    </div>
  );
};
