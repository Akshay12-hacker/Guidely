import crypto from 'crypto';
import { IMentorshipRepository } from './mentorship.repository.js';
import {
  UserModel,
  NotificationModel,
  ProjectModel,
  ConversationModel,
  MessageModel,
  MentorProfileModel
} from '../../infrastructure/database/models/index.js';
import { WebSocketManager } from '../../infrastructure/websocket/wsServer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { MentorshipRequest, MentorshipRequestStatus } from '../../shared/types.js';

export class MentorshipService {
  private ws = WebSocketManager.getInstance();

  constructor(private mentorshipRepo: IMentorshipRepository) {}

  async createRequest(studentId: string, data: {
    mentorId: string;
    projectTitle: string;
    projectDescription: string;
    currentKnowledge: string;
    techKnown: string[];
    helpNeeded: string[];
    expectedOutcome: string;
    preferredTimes: string;
    additionalMessage?: string;
  }): Promise<MentorshipRequest> {
    const requestId = 'req_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    const request: MentorshipRequest = {
      id: requestId,
      studentId,
      mentorId: data.mentorId,
      projectTitle: data.projectTitle,
      projectDescription: data.projectDescription,
      currentKnowledge: data.currentKnowledge,
      techKnown: data.techKnown,
      helpNeeded: data.helpNeeded,
      expectedOutcome: data.expectedOutcome,
      preferredTimes: data.preferredTimes,
      additionalMessage: data.additionalMessage,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    };

    const saved = await this.mentorshipRepo.create(request);

    // Get student details for notification
    const student = await UserModel.findById(studentId).lean();
    const studentName = student?.fullName || 'A student';

    // Dispatch notification to mentor
    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: data.mentorId,
      title: 'New Mentorship Request',
      message: `${studentName} requested mentorship for project: "${data.projectTitle}"`,
      type: 'REQUEST_RECEIVED',
      link: `/mentor/requests`,
      isRead: false
    });

    this.ws.sendToUser(data.mentorId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'New Mentorship Request',
        message: `${studentName} requested mentorship for project: "${data.projectTitle}"`,
        type: 'REQUEST_RECEIVED',
        link: '/mentor/requests',
        createdAt: now
      }
    });

    return (await this.mentorshipRepo.findById(requestId)) || saved;
  }

  async getStudentRequests(studentId: string): Promise<MentorshipRequest[]> {
    return this.mentorshipRepo.findByStudentId(studentId);
  }

  async getMentorRequests(mentorId: string): Promise<MentorshipRequest[]> {
    return this.mentorshipRepo.findByMentorId(mentorId);
  }

  async getRequestById(id: string, userId: string): Promise<MentorshipRequest> {
    const request = await this.mentorshipRepo.findById(id);
    if (!request) {
      throw AppError.notFound('Mentorship request not found');
    }
    if (request.studentId !== userId && request.mentorId !== userId) {
      throw AppError.forbidden('You are not authorized to view this request');
    }
    return request;
  }

  async respondToRequest(
    mentorId: string,
    requestId: string,
    action: 'ACCEPT' | 'REJECT' | 'REQUEST_INFO',
    notes?: string
  ): Promise<MentorshipRequest> {
    const request = await this.mentorshipRepo.findById(requestId);
    if (!request) throw AppError.notFound('Mentorship request not found');
    if (request.mentorId !== mentorId) throw AppError.forbidden('Unauthorized to respond to this request');

    let newStatus: MentorshipRequestStatus;
    if (action === 'ACCEPT') newStatus = 'ACCEPTED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else newStatus = 'INFO_REQUESTED';

    const updated = await this.mentorshipRepo.updateStatus(requestId, newStatus, notes);
    const now = new Date().toISOString();
    const mentor = await UserModel.findById(mentorId).lean();
    const mentorName = mentor?.fullName || 'Your mentor';

    // If accepted: create collaborative workspace project & initialize conversation
    if (action === 'ACCEPT') {
      const existingProject = await ProjectModel.findOne({
        studentId: request.studentId,
        title: request.projectTitle
      }).lean();

      let projectId = existingProject?._id;

      if (!projectId) {
        projectId = 'proj_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const goal1Id = 'goal_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const milestone1Id = 'mile_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        await ProjectModel.create({
          _id: projectId,
          title: request.projectTitle,
          description: request.projectDescription,
          category: 'CSE Capstone',
          targetTechnologies: request.techKnown,
          currentStage: 'PLANNING',
          studentId: request.studentId,
          mentorId,
          progressPercentage: 10,
          status: 'IN_PROGRESS',
          goals: [
            {
              id: goal1Id,
              projectId,
              title: 'System Architecture & Tech Stack Finalization',
              description: 'Agree upon tools, database, and repository structure with mentor',
              isCompleted: false,
              orderIndex: 1,
              createdAt: now
            }
          ],
          milestones: [
            {
              id: milestone1Id,
              projectId,
              title: 'Milestone 1: Project Setup & Core Prototype',
              description: 'Repository initialization, initial API models, and local test environment',
              status: 'IN_PROGRESS',
              orderIndex: 1,
              createdAt: now
            }
          ],
          tasks: [],
          resources: [],
          notes: []
        });
      } else {
        await ProjectModel.findByIdAndUpdate(projectId, {
          mentorId,
          status: 'IN_PROGRESS'
        });
      }

      // Ensure conversation exists
      const existingConv = await ConversationModel.findOne({
        studentId: request.studentId,
        mentorId
      }).lean();

      if (!existingConv) {
        const convId = 'conv_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const msgId = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        await ConversationModel.create({
          _id: convId,
          studentId: request.studentId,
          mentorId,
          lastMessageId: msgId,
          lastMessageText: 'Mentorship request accepted! Let us start working on your project.',
          lastMessageAt: now,
          unreadStudentCount: 1,
          unreadMentorCount: 0
        });

        await MessageModel.create({
          _id: msgId,
          conversationId: convId,
          senderId: mentorId,
          senderRole: 'MENTOR',
          senderName: mentorName,
          text: `Hi! I'm thrilled to mentor you on "${request.projectTitle}". Let's discuss your project goals and schedule our kickoff session!`,
          isRead: false
        });
      }

      // Increment mentor's students helped count
      await MentorProfileModel.findOneAndUpdate(
        { userId: mentorId },
        { $inc: { studentsHelpedCount: 1 } }
      );
    }

    // Send notification to student
    const notifTitle = action === 'ACCEPT' 
      ? 'Mentorship Accepted! 🎉' 
      : action === 'REJECT' 
      ? 'Mentorship Request Update' 
      : 'Mentor Requested More Information';

    const notifMsg = action === 'ACCEPT'
      ? `${mentorName} accepted your mentorship request for "${request.projectTitle}". Your project workspace is ready!`
      : action === 'REJECT'
      ? `${mentorName} was unable to accept your request at this time.${notes ? ` Note: ${notes}` : ''}`
      : `${mentorName} requested additional details: "${notes || ''}"`;

    const notifLink = action === 'ACCEPT' ? `/student/project` : `/student/requests`;

    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: request.studentId,
      title: notifTitle,
      message: notifMsg,
      type: action === 'ACCEPT' ? 'REQUEST_ACCEPTED' : 'REQUEST_INFO',
      link: notifLink,
      isRead: false
    });

    this.ws.sendToUser(request.studentId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: notifTitle,
        message: notifMsg,
        type: action === 'ACCEPT' ? 'REQUEST_ACCEPTED' : 'REQUEST_INFO',
        link: notifLink,
        createdAt: now
      }
    });

    return updated!;
  }

  async provideAdditionalInfo(studentId: string, requestId: string, additionalMessage: string): Promise<MentorshipRequest> {
    const request = await this.mentorshipRepo.findById(requestId);
    if (!request) throw AppError.notFound('Mentorship request not found');
    if (request.studentId !== studentId) throw AppError.forbidden('Unauthorized');

    const updated = await this.mentorshipRepo.updateStudentInfo(requestId, additionalMessage);
    const now = new Date().toISOString();

    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: request.mentorId,
      title: 'Additional Info Provided',
      message: `Student provided details for: "${request.projectTitle}"`,
      type: 'REQUEST_INFO',
      link: `/mentor/requests`,
      isRead: false
    });

    this.ws.sendToUser(request.mentorId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'Additional Info Provided',
        message: `Student provided details for: "${request.projectTitle}"`,
        type: 'REQUEST_INFO',
        link: '/mentor/requests',
        createdAt: now
      }
    });

    return updated!;
  }
}
