import crypto from 'crypto';
import { IAdminRepository } from './admin.repository.js';
import { NotificationModel, ReportModel } from '../../infrastructure/database/models/index.js';
import { WebSocketManager } from '../../infrastructure/websocket/wsServer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ReportType } from '../../shared/types.js';

export class AdminService {
  private ws = WebSocketManager.getInstance();

  constructor(private adminRepo: IAdminRepository) {}

  async getOverview() {
    return this.adminRepo.getAnalytics();
  }

  async getUsers(filters: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    const { users, total } = await this.adminRepo.getUsers({
      search: filters.search,
      role: filters.role,
      status: filters.status,
      limit,
      offset
    });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const user = await this.adminRepo.updateUserStatus(userId, status);
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async getPendingVerifications() {
    return this.adminRepo.getPendingMentorVerifications();
  }

  async verifyMentor(userId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
    const profile = await this.adminRepo.verifyMentor(userId, status, notes);
    if (!profile) throw AppError.notFound('Mentor profile not found');

    const notifTitle = status === 'APPROVED' ? 'Mentor Verification Approved! 🎉' : 'Mentor Verification Update';
    const notifMsg = status === 'APPROVED'
      ? 'Congratulations! Your mentor profile has been verified and badged.'
      : `Your verification request was not approved.${notes ? ` Note: ${notes}` : ''}`;

    const now = new Date().toISOString();
    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId,
      title: notifTitle,
      message: notifMsg,
      type: status === 'APPROVED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
      link: '/mentor/profile',
      isRead: false
    });

    this.ws.sendToUser(userId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: notifTitle,
        message: notifMsg,
        type: status === 'APPROVED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
        link: '/mentor/profile',
        createdAt: now
      }
    });

    return profile;
  }

  async getReports() {
    return this.adminRepo.getReports();
  }

  async createReport(reporterId: string, data: {
    reportedUserId?: string;
    reportType: ReportType;
    reason: string;
    details: string;
  }) {
    const reportId = 'rep_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    await ReportModel.create({
      _id: reportId,
      reporterId,
      reportedUserId: data.reportedUserId,
      reportType: data.reportType,
      reason: data.reason,
      details: data.details,
      status: 'PENDING'
    });

    return { id: reportId, status: 'PENDING', createdAt: now };
  }

  async resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNotes?: string) {
    const report = await this.adminRepo.resolveReport(reportId, status, adminNotes);
    if (!report) throw AppError.notFound('Report not found');
    return report;
  }

  async getReviewsForModeration() {
    return this.adminRepo.getReviewsForModeration();
  }

  async moderateReview(reviewId: string, isApproved: boolean) {
    return this.adminRepo.moderateReview(reviewId, isApproved);
  }
}
