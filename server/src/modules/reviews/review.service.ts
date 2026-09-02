import crypto from 'crypto';
import { IReviewRepository } from './review.repository.js';
import { ProjectModel, UserModel, NotificationModel } from '../../infrastructure/database/models/index.js';
import { WebSocketManager } from '../../infrastructure/websocket/wsServer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { Review } from '../../shared/types.js';

export class ReviewService {
  private ws = WebSocketManager.getInstance();

  constructor(private reviewRepo: IReviewRepository) {}

  async getMentorReviews(mentorId: string): Promise<Review[]> {
    return this.reviewRepo.findByMentorId(mentorId);
  }

  async submitReview(studentId: string, data: {
    mentorId: string;
    projectId?: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw AppError.badRequest('Rating must be between 1 and 5');
    }

    const hasAlready = await this.reviewRepo.hasReviewed(studentId, data.mentorId, data.projectId);
    if (hasAlready) {
      throw AppError.conflict('You have already submitted a review for this mentorship');
    }

    // Check if verified mentorship exists between student and mentor
    const projectQuery: any = { studentId, mentorId: data.mentorId };
    if (data.projectId) projectQuery._id = data.projectId;

    const project = await ProjectModel.findOne(projectQuery).lean();

    const isVerified = !!project;
    const reviewId = 'rev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    const review: Review = {
      id: reviewId,
      studentId,
      mentorId: data.mentorId,
      projectId: data.projectId,
      rating: data.rating,
      comment: data.comment,
      isVerifiedMentorship: isVerified,
      isApproved: true,
      createdAt: now
    };

    const saved = await this.reviewRepo.create(review);

    // Notify mentor
    const student = await UserModel.findById(studentId).lean();
    const studentName = student?.fullName || 'A student';

    const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    await NotificationModel.create({
      _id: notifId,
      userId: data.mentorId,
      title: 'New Review Received ⭐',
      message: `${studentName} gave you a ${data.rating}-star review: "${data.comment.slice(0, 60)}..."`,
      type: 'REVIEW_RECEIVED',
      link: `/mentor/profile`,
      isRead: false
    });

    this.ws.sendToUser(data.mentorId, {
      type: 'NOTIFICATION',
      payload: {
        id: notifId,
        title: 'New Review Received ⭐',
        message: `${studentName} gave you a ${data.rating}-star review: "${data.comment.slice(0, 60)}..."`,
        type: 'REVIEW_RECEIVED',
        link: '/mentor/profile',
        createdAt: now
      }
    });

    return saved;
  }
}
