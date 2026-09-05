import dotenv from 'dotenv';
import { env } from '../../config/env.js';
import {
  UserModel,
  MentorProfileModel,
  StudentProfileModel,
  ProjectModel,
  MentorshipRequestModel,
  MentorshipSessionModel,
  ConversationModel,
  MessageModel,
  ReviewModel,
  ReportModel,
  NotificationModel
} from './models/index.js';
import { PasswordHasher } from '../../shared/utils/password.js';
import { logger } from '../../shared/utils/logger.js';
import { Database } from './database.js';

// Ensure .env is loaded
dotenv.config();

export async function seedDatabase(force = false): Promise<void> {
  const db = Database.getInstance();
  await db.initializeSchema();

  logger.info('Checking if database needs seeding...');
  const userCount = await UserModel.countDocuments();
  if (userCount > 0 && !force) {
    logger.info(`Database already contains ${userCount} users. Skipping seed.`);
    return;
  }

  if (force) {
    logger.info('Clearing existing collections for clean re-seed...');
    await Promise.all([
      UserModel.deleteMany({}),
      StudentProfileModel.deleteMany({}),
      MentorProfileModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      MentorshipRequestModel.deleteMany({}),
      MentorshipSessionModel.deleteMany({}),
      ConversationModel.deleteMany({}),
      MessageModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      ReportModel.deleteMany({}),
      NotificationModel.deleteMany({})
    ]);
  }

  logger.info('Seeding database with comprehensive Guidely dataset...');

  const defaultPasswordHash = await PasswordHasher.hash('password123');
  const now = new Date().toISOString();
  const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
  const futureDate = (daysAhead: number, hours = 15) => {
    const d = new Date(Date.now() + daysAhead * 86400000);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  // 1. Create Admin (HOD - Dr Gourav Shrivastava)
  await UserModel.create({
    _id: 'usr_admin_1',
    email: 'admin@guidely.dev',
    passwordHash: defaultPasswordHash,
    role: 'ADMIN',
    fullName: 'Dr Gourav Shrivastava',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Head of Department, School of Computer Technology, Sanjeev Agrawal Global Educational University, Bhopal.',
    headline: 'Head of Department & Guidely Platform Administrator',
    status: 'ACTIVE'
  });

  // 2. Mentors (Faculty Guide Prof. Nitin Choudhary, Priya, Dr. Rohan, Vikram, Ananya)
  const mentors = [
    {
      id: 'usr_mentor_nitin',
      email: 'nitin.choudhary@sageuniversity.edu.in',
      name: 'Prof. Nitin Choudhary',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      title: 'Assistant Professor',
      company: 'School of Computer Technology, SAGE University Bhopal',
      college: 'Sanjeev Agrawal Global Educational University, Bhopal',
      yearsExperience: 9,
      headline: 'Assistant Professor, School of Computer Technology @ SAGE University Bhopal | Faculty Guide',
      bio: 'Over 9 years of academic and research experience in Cyber Security, Full-Stack Software Engineering, and Cloud Technologies.',
      skills: ['Cyber Security', 'Full-Stack Architecture', 'System Design', 'Cloud Infrastructure', 'Code Reviews', 'Research Guidance'],
      technologies: ['Node.js', 'React', 'TypeScript', 'SQLite', 'Docker', 'Python', 'Security Protocols'],
      topics: ['PBL Project Mentorship', 'Secure Backend Architecture', 'Milestone Review & Research Paper Writing'],
      experienceHighlights: ['Research Publication (IEEE / ACM / NeurIPS)', 'Tech Lead & Engineering Management', 'Security Auditing & Penetration Testing'],
      projectsExperience: 'Guided 40+ PBL capstone teams in cybersecurity and full-stack software development; authored academic research papers on secure cloud protocols.',
      rating: 4.97,
      reviewsCount: 38,
      studentsHelped: 45,
      isVerified: true,
      verificationStatus: 'APPROVED' as const
    },
    {
      id: 'usr_mentor_priya',
      email: 'priya.sundaram@gmail.com',
      name: 'Priya Sundaram',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      title: 'Staff Software Engineer',
      company: 'Google India (Bangalore)',
      college: 'IIT Madras (B.Tech CSE)',
      yearsExperience: 8,
      headline: 'Staff Engineer @ Google | Distributed Systems, Go, Kubernetes & Cloud Native',
      bio: 'Over 8 years designing massive-scale distributed storage and RPC frameworks at Google.',
      skills: ['Distributed Systems', 'System Design', 'Concurrency', 'Microservices', 'Clean Architecture', 'Code Reviews'],
      technologies: ['Go (Golang)', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Docker', 'Redis', 'Kafka'],
      topics: ['Distributed Systems Design', 'Backend Architecture in Go', 'Resume Review & Code Quality'],
      experienceHighlights: ['High-Throughput Production Systems (10k+ QPS)', 'Multi-Region Cloud Architecture (AWS / GCP / Azure)', 'Microservices & Distributed Tracing', 'Open Source Maintainer / Core Contributor'],
      projectsExperience: 'Designed and maintained distributed storage layers in Go serving 20k+ QPS; built high-performance gRPC microservices and automated Kubernetes failovers.',
      rating: 4.95,
      reviewsCount: 24,
      studentsHelped: 19,
      isVerified: true,
      verificationStatus: 'APPROVED' as const
    },
    {
      id: 'usr_mentor_rohan',
      email: 'rohan.mehra@microsoft.com',
      name: 'Dr. Rohan Mehra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      title: 'Principal AI Research Scientist',
      company: 'Microsoft IDC (Hyderabad)',
      college: 'IIT Bombay (PhD Computer Science)',
      yearsExperience: 10,
      headline: 'Principal AI Researcher @ Microsoft | Computer Vision, LLMs & PyTorch',
      bio: 'Author of 14 published papers in CVPR/NeurIPS. Specializes in Deep Learning model compression.',
      skills: ['Deep Learning', 'Computer Vision', 'PyTorch', 'Research Paper Writing', 'Model Optimization', 'MLOps'],
      technologies: ['Python', 'PyTorch', 'TensorFlow', 'HuggingFace', 'FastAPI', 'ONNX', 'CUDA'],
      topics: ['Research Project Formulation', 'Applied Deep Learning', 'Biomedical AI Systems'],
      experienceHighlights: ['AI / LLM Production Pipeline Deployment', 'Research Publication (IEEE / ACM / NeurIPS)', 'Tech Lead & Engineering Management'],
      projectsExperience: 'Developed transformer model compression techniques in PyTorch; deployed scalable ONNX inference engines across GPU clusters for biomedical vision pipelines.',
      rating: 4.98,
      reviewsCount: 31,
      studentsHelped: 27,
      isVerified: true,
      verificationStatus: 'APPROVED' as const
    },
    {
      id: 'usr_mentor_vikram',
      email: 'vikram.sethi@amazon.com',
      name: 'Vikram Sethi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      title: 'Senior Cloud Solutions Architect',
      company: 'Amazon Web Services (AWS India)',
      college: 'BITS Pilani',
      yearsExperience: 7,
      headline: 'Senior Cloud Architect @ AWS | DevOps, Microservices & Serverless',
      bio: 'Specializing in AWS cloud infrastructure, Docker container orchestration, and high-availability enterprise architectures.',
      skills: ['Cloud Architecture', 'DevOps', 'CI/CD Pipelines', 'Container Orchestration', 'Microservices'],
      technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Node.js', 'Linux'],
      topics: ['Cloud Architecture Reviews', 'DevOps & CI/CD Pipelines', 'AWS Certification Prep'],
      experienceHighlights: ['Multi-Region Cloud Architecture (AWS / GCP / Azure)', 'Microservices & Distributed Tracing', 'Zero-Downtime Database Migration'],
      projectsExperience: 'Architected multi-region AWS cloud solutions for enterprise clients; built zero-downtime CI/CD migration pipelines containerized via Docker and Kubernetes.',
      rating: 4.92,
      reviewsCount: 19,
      studentsHelped: 16,
      isVerified: true,
      verificationStatus: 'APPROVED' as const
    },
    {
      id: 'usr_mentor_ananya',
      email: 'ananya.security@cert-in.gov.in',
      name: 'Ananya Joshi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      title: 'Principal Cyber Threat Analyst',
      company: 'CERT-In (National Cyber Coordination Centre)',
      college: 'IIIT Allahabad (M.Tech Cyber Security)',
      yearsExperience: 6,
      headline: 'Principal Threat Analyst @ CERT-In | Digital Forensics & SOC Operations',
      bio: 'Specialist in network forensics, ethical hacking, malware analysis, and zero-trust security frameworks.',
      skills: ['Digital Forensics', 'Threat Hunting', 'Penetration Testing', 'SIEM & SOC', 'Network Security'],
      technologies: ['Wireshark', 'Metasploit', 'Python', 'Snort', 'Linux Security', 'ELK Stack'],
      topics: ['Cyber Threat Analysis', 'SOC Incident Response', 'Forensic Evidence Extraction'],
      experienceHighlights: ['Security Auditing & Penetration Testing', 'High-Throughput Production Systems (10k+ QPS)', 'Research Publication (IEEE / ACM / NeurIPS)'],
      projectsExperience: 'Led threat hunting operations on critical enterprise networks; conducted deep packet forensic audits and deployed enterprise-grade ELK SIEM rule pipelines.',
      rating: 4.96,
      reviewsCount: 22,
      studentsHelped: 18,
      isVerified: true,
      verificationStatus: 'APPROVED' as const
    },
    {
      id: 'usr_mentor_kavita',
      email: 'kavita.sharma@flipkart.com',
      name: 'Kavita Sharma',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      title: 'Staff Data Engineer',
      company: 'Flipkart (Bangalore)',
      college: 'NIT Trichy (B.Tech CSE)',
      yearsExperience: 6,
      headline: 'Staff Data Engineer @ Flipkart | Apache Spark, Kafka & Big Data Architecture',
      bio: 'Specialist in high-throughput distributed data pipelines, Apache Spark, Kafka streaming, and data warehouse architecture.',
      skills: ['Data Engineering', 'Apache Spark', 'Kafka', 'SQL Optimization', 'Python', 'Distributed Pipelines'],
      technologies: ['Python', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Airflow', 'AWS'],
      topics: ['Big Data Architecture', 'Data Modeling & ETL', 'Industry System Design'],
      experienceHighlights: ['High-Throughput Production Systems (10k+ QPS)', 'Multi-Region Cloud Architecture (AWS / GCP / Azure)'],
      projectsExperience: 'Built real-time analytics pipelines ingesting 50M+ events per day on AWS and Kafka.',
      rating: 5.0,
      reviewsCount: 0,
      studentsHelped: 0,
      isVerified: false,
      verificationStatus: 'PENDING' as const
    },
    {
      id: 'usr_mentor_devendra',
      email: 'devendra.patle@razorpay.com',
      name: 'Devendra Patle',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      title: 'Senior Security Architect',
      company: 'Razorpay',
      college: 'MANIT Bhopal (B.Tech CSE)',
      yearsExperience: 7,
      headline: 'Senior Security Architect @ Razorpay | DevSecOps, Cloud Hardening & FinTech',
      bio: 'DevSecOps and fintech infrastructure security specialist. Passionate about guiding capstone students in cloud security and vulnerability assessment.',
      skills: ['Application Security', 'DevSecOps', 'Cloud Security', 'PCI-DSS', 'Kubernetes Security', 'API Security Audits'],
      technologies: ['Go', 'Docker', 'Kubernetes', 'Trivy', 'HashiCorp Vault', 'AWS', 'Linux'],
      topics: ['FinTech Security Compliance', 'Cloud Hardening', 'Vulnerability Assessment'],
      experienceHighlights: ['Security Auditing & Penetration Testing', 'Multi-Region Cloud Architecture (AWS / GCP / Azure)'],
      projectsExperience: 'Hardened Kubernetes microservices clusters for high-assurance PCI-DSS level 1 banking workloads.',
      rating: 5.0,
      reviewsCount: 0,
      studentsHelped: 0,
      isVerified: false,
      verificationStatus: 'PENDING' as const
    }
  ];

  for (const m of mentors) {
    await UserModel.create({
      _id: m.id,
      email: m.email,
      passwordHash: defaultPasswordHash,
      role: 'MENTOR',
      fullName: m.name,
      avatarUrl: m.avatar,
      bio: m.bio,
      headline: m.headline,
      status: 'ACTIVE'
    });

    await MentorProfileModel.create({
      userId: m.id,
      title: m.title,
      company: m.company,
      college: m.college,
      yearsExperience: m.yearsExperience,
      bio: m.bio,
      skills: m.skills,
      technologies: m.technologies,
      mentoringTopics: m.topics,
      experienceHighlights: m.experienceHighlights,
      projectsExperience: m.projectsExperience,
      availabilitySchedule: 'Weekdays post 2 PM & Weekends',
      hourlyRate: 0,
      isVerified: m.isVerified,
      verificationStatus: m.verificationStatus,
      rating: m.rating,
      reviewsCount: m.reviewsCount,
      studentsHelpedCount: m.studentsHelped,
      onboardingStep: 9,
      isCompleted: true
    });
  }

  // 3. Students (Akshay, Abhimanyu, Sapna)
  const students = [
    {
      id: 'usr_student_akshay',
      email: 'akshay@guidely.dev',
      name: 'Akshay Ramkishor Rahangdale',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      college: 'Sanjeev Agrawal Global Educational University, Bhopal',
      degree: 'B.Tech (Hons) CSE (Cyber Security & Forensic)',
      graduationYear: 2026,
      currentSkills: ['React 19', 'TypeScript', 'Node.js', 'Express', 'SQLite', 'WebSockets', 'TailwindCSS', 'API Security'],
      projectIdea: 'Guidely: E-learning & Collaborative Project Mentorship Platform with Real-Time Progress Engine',
      targetTechnologies: ['React', 'TypeScript', 'Node.js', 'Express', 'WebSocket', 'SQLite', 'Expo'],
      helpNeeded: ['Scalable WebSocket Protocol', 'Role-Based Access Control', 'Database Normalization'],
      availability: 'Weekdays post 4 PM & Weekends'
    },
    {
      id: 'usr_student_abhimanyu',
      email: 'abhimanyu@guidely.dev',
      name: 'Abhimanyu Kumar Sahu',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      college: 'Sanjeev Agrawal Global Educational University, Bhopal',
      degree: 'B.Tech (Hons) CSE (Cyber Security & Forensic)',
      graduationYear: 2026,
      currentSkills: ['Python', 'FastAPI', 'Network Forensics', 'SQLite', 'Cryptography', 'Docker'],
      projectIdea: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector',
      targetTechnologies: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'SQLite'],
      helpNeeded: ['SIEM Pipeline Integration', 'Anomaly Classification Models'],
      availability: 'Weekdays post 5 PM'
    },
    {
      id: 'usr_student_sapna',
      email: 'sapna@guidely.dev',
      name: 'Sapna Jaiswal',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      college: 'Sanjeev Agrawal Global Educational University, Bhopal',
      degree: 'B.Tech (Hons) CSE (Artificial Intelligence & Machine Learning)',
      graduationYear: 2026,
      currentSkills: ['PyTorch', 'Vision Transformers', 'React Native', 'Expo', 'Python', 'TailwindCSS'],
      projectIdea: 'Automated Chest X-Ray Diagnosis with Vision Transformers',
      targetTechnologies: ['PyTorch', 'HuggingFace', 'FastAPI', 'React Native', 'Expo'],
      helpNeeded: ['Model Quantization', 'Mobile Edge Inference'],
      availability: 'Flexible weekends & evenings'
    }
  ];

  for (const s of students) {
    await UserModel.create({
      _id: s.id,
      email: s.email,
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      fullName: s.name,
      avatarUrl: s.avatar,
      bio: `5th Semester Undergraduate Student at ${s.college} pursuing ${s.degree}.`,
      headline: `Student @ ${s.college} | Building full-stack & applied computing systems`,
      status: 'ACTIVE'
    });

    await StudentProfileModel.create({
      userId: s.id,
      college: s.college,
      degree: s.degree,
      graduationYear: s.graduationYear,
      currentSkills: s.currentSkills,
      projectIdea: s.projectIdea,
      targetTechnologies: s.targetTechnologies,
      helpNeededAreas: s.helpNeeded,
      availability: s.availability,
      onboardingStep: 6,
      isCompleted: true
    });
  }

  // 4. Projects (Guidely PBL, Threat Intel, ViT Classifier)
  await ProjectModel.create({
    _id: 'proj_guidely_pbl',
    title: 'Guidely: E-learning & Collaborative Project Mentorship Platform',
    description: 'Modern full-stack collaborative platform for CSE students featuring role-based matchmaking, real-time WebSocket messaging, dynamic Kanban task boards, video sessions, and admin governance.',
    category: 'Full-Stack Web & Mobile',
    targetTechnologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'WebSocket', 'SQLite', 'React Native', 'Expo 52'],
    currentStage: 'DEVELOPMENT',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    progressPercentage: 68,
    status: 'IN_PROGRESS',
    repositoryUrl: 'https://github.com/Akshay-Rahangdale/Guidely',
    liveUrl: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || env.CLIENT_ORIGIN || 'http://localhost:5173',
    goals: [
      {
        id: 'goal_1',
        projectId: 'proj_guidely_pbl',
        title: 'Design & Deploy Normalized Relational Database Schema',
        description: 'Implement 11 normalized tables with indexed foreign keys, constraints, and seed data.',
        isCompleted: true,
        targetDate: pastDate(30),
        orderIndex: 1
      },
      {
        id: 'goal_2',
        projectId: 'proj_guidely_pbl',
        title: 'Implement Real-Time WebSocket Bidirectional Chat Engine',
        description: 'Build full-duplex socket server with unread badge tracking, online presence, and room delivery.',
        isCompleted: true,
        targetDate: pastDate(15),
        orderIndex: 2
      },
      {
        id: 'goal_3',
        projectId: 'proj_guidely_pbl',
        title: 'Build Interactive Kanban Task Board with Dynamic Progress Calculation',
        description: 'Task state transitions (TODO, IN_PROGRESS, IN_REVIEW, DONE) that automatically recalculate progress.',
        isCompleted: true,
        targetDate: pastDate(5),
        orderIndex: 3
      },
      {
        id: 'goal_4',
        projectId: 'proj_guidely_pbl',
        title: 'Develop Cross-Platform Mobile Client in React Native Expo',
        description: 'Mobile views for student daily standup, push alerts, and portable chat.',
        isCompleted: false,
        targetDate: futureDate(10),
        orderIndex: 4
      }
    ],
    milestones: [
      {
        id: 'ms_1',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 1: SRS, Architecture & Schema Design',
        description: 'Finalize functional requirements, layered component architecture, and SQLite data models.',
        status: 'COMPLETED',
        dueDate: pastDate(35),
        completedAt: pastDate(33),
        orderIndex: 1
      },
      {
        id: 'ms_2',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 2: Authentication, RBAC & Core REST APIs',
        description: 'JWT token signing, Bcrypt password hashing, Zod validation, and role-based route middleware.',
        status: 'COMPLETED',
        dueDate: pastDate(20),
        completedAt: pastDate(18),
        orderIndex: 2
      },
      {
        id: 'ms_3',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 3: Real-Time Messaging & Project Workspace',
        description: 'WebSocket protocol integration, Jitsi Meet video scheduling, and Kanban state machine.',
        status: 'COMPLETED',
        dueDate: pastDate(5),
        completedAt: pastDate(4),
        orderIndex: 3
      },
      {
        id: 'ms_4',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 4: Mobile Client, Testing & Final Report Documentation',
        description: 'React Native mobile app views, automated test verification, and PBL report completion.',
        status: 'IN_PROGRESS',
        dueDate: futureDate(7),
        orderIndex: 4
      }
    ],
    tasks: [
      {
        id: 'task_1',
        projectId: 'proj_guidely_pbl',
        milestoneId: 'ms_2',
        title: 'Implement JWT Authentication & Bcrypt Password Hashing',
        description: 'Secure stateless authentication with role claims (Student, Mentor, Admin) and password salts.',
        assigneeRole: 'STUDENT',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: pastDate(22),
        orderIndex: 1
      },
      {
        id: 'task_2',
        projectId: 'proj_guidely_pbl',
        milestoneId: 'ms_2',
        title: 'Build Mentor Discovery Multi-Criteria Filter Algorithm',
        description: 'Dynamic search by tech stack, experience level, verified rating, and company domain.',
        assigneeRole: 'STUDENT',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: pastDate(15),
        orderIndex: 2
      },
      {
        id: 'task_3',
        projectId: 'proj_guidely_pbl',
        milestoneId: 'ms_3',
        title: 'Create Dynamic Kanban Task Board with State Transitions',
        description: 'Interactive board supporting drag-and-drop, priority flags, and instant progress metric updates.',
        assigneeRole: 'STUDENT',
        status: 'DONE',
        priority: 'MEDIUM',
        dueDate: pastDate(8),
        orderIndex: 3
      },
      {
        id: 'task_4',
        projectId: 'proj_guidely_pbl',
        milestoneId: 'ms_3',
        title: 'Configure Full-Duplex WebSocket Protocol & Unread Message Badges',
        description: 'Real-time message broadcasting, room subscriptions, and unread counter synchronization.',
        assigneeRole: 'STUDENT',
        status: 'DONE',
        priority: 'URGENT',
        dueDate: pastDate(5),
        orderIndex: 4
      },
      {
        id: 'task_5',
        projectId: 'proj_guidely_pbl',
        milestoneId: 'ms_4',
        title: 'Develop React Native Expo Mobile Views for Student Standups',
        description: 'Responsive cross-platform mobile views for rapid daily task management and portable messaging.',
        assigneeRole: 'STUDENT',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: futureDate(4),
        orderIndex: 5
      },
      {
        id: 'task_6',
        projectId: 'proj_guidely_pbl',
        milestoneId: 'ms_4',
        title: 'Run Automated Test Suite & Prepare Academic PBL Report',
        description: 'Execute run-tests suite, verify 100% pass rates, and populate docx PBL report tables.',
        assigneeRole: 'STUDENT',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        dueDate: futureDate(2),
        orderIndex: 6
      }
    ],
    resources: [
      {
        id: 'res_1',
        projectId: 'proj_guidely_pbl',
        title: 'Guidely System Architecture Specification (PDF)',
        url: 'https://github.com/Akshay-Rahangdale/Guidely',
        type: 'DOC',
        addedByRole: 'STUDENT',
        addedByName: 'Akshay Ramkishor Rahangdale',
        createdAt: pastDate(20)
      },
      {
        id: 'res_2',
        projectId: 'proj_guidely_pbl',
        title: 'PBL Report Autumn 2026-27 Format Document',
        url: 'https://sageuniversity.edu.in/pbl-format',
        type: 'DOC',
        addedByRole: 'MENTOR',
        addedByName: 'Prof. Nitin Choudhary',
        createdAt: pastDate(15)
      }
    ],
    notes: [
      {
        id: 'note_1',
        projectId: 'proj_guidely_pbl',
        authorId: 'usr_mentor_nitin',
        authorName: 'Prof. Nitin Choudhary',
        authorRole: 'MENTOR',
        title: 'Faculty Review on Schema Design & Normalization',
        content: 'Database normalization looks solid with indexed foreign keys and cascading deletes. The separation between student/mentor profile extensions and core user credentials is well implemented.',
        isPrivateToMentor: false,
        createdAt: pastDate(20),
        updatedAt: pastDate(20)
      }
    ]
  });

  // 5. Mentorship Requests
  await MentorshipRequestModel.create({
    _id: 'req_akshay_nitin',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    projectTitle: 'Guidely: E-learning & Collaborative Project Mentorship Platform',
    projectDescription: 'Building a full-stack real-time collaboration ecosystem for engineering students and academic mentors.',
    currentKnowledge: 'React 19, TypeScript, Node.js, Express, SQLite, WebSockets',
    techKnown: ['React', 'TypeScript', 'Node.js', 'Express', 'WebSocket', 'SQLite'],
    helpNeeded: ['Layered Architecture Validation', 'WebSocket Scaling', 'Academic Evaluation Framework'],
    expectedOutcome: 'A deployable web and mobile system with complete PBL report documentation.',
    preferredTimes: 'Tuesdays & Thursdays (3:00 PM - 5:00 PM IST)',
    status: 'ACCEPTED',
    mentorNotes: 'Excellent problem statement addressing institutional project fragmentation. Approved for Phase 1-4 execution.'
  });

  // 6. Mentorship Sessions
  await MentorshipSessionModel.create({
    _id: 'sess_akshay_nitin_upcoming',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_guidely_pbl',
    title: 'PBL Phase 4 Review & Final Report Submission Check',
    agenda: '1. Review full-stack prototype deliverables\n2. Verify test pass rates across domain suites\n3. Final verification of PBL Report tables & contribution matrix',
    scheduledAt: futureDate(1, 15),
    durationMinutes: 45,
    status: 'CONFIRMED',
    meetingUrl: 'https://meet.jit.si/guidely-pbl-phase4-final-review'
  });

  // 7. Conversations & Messages
  await ConversationModel.create({
    _id: 'conv_akshay_nitin',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    lastMessageId: 'msg_akshay_5',
    lastMessageText: 'Yes Sir! We ran the engineering test suite with 100% pass rate and populated the entire docx report with our project details.',
    lastMessageAt: pastDate(0.1),
    unreadStudentCount: 0,
    unreadMentorCount: 0
  });

  await MessageModel.create([
    {
      _id: 'msg_akshay_1',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_mentor_nitin',
      senderRole: 'MENTOR',
      senderName: 'Prof. Nitin Choudhary',
      text: 'Hello Akshay, how is the team progressing with the Guidely project deliverables?',
      isRead: true
    },
    {
      _id: 'msg_akshay_2',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_student_akshay',
      senderRole: 'STUDENT',
      senderName: 'Akshay Ramkishor Rahangdale',
      text: 'Good afternoon Sir! We have completed the full-stack architecture, WebSocket chat engine, and the interactive Kanban workspace with dynamic progress calculation.',
      isRead: true
    },
    {
      _id: 'msg_akshay_5',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_mentor_nitin',
      senderRole: 'MENTOR',
      senderName: 'Prof. Nitin Choudhary',
      text: 'Outstanding! Looking forward to reviewing the final demo in tomorrow\'s scheduled session.',
      isRead: true
    }
  ]);

  // 8. Reviews
  await ReviewModel.create({
    _id: 'rev_1',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_guidely_pbl',
    rating: 5,
    comment: 'Prof. Nitin Choudhary provided exceptional guidance throughout our PBL project. His insights into software architecture, role-based access control, and database normalization helped us build a robust, scalable platform.',
    isVerifiedMentorship: true,
    isApproved: true
  });

  // 9. Notifications
  await NotificationModel.create({
    _id: 'notif_1',
    userId: 'usr_student_akshay',
    title: 'Mentorship Session Confirmed 📅',
    message: 'Prof. Nitin Choudhary confirmed your session for tomorrow at 3:00 PM IST.',
    type: 'SESSION_CONFIRMED',
    link: 'sessions',
    isRead: false
  });

  logger.info('Database seeded successfully with Guidely dataset! 🎉');
}

// Support direct CLI execution: e.g. npm run seed or tsx seed.ts [--force]
const isMain = process.argv[1] && (
  process.argv[1].endsWith('seed.ts') || 
  process.argv[1].endsWith('seed.js')
);

if (isMain) {
  const force = process.argv.includes('--force') || process.env.FORCE_SEED === 'true';
  seedDatabase(force)
    .then(async () => {
      await Database.getInstance().close();
      logger.info('Database seeding process finished.');
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Database seeding failed:', err);
      try {
        await Database.getInstance().close();
      } catch {}
      process.exit(1);
    });
}
