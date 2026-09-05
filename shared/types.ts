// Shared domain types and contracts between Guidly Client and Server

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  avatarPublicId?: string;
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
  availabilityDetails?: AvailabilityScheduleData;
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
  availabilityDetails?: AvailabilityScheduleData;
  hourlyRate: number; // 0 for free/volunteer mentorship
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
  // Joins
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
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  completedAt?: string;
  orderIndex: number;
  createdAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskAssigneeRole = 'STUDENT' | 'MENTOR';

export interface ProjectTask {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  assigneeRole: TaskAssigneeRole;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'LINK' | 'DOC' | 'VIDEO' | 'NOTE' | 'CODE' | 'REPO';

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
  // Joins
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
  studentFeedback?: string;
  studentRating?: number;
  createdAt: string;
  updatedAt: string;
  // Joins
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

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  senderName?: string;
  text: string;
  attachments?: MessageAttachment[];
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
  studentId: string;
  mentorId: string;
  projectId?: string;
  rating: number;
  comment: string;
  isVerifiedMentorship: boolean;
  isApproved: boolean;
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    college?: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export type ReportType = 'USER' | 'CONTENT' | 'MENTORSHIP_ISSUE' | 'SPAM';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportType: ReportType;
  reason: string;
  details: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    fullName: string;
    role: UserRole;
  };
  reportedUser?: {
    id: string;
    fullName: string;
    role: UserRole;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  profile?: StudentProfile | MentorProfile;
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

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  originalFilename?: string;
  createdAt: string;
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface SkillItem {
  name: string;
  category: string;
  isCustom?: boolean;
}

export interface SkillsDirectoryResponse {
  skills: SkillItem[];
  categories: string[];
  total: number;
}

export interface AvailabilityPreset {
  id: string;
  name: string;
  description: string;
  startHour: number;
  endHour: number;
}

export interface TimezoneOption {
  code: string;
  label: string;
}

export interface AvailabilityScheduleData {
  days: string[];
  startHour: number;
  endHour: number;
  splitWeekends?: boolean;
  weekendStartHour?: number;
  weekendEndHour?: number;
  timezone: string;
  customNote?: string;
  totalWeeklyHours?: number;
  formattedSchedule?: string;
}

export interface StudentOnboardingOptions {
  targetTechnologies: string[];
  helpNeededAreas: string[];
  skillCategories: string[];
  availabilityDays?: string[];
  availabilityPresets?: AvailabilityPreset[];
  availabilityTimezones?: TimezoneOption[];
}

export interface RecommendedMentor {
  id: string;
  userId?: string;
  full_name?: string;
  fullName?: string;
  avatar_url?: string;
  avatarUrl?: string;
  headline?: string;
  title: string;
  company: string;
  college?: string;
  years_experience?: number;
  yearsExperience?: number;
  skills: string[];
  technologies: string[];
  mentoringTopics?: string[];
  rating: number;
  reviews_count?: number;
  reviewsCount?: number;
  students_helped_count?: number;
  studentsHelpedCount?: number;
  availability_schedule?: string;
  availabilitySchedule?: string;
  matchScore: number;
  matchReasons: string[];
  matchedTechnologies: string[];
  matchedTopics: string[];
  user?: User;
}

export interface MentorRecommendationCriteria {
  projectIdea?: string;
  targetTechnologies?: string[];
  helpNeededAreas?: string[];
  currentSkills?: string[];
  query?: string;
  preferences?: string;
}

