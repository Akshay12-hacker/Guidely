// Shared Domain Types & Mobile Contracts for Guidely React Native

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  headline?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
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
  createdAt: string;
  updatedAt: string;
}

export interface MentorProfile {
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
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type ProjectStage = 'IDEA' | 'PLANNING' | 'DEVELOPMENT' | 'TESTING' | 'DEPLOYED';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'PAUSED';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  targetTechnologies: string[];
  currentStage: ProjectStage;
  studentId: string;
  mentorId?: string;
  progressPercentage: number;
  status: ProjectStatus;
  repositoryUrl?: string;
  liveUrl?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    college?: string;
  };
  mentor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    title?: string;
    company?: string;
  };
}

export interface ProjectGoal {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  targetDate?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  orderIndex: number;
  status: MilestoneStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ProjectTask {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  assigneeRole: 'STUDENT' | 'MENTOR';
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'LINK' | 'DOC' | 'VIDEO' | 'CODE' | 'NOTE';

export interface ProjectResource {
  id: string;
  projectId: string;
  title: string;
  url: string;
  type: ResourceType;
  addedByRole: UserRole;
  addedByName?: string;
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  authorId: string;
  authorName?: string;
  authorRole: UserRole;
  title: string;
  content: string;
  isPrivateToMentor: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MentorshipRequestStatus = 
  | 'PENDING'
  | 'INFO_REQUESTED'
  | 'INFO_PROVIDED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface MentorshipRequest {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    college?: string;
    degree?: string;
  };
  mentor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    title?: string;
    company?: string;
    rating?: number;
  };
}

export type SessionStatus = 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface MentorshipSession {
  id: string;
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
  studentRating?: number;
  studentFeedback?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    college?: string;
  };
  mentor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    title?: string;
    company?: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export interface Conversation {
  id: string;
  studentId: string;
  mentorId: string;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadStudentCount: number;
  unreadMentorCount: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  mentor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    title?: string;
    company?: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  senderName?: string;
  text: string;
  attachments?: { name: string; url: string; type: string }[];
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'REQUEST_RECEIVED'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_REJECTED'
  | 'REQUEST_INFO'
  | 'SESSION_REQUESTED'
  | 'SESSION_CONFIRMED'
  | 'SESSION_RESCHEDULED'
  | 'SESSION_CANCELLED'
  | 'SESSION_REMINDER'
  | 'NEW_MESSAGE'
  | 'MILESTONE_UPDATED'
  | 'REVIEW_RECEIVED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  mentorId: string;
  studentId: string;
  projectId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentName?: string;
  studentAvatar?: string;
  studentCollege?: string;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    college?: string;
  };
  mentor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    title?: string;
    company?: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportType: 'USER' | 'CONTENT' | 'MENTORSHIP_ISSUE' | 'SPAM';
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  reportedUser?: {
    id: string;
    fullName: string;
    role: UserRole;
    email: string;
  };
}

export interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalActiveMentorships: number;
  totalCompletedProjects: number;
  totalSessions: number;
  pendingVerifications: number;
  pendingReports: number;
  acceptanceRate: number;
  monthlyGrowth: { month: string; students: number; mentors: number; sessions: number }[];
  popularTechnologies: { name: string; count: number }[];
  domainDistribution: { domain: string; percentage: number }[];
}

export interface MentorFilters {
  search?: string;
  technologies?: string[];
  skills?: string[];
  minExperience?: number;
  availability?: string;
  minRating?: number;
  company?: string;
  sortBy?: 'rating' | 'experience' | 'students' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AuthResponse {
  user: User;
  token: string;
  profile?: StudentProfile | MentorProfile;
}
