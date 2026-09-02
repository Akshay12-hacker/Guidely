import crypto from 'crypto';
import { ISessionRepository } from './session.repository.js';
import { UserModel, NotificationModel } from '../../infrastructure/database/models/index.js';
import { WebSocketManager } from '../../infrastructure/websocket/wsServer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { MentorshipSession, SessionStatus } from '../../shared/types.js';

export class SessionService {
  private ws = WebSocketManager.getInstance();

  constructor(private sessionRepo: ISessionRepository) {}

  async requestSession(studentId: string, data: {
    mentorId: string;
    projectId?: string;
    title: string;
    agenda: string;
    scheduledAt: string;
    durationMinutes?: number;
  }): Promise<MentorshipSession> {
    const sessionId = 'ses_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const meetingRoom = 'guidely-' + crypto.randomUUID().slice(0, 8);
    const meetingUrl = `https://meet.jit.si/${meetingRoom}`;
    const now = new Date().toISOString();

    const session: MentorshipSession = {
      id: sessionId,
      studentId,
      mentorId: data.mentorId,
      projectId: data.projectId,
      title: data.title,
      agenda: data.agenda,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes || 45,
      status: 'REQUESTED',
      meetingUrl,
      createdAt: now,
      updatedAt: now
    };

    const saved = await this.sessionRepo.create(session);

    // Get student name for alert
    const student = await UserModel.findById(studentId).lean();
    const studentName = student?.fullName || 'A student';

    // Notification to mentor
    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: data.mentorId,
      title: 'Session Requested',
      message: `${studentName} requested a 1-on-1 mentoring session: "${data.title}"`,
      type: 'SESSION_REQUESTED',
      link: `/mentor/sessions`,
      isRead: false
    });

    this.ws.sendToUser(data.mentorId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'Session Requested',
        message: `${studentName} requested a 1-on-1 mentoring session: "${data.title}"`,
        type: 'SESSION_REQUESTED',
        link: '/mentor/sessions',
        createdAt: now
      }
    });

    return (await this.sessionRepo.findById(sessionId)) || saved;
  }

  async getStudentSessions(studentId: string): Promise<MentorshipSession[]> {
    return this.sessionRepo.findByStudentId(studentId);
  }

  async getMentorSessions(mentorId: string): Promise<MentorshipSession[]> {
    return this.sessionRepo.findByMentorId(mentorId);
  }

  async getSessionById(sessionId: string, userId: string): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw AppError.notFound('Session not found');
    if (session.studentId !== userId && session.mentorId !== userId) {
      throw AppError.forbidden('Unauthorized to access this session');
    }
    return session;
  }

  async confirmSession(mentorId: string, sessionId: string, meetingUrl?: string): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw AppError.notFound('Session not found');
    if (session.mentorId !== mentorId) throw AppError.forbidden('Unauthorized');

    const updated = await this.sessionRepo.updateStatus(sessionId, 'CONFIRMED', meetingUrl || session.meetingUrl);
    const now = new Date().toISOString();

    const mentor = await UserModel.findById(mentorId).lean();
    const mentorName = mentor?.fullName || 'Your mentor';

    // Notification to student
    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: session.studentId,
      title: 'Session Confirmed 📅',
      message: `${mentorName} confirmed your mentoring session on ${new Date(session.scheduledAt).toLocaleString()}`,
      type: 'SESSION_CONFIRMED',
      link: `/student/sessions`,
      isRead: false
    });

    this.ws.sendToUser(session.studentId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'Session Confirmed 📅',
        message: `${mentorName} confirmed your mentoring session on ${new Date(session.scheduledAt).toLocaleString()}`,
        type: 'SESSION_CONFIRMED',
        link: '/student/sessions',
        createdAt: now
      }
    });

    return updated!;
  }

  async rescheduleSession(userId: string, sessionId: string, newScheduledAt: string): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw AppError.notFound('Session not found');
    if (session.studentId !== userId && session.mentorId !== userId) throw AppError.forbidden('Unauthorized');

    const updated = await this.sessionRepo.reschedule(sessionId, newScheduledAt);
    const now = new Date().toISOString();
    const recipientId = session.studentId === userId ? session.mentorId : session.studentId;

    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: recipientId,
      title: 'Session Rescheduled',
      message: `Mentoring session "${session.title}" was rescheduled to ${new Date(newScheduledAt).toLocaleString()}`,
      type: 'SESSION_RESCHEDULED',
      link: session.studentId === recipientId ? '/student/sessions' : '/mentor/sessions',
      isRead: false
    });

    this.ws.sendToUser(recipientId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'Session Rescheduled',
        message: `Mentoring session "${session.title}" was rescheduled to ${new Date(newScheduledAt).toLocaleString()}`,
        type: 'SESSION_RESCHEDULED',
        link: session.studentId === recipientId ? '/student/sessions' : '/mentor/sessions',
        createdAt: now
      }
    });

    return updated!;
  }

  async cancelSession(userId: string, sessionId: string, reason?: string): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw AppError.notFound('Session not found');
    if (session.studentId !== userId && session.mentorId !== userId) throw AppError.forbidden('Unauthorized');

    const updated = await this.sessionRepo.updateStatus(sessionId, 'CANCELLED');
    const now = new Date().toISOString();
    const recipientId = session.studentId === userId ? session.mentorId : session.studentId;

    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: recipientId,
      title: 'Session Cancelled',
      message: `Mentoring session "${session.title}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'SESSION_CANCELLED',
      link: session.studentId === recipientId ? '/student/sessions' : '/mentor/sessions',
      isRead: false
    });

    this.ws.sendToUser(recipientId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'Session Cancelled',
        message: `Mentoring session "${session.title}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'SESSION_CANCELLED',
        link: session.studentId === recipientId ? '/student/sessions' : '/mentor/sessions',
        createdAt: now
      }
    });

    return updated!;
  }

  async completeSession(mentorId: string, sessionId: string, sessionNotes: string): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw AppError.notFound('Session not found');
    if (session.mentorId !== mentorId) throw AppError.forbidden('Unauthorized');

    const updated = await this.sessionRepo.updateStatus(sessionId, 'COMPLETED', undefined, sessionNotes);
    const now = new Date().toISOString();

    // Notify student to leave review/feedback
    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: session.studentId,
      title: 'Session Completed! How was your experience?',
      message: `Session "${session.title}" has finished. Please share your feedback and review.`,
      type: 'REVIEW_RECEIVED',
      link: `/student/sessions`,
      isRead: false
    });

    this.ws.sendToUser(session.studentId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'Session Completed! How was your experience?',
        message: `Session "${session.title}" has finished. Please share your feedback and review.`,
        type: 'REVIEW_RECEIVED',
        link: '/student/sessions',
        createdAt: now
      }
    });

    return updated!;
  }

  async submitFeedback(studentId: string, sessionId: string, feedback: string, rating: number): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw AppError.notFound('Session not found');
    if (session.studentId !== studentId) throw AppError.forbidden('Unauthorized');

    const updated = await this.sessionRepo.addFeedback(sessionId, feedback, rating);
    return updated!;
  }
}
