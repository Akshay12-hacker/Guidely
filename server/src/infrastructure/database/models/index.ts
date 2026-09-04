import mongoose, { Schema } from 'mongoose';
import {
  UserRole,
  UserStatus,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  MentorshipRequestStatus,
  SessionStatus,
  NotificationType,
  ReportType,
  ReportStatus
} from '../../../shared/types.js';

const toJSONTransform = {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
};

// 1. User Model
export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  bio?: string;
  headline?: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'MENTOR', 'ADMIN'], required: true, index: true },
    fullName: { type: String, required: true },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
    bio: { type: String },
    headline: { type: String },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'], default: 'ACTIVE' }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// 2. Student Profile Model
export interface IStudentProfile {
  userId: string;
  college: string;
  degree: string;
  graduationYear: number;
  currentSkills: string[];
  projectIdea: string;
  targetTechnologies: string[];
  helpNeededAreas: string[];
  availability: string;
  onboardingStep: number;
  isCompleted: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true, ref: 'User' },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    graduationYear: { type: Number, default: 2026 },
    currentSkills: { type: [String], default: [] },
    projectIdea: { type: String, default: '' },
    targetTechnologies: { type: [String], default: [] },
    helpNeededAreas: { type: [String], default: [] },
    availability: { type: String, default: '' },
    onboardingStep: { type: Number, default: 1 },
    isCompleted: { type: Boolean, default: false },
    githubUrl: { type: String },
    linkedinUrl: { type: String }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const StudentProfileModel = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

// 3. Mentor Profile Model
export interface IMentorProfile {
  userId: string;
  title: string;
  company: string;
  college: string;
  yearsExperience: number;
  bio: string;
  skills: string[];
  technologies: string[];
  mentoringTopics: string[];
  availabilitySchedule: string;
  hourlyRate: number;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  rating: number;
  reviewsCount: number;
  studentsHelpedCount: number;
  onboardingStep: number;
  isCompleted: boolean;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true, ref: 'User' },
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    college: { type: String, default: '' },
    yearsExperience: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    mentoringTopics: { type: [String], default: [] },
    availabilitySchedule: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    verificationNotes: { type: String },
    rating: { type: Number, default: 5.0, index: true },
    reviewsCount: { type: Number, default: 0 },
    studentsHelpedCount: { type: Number, default: 0 },
    onboardingStep: { type: Number, default: 1 },
    isCompleted: { type: Boolean, default: false },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    websiteUrl: { type: String }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const MentorProfileModel = mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);

// 4. Project Model
export interface IProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetTechnologies: string[];
  currentStage: string;
  studentId: string;
  mentorId?: string;
  progressPercentage: number;
  status: string;
  repositoryUrl?: string;
  liveUrl?: string;
  goals: ProjectGoal[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  resources: ProjectResource[];
  notes: ProjectNote[];
  createdAt?: string;
  updatedAt?: string;
}

const GoalSchema = new Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  isCompleted: { type: Boolean, default: false },
  targetDate: { type: String },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: String }
});

const MilestoneSchema = new Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
  dueDate: { type: String },
  completedAt: { type: String },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: String }
});

const TaskSchema = new Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  milestoneId: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  assigneeRole: { type: String, enum: ['STUDENT', 'MENTOR'], default: 'STUDENT' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'], default: 'TODO' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  dueDate: { type: String },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: String },
  updatedAt: { type: String }
});

const ResourceSchema = new Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, default: 'LINK' },
  addedByRole: { type: String, default: 'MENTOR' },
  addedByName: { type: String },
  createdAt: { type: String }
});

const NoteSchema = new Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String },
  authorRole: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPrivateToMentor: { type: Boolean, default: false },
  createdAt: { type: String },
  updatedAt: { type: String }
});

const ProjectSchema = new Schema<IProject>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    targetTechnologies: { type: [String], default: [] },
    currentStage: { type: String, enum: ['IDEA', 'PLANNING', 'DEVELOPMENT', 'TESTING', 'DEPLOYED'], default: 'IDEA' },
    studentId: { type: String, required: true, index: true, ref: 'User' },
    mentorId: { type: String, index: true, ref: 'User' },
    progressPercentage: { type: Number, default: 0 },
    status: { type: String, enum: ['PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'PAUSED'], default: 'PLANNING' },
    repositoryUrl: { type: String },
    liveUrl: { type: String },
    goals: { type: [GoalSchema], default: [] },
    milestones: { type: [MilestoneSchema], default: [] },
    tasks: { type: [TaskSchema], default: [] },
    resources: { type: [ResourceSchema], default: [] },
    notes: { type: [NoteSchema], default: [] }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);

// 5. Mentorship Request Model
export interface IMentorshipRequest {
  _id: string;
  studentId: string;
  mentorId: string;
  projectTitle: string;
  projectDescription: string;
  currentKnowledge: string;
  techKnown: string[];
  helpNeeded: string[];
  expectedOutcome: string;
  preferredTimes: string;
  additionalMessage?: string;
  status: MentorshipRequestStatus;
  mentorNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MentorshipRequestSchema = new Schema<IMentorshipRequest>(
  {
    _id: { type: String, required: true },
    studentId: { type: String, required: true, index: true, ref: 'User' },
    mentorId: { type: String, required: true, index: true, ref: 'User' },
    projectTitle: { type: String, required: true },
    projectDescription: { type: String, required: true },
    currentKnowledge: { type: String, default: '' },
    techKnown: { type: [String], default: [] },
    helpNeeded: { type: [String], default: [] },
    expectedOutcome: { type: String, default: '' },
    preferredTimes: { type: String, default: '' },
    additionalMessage: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'INFO_REQUESTED', 'INFO_PROVIDED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
      index: true
    },
    mentorNotes: { type: String }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const MentorshipRequestModel = mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema);

// 6. Mentorship Session Model
export interface IMentorshipSession {
  _id: string;
  studentId: string;
  mentorId: string;
  projectId?: string;
  title: string;
  agenda: string;
  scheduledAt: string;
  durationMinutes: number;
  status: SessionStatus;
  meetingUrl?: string;
  sessionNotes?: string;
  studentFeedback?: string;
  studentRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

const MentorshipSessionSchema = new Schema<IMentorshipSession>(
  {
    _id: { type: String, required: true },
    studentId: { type: String, required: true, index: true, ref: 'User' },
    mentorId: { type: String, required: true, index: true, ref: 'User' },
    projectId: { type: String, ref: 'Project' },
    title: { type: String, required: true },
    agenda: { type: String, required: true },
    scheduledAt: { type: String, required: true, index: true },
    durationMinutes: { type: Number, default: 45 },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'],
      default: 'REQUESTED'
    },
    meetingUrl: { type: String },
    sessionNotes: { type: String },
    studentFeedback: { type: String },
    studentRating: { type: Number }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const MentorshipSessionModel = mongoose.model<IMentorshipSession>('MentorshipSession', MentorshipSessionSchema);

// 7. Conversation Model
export interface IConversation {
  _id: string;
  studentId: string;
  mentorId: string;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadStudentCount: number;
  unreadMentorCount: number;
  createdAt?: string;
  updatedAt?: string;
}

const ConversationSchema = new Schema<IConversation>(
  {
    _id: { type: String, required: true },
    studentId: { type: String, required: true, index: true, ref: 'User' },
    mentorId: { type: String, required: true, index: true, ref: 'User' },
    lastMessageId: { type: String },
    lastMessageText: { type: String },
    lastMessageAt: { type: String },
    unreadStudentCount: { type: Number, default: 0 },
    unreadMentorCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

ConversationSchema.index({ studentId: 1, mentorId: 1 }, { unique: true });

export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);

// 8. Message Model
export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  senderName?: string;
  text: string;
  attachments: { name: string; url: string; type: string; size: number }[];
  isRead: boolean;
  createdAt?: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    _id: { type: String, required: true },
    conversationId: { type: String, required: true, index: true, ref: 'Conversation' },
    senderId: { type: String, required: true, ref: 'User' },
    senderRole: { type: String, required: true },
    senderName: { type: String },
    text: { type: String, required: true },
    attachments: { type: [{ name: String, url: String, type: { type: String }, size: Number }], default: [] },
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

// 9. Notification Model
export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt?: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);

// 10. Review Model
export interface IReview {
  _id: string;
  studentId: string;
  mentorId: string;
  projectId?: string;
  rating: number;
  comment: string;
  isVerifiedMentorship: boolean;
  isApproved: boolean;
  createdAt?: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    _id: { type: String, required: true },
    studentId: { type: String, required: true, index: true, ref: 'User' },
    mentorId: { type: String, required: true, index: true, ref: 'User' },
    projectId: { type: String, ref: 'Project' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVerifiedMentorship: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

// 11. Report Model
export interface IReport {
  _id: string;
  reporterId: string;
  reportedUserId?: string;
  reportType: ReportType;
  reason: string;
  details: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ReportSchema = new Schema<IReport>(
  {
    _id: { type: String, required: true },
    reporterId: { type: String, required: true, ref: 'User' },
    reportedUserId: { type: String, ref: 'User' },
    reportType: { type: String, enum: ['USER', 'CONTENT', 'MENTORSHIP_ISSUE', 'SPAM'], required: true },
    reason: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'RESOLVED', 'DISMISSED'], default: 'PENDING', index: true },
    adminNotes: { type: String }
  },
  {
    timestamps: true,
    toJSON: toJSONTransform,
    toObject: toJSONTransform
  }
);

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema);
