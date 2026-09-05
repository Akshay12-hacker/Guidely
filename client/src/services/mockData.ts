import {
  User,
  StudentProfile,
  MentorProfile,
  Project,
  ProjectGoal,
  ProjectMilestone,
  ProjectTask,
  ProjectResource,
  ProjectNote,
  MentorshipRequest,
  MentorshipSession,
  Conversation,
  Message,
  Notification,
  Review,
  Report,
  AdminAnalytics
} from '../../../shared/types.js';

const now = new Date();
const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const futureDate = (daysAhead: number, hours = 15) => {
  const d = new Date(Date.now() + daysAhead * 86400000);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

// ----------------------------------------------------
// 1. MOCK USERS
// ----------------------------------------------------
export const MOCK_USERS: Record<string, User> = {
  // Student Lead - Akshay
  'usr_student_akshay': {
    id: 'usr_student_akshay',
    email: 'akshay@guidely.dev',
    role: 'STUDENT',
    fullName: 'Akshay Ramkishor Rahangdale',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'B.Tech CSE (Cyber Security & Forensic) @ SAGE University Bhopal | Lead Developer @ Guidely',
    bio: '5th Semester Computer Science student passionate about full-stack web architecture, API security, and collaborative learning tools.',
    status: 'ACTIVE',
    createdAt: pastDate(60),
    updatedAt: pastDate(1)
  },
  // Student 2 - Abhimanyu
  'usr_student_abhimanyu': {
    id: 'usr_student_abhimanyu',
    email: 'abhimanyu@guidely.dev',
    role: 'STUDENT',
    fullName: 'Abhimanyu Kumar Sahu',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    headline: 'B.Tech CSE (Cyber Security & Forensic) @ SAGE University Bhopal | Core Developer',
    bio: 'Specializing in database design, real-time networking, and backend API development.',
    status: 'ACTIVE',
    createdAt: pastDate(60),
    updatedAt: pastDate(2)
  },
  // Student 3 - Sapna
  'usr_student_sapna': {
    id: 'usr_student_sapna',
    email: 'sapna@guidely.dev',
    role: 'STUDENT',
    fullName: 'Sapna Jaiswal',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    headline: 'B.Tech CSE (AI & ML) @ SAGE University Bhopal | Frontend & Mobile Engineer',
    bio: 'Building engaging user interfaces, React Native mobile apps, and integrating machine learning workflows.',
    status: 'ACTIVE',
    createdAt: pastDate(60),
    updatedAt: pastDate(1)
  },
  // Faculty Guide / Mentor - Prof. Nitin Choudhary
  'usr_mentor_nitin': {
    id: 'usr_mentor_nitin',
    email: 'nitin.choudhary@sageuniversity.edu.in',
    role: 'MENTOR',
    fullName: 'Prof. Nitin Choudhary',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    headline: 'Assistant Professor, School of Computer Technology @ SAGE University Bhopal | Faculty Guide',
    bio: 'Over 9 years of academic and research experience in Cyber Security, Full-Stack Software Engineering, and Cloud Technologies.',
    status: 'ACTIVE',
    createdAt: pastDate(90),
    updatedAt: pastDate(1)
  },
  // Mentor 2 - Priya Sundaram (Google)
  'usr_mentor_priya': {
    id: 'usr_mentor_priya',
    email: 'priya.sundaram@gmail.com',
    role: 'MENTOR',
    fullName: 'Priya Sundaram',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    headline: 'Staff Software Engineer @ Google India | Distributed Systems, Go & Kubernetes',
    bio: 'Over 8 years designing massive-scale distributed storage and RPC frameworks at Google.',
    status: 'ACTIVE',
    createdAt: pastDate(90),
    updatedAt: pastDate(3)
  },
  // Mentor 3 - Dr. Rohan Mehra (Microsoft)
  'usr_mentor_rohan': {
    id: 'usr_mentor_rohan',
    email: 'rohan.mehra@microsoft.com',
    role: 'MENTOR',
    fullName: 'Dr. Rohan Mehra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Principal AI Research Scientist @ Microsoft IDC | Computer Vision & PyTorch',
    bio: 'Author of 14 published papers in CVPR/NeurIPS. Specializes in Deep Learning model compression and applied AI systems.',
    status: 'ACTIVE',
    createdAt: pastDate(90),
    updatedAt: pastDate(4)
  },
  // Mentor 4 - Vikram Sethi (AWS)
  'usr_mentor_vikram': {
    id: 'usr_mentor_vikram',
    email: 'vikram.sethi@amazon.com',
    role: 'MENTOR',
    fullName: 'Vikram Sethi',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    headline: 'Senior Cloud Solutions Architect @ AWS | DevOps, Microservices & Serverless',
    bio: 'Specializing in AWS cloud infrastructure, Docker container orchestration, and high-availability enterprise architectures.',
    status: 'ACTIVE',
    createdAt: pastDate(80),
    updatedAt: pastDate(5)
  },
  // Mentor 5 - Ananya Joshi (CERT-In)
  'usr_mentor_ananya': {
    id: 'usr_mentor_ananya',
    email: 'ananya.security@cert-in.gov.in',
    role: 'MENTOR',
    fullName: 'Ananya Joshi',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    headline: 'Principal Cyber Threat Analyst @ CERT-In | Digital Forensics & SOC Operations',
    bio: 'Specialist in network forensics, ethical hacking, malware analysis, and zero-trust security frameworks.',
    status: 'ACTIVE',
    createdAt: pastDate(70),
    updatedAt: pastDate(6)
  },
  // Pending Mentor Applicant 1 - Kavita Sharma (Flipkart)
  'usr_mentor_kavita': {
    id: 'usr_mentor_kavita',
    email: 'kavita.sharma@flipkart.com',
    role: 'MENTOR',
    fullName: 'Kavita Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    headline: 'Staff Data Engineer @ Flipkart | Apache Spark, Kafka & Big Data Architecture',
    bio: 'Specialist in high-throughput distributed data pipelines, Apache Spark, Kafka streaming, and data warehouse architecture.',
    status: 'ACTIVE',
    createdAt: pastDate(2),
    updatedAt: pastDate(1)
  },
  // Pending Mentor Applicant 2 - Devendra Patle (Razorpay)
  'usr_mentor_devendra': {
    id: 'usr_mentor_devendra',
    email: 'devendra.patle@razorpay.com',
    role: 'MENTOR',
    fullName: 'Devendra Patle',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    headline: 'Senior Security Architect @ Razorpay | DevSecOps, Cloud Hardening & FinTech',
    bio: 'DevSecOps and fintech infrastructure security specialist. Passionate about guiding capstone students in cloud security and vulnerability assessment.',
    status: 'ACTIVE',
    createdAt: pastDate(3),
    updatedAt: pastDate(1)
  },
  // Admin - Dr. Gourav Shrivastava (HOD)
  'usr_admin_1': {
    id: 'usr_admin_1',
    email: 'admin@guidely.dev',
    role: 'ADMIN',
    fullName: 'Dr Gourav Shrivastava',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'Head of Department & Guidely Platform Administrator | School of Computer Technology',
    bio: 'HOD and Academic Governance Lead at SAGE University Bhopal.',
    status: 'ACTIVE',
    createdAt: pastDate(100),
    updatedAt: pastDate(1)
  }
};

// ----------------------------------------------------
// 2. STUDENT PROFILES
// ----------------------------------------------------
export const MOCK_STUDENT_PROFILES: Record<string, StudentProfile> = {
  'usr_student_akshay': {
    userId: 'usr_student_akshay',
    college: 'Sanjeev Agrawal Global Educational University, Bhopal',
    degree: 'B.Tech (Hons) Computer Science & Engineering (Cyber Security & Forensic)',
    graduationYear: 2026,
    currentSkills: ['React 19', 'TypeScript', 'Node.js', 'Express', 'SQLite', 'WebSockets', 'TailwindCSS', 'API Security'],
    projectIdea: 'Guidely: E-learning & Collaborative Project Mentorship Platform with Real-Time Progress Engine',
    targetTechnologies: ['React', 'TypeScript', 'Node.js', 'Express', 'WebSocket', 'SQLite', 'Expo'],
    helpNeededAreas: ['Scalable WebSocket Protocol', 'Role-Based Access Control', 'Database Normalization'],
    availability: 'Weekdays post 4 PM & Weekends',
    onboardingStep: 6,
    isCompleted: true,
    githubUrl: 'https://github.com/Akshay-Rahangdale/Guidely',
    linkedinUrl: 'https://linkedin.com/in/akshay-rahangdale',
    createdAt: pastDate(60),
    updatedAt: pastDate(1)
  },
  'usr_student_abhimanyu': {
    userId: 'usr_student_abhimanyu',
    college: 'Sanjeev Agrawal Global Educational University, Bhopal',
    degree: 'B.Tech (Hons) CSE (Cyber Security & Forensic)',
    graduationYear: 2026,
    currentSkills: ['Python', 'FastAPI', 'Network Forensics', 'SQLite', 'Cryptography', 'Docker'],
    projectIdea: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector',
    targetTechnologies: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'SQLite'],
    helpNeededAreas: ['SIEM Pipeline Integration', 'Anomaly Classification Models'],
    availability: 'Weekdays post 5 PM',
    onboardingStep: 6,
    isCompleted: true,
    githubUrl: 'https://github.com/Abhimanyu-Sahu',
    linkedinUrl: 'https://linkedin.com/in/abhimanyu-sahu',
    createdAt: pastDate(60),
    updatedAt: pastDate(2)
  },
  'usr_student_sapna': {
    userId: 'usr_student_sapna',
    college: 'Sanjeev Agrawal Global Educational University, Bhopal',
    degree: 'B.Tech (Hons) CSE (Artificial Intelligence & Machine Learning)',
    graduationYear: 2026,
    currentSkills: ['PyTorch', 'Vision Transformers', 'React Native', 'Expo', 'Python', 'TailwindCSS'],
    projectIdea: 'Automated Chest X-Ray Diagnosis with Vision Transformers',
    targetTechnologies: ['PyTorch', 'HuggingFace', 'FastAPI', 'React Native', 'Expo'],
    helpNeededAreas: ['Model Quantization', 'Mobile Edge Inference'],
    availability: 'Flexible weekends & evenings',
    onboardingStep: 6,
    isCompleted: true,
    githubUrl: 'https://github.com/Sapna-Jaiswal',
    linkedinUrl: 'https://linkedin.com/in/sapna-jaiswal',
    createdAt: pastDate(60),
    updatedAt: pastDate(1)
  }
};

// ----------------------------------------------------
// 3. MENTOR PROFILES
// ----------------------------------------------------
export const MOCK_MENTOR_PROFILES: Record<string, MentorProfile> = {
  'usr_mentor_nitin': {
    userId: 'usr_mentor_nitin',
    title: 'Assistant Professor',
    company: 'School of Computer Technology, SAGE University Bhopal',
    college: 'Sanjeev Agrawal Global Educational University, Bhopal',
    yearsExperience: 9,
    bio: 'Over 9 years of academic and research experience in Cyber Security, Full-Stack Software Engineering, and Cloud Technologies.',
    skills: ['Cyber Security', 'Full-Stack Architecture', 'System Design', 'Cloud Infrastructure', 'Code Reviews', 'Research Guidance'],
    technologies: ['Node.js', 'React', 'TypeScript', 'SQLite', 'Docker', 'Python', 'Security Protocols'],
    mentoringTopics: ['PBL Project Mentorship', 'Secure Backend Architecture', 'Milestone Review & Research Paper Writing'],
    availabilitySchedule: 'Mon-Fri (2:00 PM - 6:00 PM IST)',
    hourlyRate: 0,
    isVerified: true,
    verificationStatus: 'APPROVED',
    verificationNotes: 'Faculty Guide & Assistant Professor at School of Computer Technology',
    rating: 4.97,
    reviewsCount: 38,
    studentsHelpedCount: 45,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/nitin-choudhary',
    linkedinUrl: 'https://linkedin.com/in/nitin-choudhary-sage',
    createdAt: pastDate(90),
    updatedAt: pastDate(1)
  },
  'usr_mentor_priya': {
    userId: 'usr_mentor_priya',
    title: 'Staff Software Engineer',
    company: 'Google India (Bangalore)',
    college: 'IIT Madras (B.Tech CSE)',
    yearsExperience: 8,
    bio: 'Over 8 years designing massive-scale distributed storage and RPC frameworks at Google.',
    skills: ['Distributed Systems', 'System Design', 'Concurrency', 'Microservices', 'Clean Architecture', 'Code Reviews'],
    technologies: ['Go (Golang)', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Docker', 'Redis', 'Kafka'],
    mentoringTopics: ['Distributed Systems Design', 'Backend Architecture in Go', 'Resume Review & Code Quality'],
    availabilitySchedule: 'Weekends (10 AM - 6 PM IST) & Weekdays post 7 PM',
    hourlyRate: 0,
    isVerified: true,
    verificationStatus: 'APPROVED',
    rating: 4.95,
    reviewsCount: 24,
    studentsHelpedCount: 19,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/priya-sundaram',
    linkedinUrl: 'https://linkedin.com/in/priya-sundaram-google',
    createdAt: pastDate(90),
    updatedAt: pastDate(3)
  },
  'usr_mentor_rohan': {
    userId: 'usr_mentor_rohan',
    title: 'Principal AI Research Scientist',
    company: 'Microsoft IDC (Hyderabad)',
    college: 'IIT Bombay (PhD Computer Science)',
    yearsExperience: 10,
    bio: 'Author of 14 published papers in CVPR/NeurIPS. Specializes in Deep Learning model compression and applied AI systems.',
    skills: ['Deep Learning', 'Computer Vision', 'PyTorch', 'Research Paper Writing', 'Model Optimization', 'MLOps'],
    technologies: ['Python', 'PyTorch', 'TensorFlow', 'HuggingFace', 'FastAPI', 'ONNX', 'CUDA'],
    mentoringTopics: ['Research Project Formulation', 'Applied Deep Learning', 'Biomedical AI Systems'],
    availabilitySchedule: 'Saturday & Sunday mornings',
    hourlyRate: 0,
    isVerified: true,
    verificationStatus: 'APPROVED',
    rating: 4.98,
    reviewsCount: 31,
    studentsHelpedCount: 27,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/rohan-mehra-ai',
    linkedinUrl: 'https://linkedin.com/in/dr-rohan-mehra',
    createdAt: pastDate(90),
    updatedAt: pastDate(4)
  },
  'usr_mentor_vikram': {
    userId: 'usr_mentor_vikram',
    title: 'Senior Cloud Solutions Architect',
    company: 'Amazon Web Services (AWS India)',
    college: 'BITS Pilani',
    yearsExperience: 7,
    bio: 'Specializing in AWS cloud infrastructure, Docker container orchestration, and high-availability enterprise architectures.',
    skills: ['Cloud Architecture', 'DevOps', 'CI/CD Pipelines', 'Container Orchestration', 'Microservices'],
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Node.js', 'Linux'],
    mentoringTopics: ['Cloud Architecture Reviews', 'DevOps & CI/CD Pipelines', 'AWS Certification Prep'],
    availabilitySchedule: 'Tuesday & Thursday evenings',
    hourlyRate: 0,
    isVerified: true,
    verificationStatus: 'APPROVED',
    rating: 4.92,
    reviewsCount: 19,
    studentsHelpedCount: 16,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/vikram-sethi-aws',
    linkedinUrl: 'https://linkedin.com/in/vikram-sethi-cloud',
    createdAt: pastDate(80),
    updatedAt: pastDate(5)
  },
  'usr_mentor_ananya': {
    userId: 'usr_mentor_ananya',
    title: 'Principal Cyber Threat Analyst',
    company: 'CERT-In (National Cyber Coordination Centre)',
    college: 'IIIT Allahabad (M.Tech Cyber Security)',
    yearsExperience: 6,
    bio: 'Specialist in network forensics, ethical hacking, malware analysis, and zero-trust security frameworks.',
    skills: ['Digital Forensics', 'Threat Hunting', 'Penetration Testing', 'SIEM & SOC', 'Network Security'],
    technologies: ['Wireshark', 'Metasploit', 'Python', 'Snort', 'Linux Security', 'ELK Stack'],
    mentoringTopics: ['Cyber Threat Analysis', 'SOC Incident Response', 'Forensic Evidence Extraction'],
    availabilitySchedule: 'Weekends (2 PM - 7 PM IST)',
    hourlyRate: 0,
    isVerified: true,
    verificationStatus: 'APPROVED',
    rating: 4.96,
    reviewsCount: 22,
    studentsHelpedCount: 18,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/ananya-security',
    linkedinUrl: 'https://linkedin.com/in/ananya-joshi-security',
    createdAt: pastDate(70),
    updatedAt: pastDate(6)
  },
  'usr_mentor_kavita': {
    userId: 'usr_mentor_kavita',
    title: 'Staff Data Engineer',
    company: 'Flipkart (Bangalore)',
    college: 'NIT Trichy (B.Tech CSE)',
    yearsExperience: 6,
    bio: 'Specialist in high-throughput distributed data pipelines, Apache Spark, Kafka streaming, and data warehouse architecture.',
    skills: ['Data Engineering', 'Apache Spark', 'Kafka', 'SQL Optimization', 'Python', 'Distributed Pipelines'],
    technologies: ['Python', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Airflow', 'AWS'],
    mentoringTopics: ['Big Data Architecture', 'Data Modeling & ETL', 'Industry System Design'],
    availabilitySchedule: 'Weekends (11 AM - 5 PM IST)',
    hourlyRate: 0,
    isVerified: false,
    verificationStatus: 'PENDING',
    rating: 5.0,
    reviewsCount: 0,
    studentsHelpedCount: 0,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/kavita-data',
    linkedinUrl: 'https://linkedin.com/in/kavita-sharma-data',
    createdAt: pastDate(2),
    updatedAt: pastDate(1)
  },
  'usr_mentor_devendra': {
    userId: 'usr_mentor_devendra',
    title: 'Senior Security Architect',
    company: 'Razorpay',
    college: 'MANIT Bhopal (B.Tech CSE)',
    yearsExperience: 7,
    bio: 'DevSecOps and fintech infrastructure security specialist. Passionate about guiding capstone students in cloud security and vulnerability assessment.',
    skills: ['Application Security', 'DevSecOps', 'Cloud Security', 'PCI-DSS', 'Kubernetes Security', 'API Security Audits'],
    technologies: ['Go', 'Docker', 'Kubernetes', 'Trivy', 'HashiCorp Vault', 'AWS', 'Linux'],
    mentoringTopics: ['FinTech Security Compliance', 'Cloud Hardening', 'Vulnerability Assessment'],
    availabilitySchedule: 'Weekdays post 6 PM & Saturday',
    hourlyRate: 0,
    isVerified: false,
    verificationStatus: 'PENDING',
    rating: 5.0,
    reviewsCount: 0,
    studentsHelpedCount: 0,
    onboardingStep: 9,
    isCompleted: true,
    githubUrl: 'https://github.com/devendra-patle-sec',
    linkedinUrl: 'https://linkedin.com/in/devendra-patle',
    createdAt: pastDate(3),
    updatedAt: pastDate(1)
  }
};

// ----------------------------------------------------
// 4. MOCK PROJECTS & WORKSPACES
// ----------------------------------------------------
export const MOCK_PROJECTS: Record<string, Project> = {
  'proj_guidely_pbl': {
    id: 'proj_guidely_pbl',
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
    liveUrl: 'http://localhost:5173',
    createdAt: pastDate(45),
    updatedAt: pastDate(1),
    student: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    }
  },
  'proj_threat_intel': {
    id: 'proj_threat_intel',
    title: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector',
    description: 'Real-time deep packet inspection pipeline integrating machine learning anomaly detection with automated SOC alert generation and forensic PCAP analysis.',
    category: 'Cyber Security & Forensics',
    targetTechnologies: ['Python', 'PyTorch', 'FastAPI', 'Wireshark', 'Docker', 'SQLite'],
    currentStage: 'DEVELOPMENT',
    studentId: 'usr_student_abhimanyu',
    mentorId: 'usr_mentor_nitin',
    progressPercentage: 45,
    status: 'IN_PROGRESS',
    repositoryUrl: 'https://github.com/Abhimanyu-Sahu/threat-intel-ai',
    createdAt: pastDate(40),
    updatedAt: pastDate(2),
    student: {
      id: 'usr_student_abhimanyu',
      fullName: 'Abhimanyu Kumar Sahu',
      avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    }
  },
  'proj_vit_diagnosis': {
    id: 'proj_vit_diagnosis',
    title: 'Automated Chest X-Ray Diagnosis with Vision Transformers',
    description: 'Multi-label pulmonary disease classifier utilizing Vision Transformers (ViT) with gradient-weighted Class Activation Mapping (Grad-CAM) and mobile edge deployment.',
    category: 'Artificial Intelligence & Deep Learning',
    targetTechnologies: ['PyTorch', 'Vision Transformers', 'HuggingFace', 'FastAPI', 'React Native'],
    currentStage: 'TESTING',
    studentId: 'usr_student_sapna',
    mentorId: 'usr_mentor_rohan',
    progressPercentage: 80,
    status: 'IN_PROGRESS',
    repositoryUrl: 'https://github.com/Sapna-Jaiswal/xray-vit-classifier',
    createdAt: pastDate(50),
    updatedAt: pastDate(1),
    student: {
      id: 'usr_student_sapna',
      fullName: 'Sapna Jaiswal',
      avatarUrl: MOCK_USERS['usr_student_sapna'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_rohan',
      fullName: 'Dr. Rohan Mehra',
      avatarUrl: MOCK_USERS['usr_mentor_rohan'].avatarUrl,
      title: 'Principal AI Research Scientist',
      company: 'Microsoft IDC'
    }
  }
};

// Project Details for Guidely Workspace
export const MOCK_PROJECT_WORKSPACES: Record<string, {
  goals: ProjectGoal[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  resources: ProjectResource[];
  notes: ProjectNote[];
}> = {
  'proj_guidely_pbl': {
    goals: [
      {
        id: 'goal_1',
        projectId: 'proj_guidely_pbl',
        title: 'Design & Deploy Normalized Relational Database Schema',
        description: 'Implement 11 normalized tables with indexed foreign keys, constraints, and seed data.',
        isCompleted: true,
        targetDate: pastDate(30),
        orderIndex: 1,
        createdAt: pastDate(45)
      },
      {
        id: 'goal_2',
        projectId: 'proj_guidely_pbl',
        title: 'Implement Real-Time WebSocket Bidirectional Chat Engine',
        description: 'Build full-duplex socket server with unread badge tracking, online presence, and room delivery.',
        isCompleted: true,
        targetDate: pastDate(15),
        orderIndex: 2,
        createdAt: pastDate(40)
      },
      {
        id: 'goal_3',
        projectId: 'proj_guidely_pbl',
        title: 'Build Interactive Kanban Task Board with Dynamic Progress Calculation',
        description: 'Task state transitions (TODO, IN_PROGRESS, IN_REVIEW, DONE) that automatically recalculate progress.',
        isCompleted: true,
        targetDate: pastDate(5),
        orderIndex: 3,
        createdAt: pastDate(35)
      },
      {
        id: 'goal_4',
        projectId: 'proj_guidely_pbl',
        title: 'Develop Cross-Platform Mobile Client in React Native Expo',
        description: 'Mobile views for student daily standup, push alerts, and portable chat.',
        isCompleted: false,
        targetDate: futureDate(10),
        orderIndex: 4,
        createdAt: pastDate(25)
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
        orderIndex: 1,
        createdAt: pastDate(45)
      },
      {
        id: 'ms_2',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 2: Authentication, RBAC & Core REST APIs',
        description: 'JWT token signing, Bcrypt password hashing, Zod validation, and role-based route middleware.',
        status: 'COMPLETED',
        dueDate: pastDate(20),
        completedAt: pastDate(18),
        orderIndex: 2,
        createdAt: pastDate(35)
      },
      {
        id: 'ms_3',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 3: Real-Time Messaging & Project Workspace',
        description: 'WebSocket protocol integration, Jitsi Meet video scheduling, and Kanban state machine.',
        status: 'COMPLETED',
        dueDate: pastDate(5),
        completedAt: pastDate(4),
        orderIndex: 3,
        createdAt: pastDate(25)
      },
      {
        id: 'ms_4',
        projectId: 'proj_guidely_pbl',
        title: 'Phase 4: Mobile Client, Testing & Final Report Documentation',
        description: 'React Native mobile app views, automated test verification, and PBL report completion.',
        status: 'IN_PROGRESS',
        dueDate: futureDate(7),
        orderIndex: 4,
        createdAt: pastDate(15)
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
        orderIndex: 1,
        createdAt: pastDate(30),
        updatedAt: pastDate(22)
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
        orderIndex: 2,
        createdAt: pastDate(25),
        updatedAt: pastDate(14)
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
        orderIndex: 3,
        createdAt: pastDate(20),
        updatedAt: pastDate(7)
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
        orderIndex: 4,
        createdAt: pastDate(18),
        updatedAt: pastDate(4)
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
        orderIndex: 5,
        createdAt: pastDate(10),
        updatedAt: pastDate(1)
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
        orderIndex: 6,
        createdAt: pastDate(8),
        updatedAt: pastDate(1)
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
      },
      {
        id: 'res_3',
        projectId: 'proj_guidely_pbl',
        title: 'IETF RFC 6455 - The WebSocket Protocol',
        url: 'https://datatracker.ietf.org/doc/html/rfc6455',
        type: 'LINK',
        addedByRole: 'MENTOR',
        addedByName: 'Prof. Nitin Choudhary',
        createdAt: pastDate(12)
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
        content: 'Database normalization looks solid with indexed foreign keys and cascading deletes. The separation between student/mentor profile extensions and core user credentials is well implemented. Proceed to Phase 3 WebSocket integration.',
        isPrivateToMentor: false,
        createdAt: pastDate(20),
        updatedAt: pastDate(20)
      },
      {
        id: 'note_2',
        projectId: 'proj_guidely_pbl',
        authorId: 'usr_mentor_nitin',
        authorName: 'Prof. Nitin Choudhary',
        authorRole: 'MENTOR',
        title: 'Progress Engine Verification Note',
        content: 'Verified that completing Kanban tasks recalculates overall project percentage dynamically. The team demonstrated seamless state transitions on the board.',
        isPrivateToMentor: false,
        createdAt: pastDate(5),
        updatedAt: pastDate(5)
      }
    ]
  }
};

// ----------------------------------------------------
// 5. MENTORSHIP REQUESTS
// ----------------------------------------------------
export const MOCK_REQUESTS: MentorshipRequest[] = [
  {
    id: 'req_akshay_nitin',
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
    mentorNotes: 'Excellent problem statement addressing institutional project fragmentation. Approved for Phase 1-4 execution.',
    createdAt: pastDate(45),
    updatedAt: pastDate(44),
    student: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl,
      college: 'SAGE University Bhopal',
      degree: 'B.Tech CSE (Cyber Security)'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology',
      rating: 4.97
    }
  },
  {
    id: 'req_abhimanyu_nitin',
    studentId: 'usr_student_abhimanyu',
    mentorId: 'usr_mentor_nitin',
    projectTitle: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector',
    projectDescription: 'Real-time deep packet inspection pipeline integrating machine learning anomaly detection with automated SOC alerts.',
    currentKnowledge: 'Python, FastAPI, Network Forensics, SQLite, Cryptography',
    techKnown: ['Python', 'FastAPI', 'Wireshark', 'SQLite', 'Docker'],
    helpNeeded: ['Packet Capture Optimization', 'SIEM Integration'],
    expectedOutcome: 'High-throughput packet analyzer with real-time threat dashboard.',
    preferredTimes: 'Friday afternoons',
    status: 'ACCEPTED',
    mentorNotes: 'Strong alignment with Cyber Security specialization. Approved.',
    createdAt: pastDate(40),
    updatedAt: pastDate(39),
    student: {
      id: 'usr_student_abhimanyu',
      fullName: 'Abhimanyu Kumar Sahu',
      avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl,
      college: 'SAGE University Bhopal',
      degree: 'B.Tech CSE (Cyber Security)'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology',
      rating: 4.97
    }
  },
  {
    id: 'req_sapna_rohan',
    studentId: 'usr_student_sapna',
    mentorId: 'usr_mentor_rohan',
    projectTitle: 'Automated Chest X-Ray Diagnosis with Vision Transformers',
    projectDescription: 'Multi-label pulmonary disease classifier utilizing Vision Transformers (ViT) with Grad-CAM visualizations.',
    currentKnowledge: 'PyTorch, Python, HuggingFace, React Native',
    techKnown: ['PyTorch', 'HuggingFace', 'FastAPI', 'React Native'],
    helpNeeded: ['ViT Pre-training Strategies', 'Multi-label Loss Balancing'],
    expectedOutcome: 'Mobile diagnostic assistant app with benchmark evaluation paper.',
    preferredTimes: 'Saturday mornings',
    status: 'ACCEPTED',
    mentorNotes: 'Promising research direction in biomedical deep learning. Happy to mentor.',
    createdAt: pastDate(50),
    updatedAt: pastDate(49),
    student: {
      id: 'usr_student_sapna',
      fullName: 'Sapna Jaiswal',
      avatarUrl: MOCK_USERS['usr_student_sapna'].avatarUrl,
      college: 'SAGE University Bhopal',
      degree: 'B.Tech CSE (AI & ML)'
    },
    mentor: {
      id: 'usr_mentor_rohan',
      fullName: 'Dr. Rohan Mehra',
      avatarUrl: MOCK_USERS['usr_mentor_rohan'].avatarUrl,
      title: 'Principal AI Research Scientist',
      company: 'Microsoft IDC',
      rating: 4.98
    }
  },
  {
    id: 'req_abhimanyu_ananya',
    studentId: 'usr_student_abhimanyu',
    mentorId: 'usr_mentor_ananya',
    projectTitle: 'Zero-Trust Forensics Analysis Pipeline',
    projectDescription: 'Automating memory dump extraction and volatility analysis for incident triage in enterprise networks.',
    currentKnowledge: 'Memory forensics, Volatility framework, Python',
    techKnown: ['Python', 'Volatility', 'Linux'],
    helpNeeded: ['Enterprise Log Correlation', 'Zero-Trust Policy Mapping'],
    expectedOutcome: 'Automated forensics CLI tool.',
    preferredTimes: 'Sunday afternoons',
    status: 'PENDING',
    createdAt: pastDate(2),
    updatedAt: pastDate(2),
    student: {
      id: 'usr_student_abhimanyu',
      fullName: 'Abhimanyu Kumar Sahu',
      avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_ananya',
      fullName: 'Ananya Joshi',
      avatarUrl: MOCK_USERS['usr_mentor_ananya'].avatarUrl,
      title: 'Principal Cyber Threat Analyst',
      company: 'CERT-In',
      rating: 4.96
    }
  }
];

// ----------------------------------------------------
// 6. MENTORSHIP SESSIONS
// ----------------------------------------------------
export const MOCK_SESSIONS: MentorshipSession[] = [
  {
    id: 'sess_akshay_nitin_upcoming',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_guidely_pbl',
    title: 'PBL Phase 4 Review & Final Report Submission Check',
    agenda: '1. Review full-stack prototype deliverables\n2. Verify test pass rates across domain suites\n3. Final verification of PBL Report tables & contribution matrix',
    scheduledAt: futureDate(1, 15),
    durationMinutes: 45,
    status: 'CONFIRMED',
    meetingUrl: 'https://meet.jit.si/guidely-pbl-phase4-final-review',
    createdAt: pastDate(2),
    updatedAt: pastDate(1),
    student: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    },
    project: {
      id: 'proj_guidely_pbl',
      title: 'Guidely: E-learning & Collaborative Project Mentorship Platform'
    }
  },
  {
    id: 'sess_akshay_nitin_past',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_guidely_pbl',
    title: 'Phase 3 Milestone Demo: Real-Time WebSockets & Kanban Workspace',
    agenda: '1. Live demonstration of WebSocket event broadcasting\n2. Verification of dynamic progress metric calculation\n3. Review code modularity across repository and service layers',
    scheduledAt: pastDate(5),
    durationMinutes: 45,
    status: 'COMPLETED',
    meetingUrl: 'https://meet.jit.si/guidely-phase3-demo',
    sessionNotes: 'The live demonstration was successful. Real-time updates and task progress calculation are performing as specified.',
    studentFeedback: 'Prof. Nitin gave great architectural guidance on optimizing SQLite indexes and socket room subscriptions.',
    studentRating: 5,
    createdAt: pastDate(8),
    updatedAt: pastDate(5),
    student: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    },
    project: {
      id: 'proj_guidely_pbl',
      title: 'Guidely: E-learning & Collaborative Project Mentorship Platform'
    }
  },
  {
    id: 'sess_abhimanyu_nitin',
    studentId: 'usr_student_abhimanyu',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_threat_intel',
    title: 'Cyber Threat Model & Packet Inspection Architecture',
    agenda: '1. Discuss libpcap / socket sniffing throughput\n2. Review threat classification feature vectors\n3. Set goals for SOC alerting dashboard',
    scheduledAt: futureDate(3, 16),
    durationMinutes: 45,
    status: 'CONFIRMED',
    meetingUrl: 'https://meet.jit.si/guidely-threat-intel-review',
    createdAt: pastDate(3),
    updatedAt: pastDate(2),
    student: {
      id: 'usr_student_abhimanyu',
      fullName: 'Abhimanyu Kumar Sahu',
      avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    },
    project: {
      id: 'proj_threat_intel',
      title: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector'
    }
  },
  {
    id: 'sess_sapna_rohan',
    studentId: 'usr_student_sapna',
    mentorId: 'usr_mentor_rohan',
    projectId: 'proj_vit_diagnosis',
    title: 'Vision Transformer Attention Weights & Grad-CAM Review',
    agenda: '1. Evaluate multi-label ROC-AUC scores\n2. Inspect heatmaps generated by ViT attention rollout\n3. Prepare mobile app inference benchmarks',
    scheduledAt: pastDate(7),
    durationMinutes: 60,
    status: 'COMPLETED',
    sessionNotes: 'Sapna presented impressive validation results on the CheXpert dataset. ViT-B/16 achieved 0.89 AUC.',
    studentFeedback: 'Dr. Rohan provided deep mathematical clarity on Vision Transformer attention scaling.',
    studentRating: 5,
    createdAt: pastDate(10),
    updatedAt: pastDate(7),
    student: {
      id: 'usr_student_sapna',
      fullName: 'Sapna Jaiswal',
      avatarUrl: MOCK_USERS['usr_student_sapna'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    mentor: {
      id: 'usr_mentor_rohan',
      fullName: 'Dr. Rohan Mehra',
      avatarUrl: MOCK_USERS['usr_mentor_rohan'].avatarUrl,
      title: 'Principal AI Research Scientist',
      company: 'Microsoft IDC'
    },
    project: {
      id: 'proj_vit_diagnosis',
      title: 'Automated Chest X-Ray Diagnosis with Vision Transformers'
    }
  }
];

// ----------------------------------------------------
// 7. CONVERSATIONS & MESSAGES
// ----------------------------------------------------
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_akshay_nitin',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    lastMessageId: 'msg_akshay_5',
    lastMessageText: 'Yes Sir! We ran the engineering test suite with 100% pass rate and populated the entire docx report with our project details.',
    lastMessageAt: pastDate(0.1),
    unreadStudentCount: 0,
    unreadMentorCount: 0,
    createdAt: pastDate(45),
    updatedAt: pastDate(0.1),
    student: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    }
  },
  {
    id: 'conv_sapna_rohan',
    studentId: 'usr_student_sapna',
    mentorId: 'usr_mentor_rohan',
    lastMessageId: 'msg_sapna_2',
    lastMessageText: 'Thank you Dr. Rohan! The attention maps are now rendering clearly on the mobile client.',
    lastMessageAt: pastDate(1),
    unreadStudentCount: 0,
    unreadMentorCount: 0,
    createdAt: pastDate(50),
    updatedAt: pastDate(1),
    student: {
      id: 'usr_student_sapna',
      fullName: 'Sapna Jaiswal',
      avatarUrl: MOCK_USERS['usr_student_sapna'].avatarUrl
    },
    mentor: {
      id: 'usr_mentor_rohan',
      fullName: 'Dr. Rohan Mehra',
      avatarUrl: MOCK_USERS['usr_mentor_rohan'].avatarUrl,
      title: 'Principal AI Scientist',
      company: 'Microsoft IDC'
    }
  },
  {
    id: 'conv_abhimanyu_nitin',
    studentId: 'usr_student_abhimanyu',
    mentorId: 'usr_mentor_nitin',
    lastMessageId: 'msg_abhi_2',
    lastMessageText: 'I have configured the PCAP ingestion worker and connected it with the SQLite threat log.',
    lastMessageAt: pastDate(2),
    unreadStudentCount: 0,
    unreadMentorCount: 0,
    createdAt: pastDate(40),
    updatedAt: pastDate(2),
    student: {
      id: 'usr_student_abhimanyu',
      fullName: 'Abhimanyu Kumar Sahu',
      avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl
    },
    mentor: {
      id: 'usr_mentor_nitin',
      fullName: 'Prof. Nitin Choudhary',
      avatarUrl: MOCK_USERS['usr_mentor_nitin'].avatarUrl,
      title: 'Assistant Professor',
      company: 'School of Computer Technology'
    }
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv_akshay_nitin': [
    {
      id: 'msg_akshay_1',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_mentor_nitin',
      senderRole: 'MENTOR',
      senderName: 'Prof. Nitin Choudhary',
      text: 'Hello Akshay, how is the team progressing with the Guidely project deliverables?',
      isRead: true,
      createdAt: pastDate(2)
    },
    {
      id: 'msg_akshay_2',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_student_akshay',
      senderRole: 'STUDENT',
      senderName: 'Akshay Ramkishor Rahangdale',
      text: 'Good afternoon Sir! We have completed the full-stack architecture, WebSocket chat engine, and the interactive Kanban workspace with dynamic progress calculation.',
      isRead: true,
      createdAt: pastDate(1.8)
    },
    {
      id: 'msg_akshay_3',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_mentor_nitin',
      senderRole: 'MENTOR',
      senderName: 'Prof. Nitin Choudhary',
      text: 'Great work! Please ensure that all engineering test cases pass cleanly and that all milestone deliverables are updated in the PBL report format.',
      isRead: true,
      createdAt: pastDate(1)
    },
    {
      id: 'msg_akshay_4',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_student_akshay',
      senderRole: 'STUDENT',
      senderName: 'Akshay Ramkishor Rahangdale',
      text: 'Yes Sir! We ran the engineering test suite with 100% pass rate and populated the entire docx report with our project details.',
      isRead: true,
      createdAt: pastDate(0.5)
    },
    {
      id: 'msg_akshay_5',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_mentor_nitin',
      senderRole: 'MENTOR',
      senderName: 'Prof. Nitin Choudhary',
      text: 'Outstanding! Looking forward to reviewing the final demo in tomorrow\'s scheduled session.',
      isRead: true,
      createdAt: pastDate(0.1)
    },
    {
      id: 'msg_akshay_6',
      conversationId: 'conv_akshay_nitin',
      senderId: 'usr_student_akshay',
      senderRole: 'STUDENT',
      senderName: 'Akshay Ramkishor Rahangdale',
      text: 'Here is our latest system architecture diagram for your review:',
      attachments: [
        {
          name: 'guidely_system_architecture.png',
          url: 'https://res.cloudinary.com/Guidely/image/upload/guidely/projects/guidely_system_architecture.png',
          type: 'image/png',
          size: 384000
        }
      ],
      isRead: true,
      createdAt: pastDate(0.05)
    }
  ]
};

// ----------------------------------------------------
// 8. REVIEWS
// ----------------------------------------------------
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    studentId: 'usr_student_akshay',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_guidely_pbl',
    rating: 5,
    comment: 'Prof. Nitin Choudhary provided exceptional guidance throughout our PBL project. His insights into software architecture, role-based access control, and database normalization helped us build a robust, scalable platform.',
    isVerifiedMentorship: true,
    isApproved: true,
    createdAt: pastDate(5),
    student: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      avatarUrl: MOCK_USERS['usr_student_akshay'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    project: {
      id: 'proj_guidely_pbl',
      title: 'Guidely: E-learning & Collaborative Project Mentorship Platform'
    }
  },
  {
    id: 'rev_2',
    studentId: 'usr_student_sapna',
    mentorId: 'usr_mentor_rohan',
    projectId: 'proj_vit_diagnosis',
    rating: 5,
    comment: 'Dr. Rohan Mehra is a world-class AI researcher. His mentoring on Vision Transformers and Grad-CAM attention interpretation elevated our project to a research-grade standard.',
    isVerifiedMentorship: true,
    isApproved: true,
    createdAt: pastDate(7),
    student: {
      id: 'usr_student_sapna',
      fullName: 'Sapna Jaiswal',
      avatarUrl: MOCK_USERS['usr_student_sapna'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    project: {
      id: 'proj_vit_diagnosis',
      title: 'Automated Chest X-Ray Diagnosis with Vision Transformers'
    }
  },
  {
    id: 'rev_3',
    studentId: 'usr_student_abhimanyu',
    mentorId: 'usr_mentor_nitin',
    projectId: 'proj_threat_intel',
    rating: 5,
    comment: 'Great mentor! Guided me on real-time packet inspection techniques and forensic log storage.',
    isVerifiedMentorship: true,
    isApproved: true,
    createdAt: pastDate(10),
    student: {
      id: 'usr_student_abhimanyu',
      fullName: 'Abhimanyu Kumar Sahu',
      avatarUrl: MOCK_USERS['usr_student_abhimanyu'].avatarUrl,
      college: 'SAGE University Bhopal'
    },
    project: {
      id: 'proj_threat_intel',
      title: 'AI-Powered Cyber Threat Intelligence & Anomaly Detector'
    }
  }
];

// ----------------------------------------------------
// 9. NOTIFICATIONS
// ----------------------------------------------------
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'usr_student_akshay',
    title: 'Mentorship Session Confirmed 📅',
    message: 'Prof. Nitin Choudhary confirmed your session for tomorrow at 3:00 PM IST.',
    type: 'SESSION_CONFIRMED',
    link: 'student-sessions',
    isRead: false,
    createdAt: pastDate(1)
  },
  {
    id: 'notif_2',
    userId: 'usr_student_akshay',
    title: 'New Chat Message 💬',
    message: 'Prof. Nitin Choudhary sent you a message regarding project deliverables.',
    type: 'NEW_MESSAGE',
    link: 'messages',
    isRead: false,
    createdAt: pastDate(0.1)
  },
  {
    id: 'notif_3',
    userId: 'usr_student_akshay',
    title: 'Milestone Completed 🎉',
    message: 'Phase 3: Real-Time Messaging & Workspace has been marked as COMPLETED.',
    type: 'MILESTONE_UPDATED',
    link: 'project-workspace',
    isRead: true,
    createdAt: pastDate(4)
  },
  {
    id: 'notif_4',
    userId: 'usr_student_akshay',
    title: 'Review Verified ⭐',
    message: 'Your 5-star verified review for Prof. Nitin Choudhary is live on the platform.',
    type: 'REVIEW_RECEIVED',
    link: 'find-mentor',
    isRead: true,
    createdAt: pastDate(5)
  }
];

// ----------------------------------------------------
// 10. ADMIN ANALYTICS & REPORTS
// ----------------------------------------------------
export const MOCK_ADMIN_ANALYTICS: AdminAnalytics = {
  totalUsers: 128,
  totalStudents: 86,
  totalMentors: 42,
  totalActiveMentorships: 37,
  totalCompletedProjects: 24,
  totalSessions: 142,
  pendingVerifications: 2,
  pendingReports: 0,
  acceptanceRate: 92.4,
  monthlyGrowth: [
    { month: 'Jun', students: 24, mentors: 12, sessions: 18 },
    { month: 'Jul', students: 48, mentors: 24, sessions: 52 },
    { month: 'Aug', students: 86, mentors: 42, sessions: 142 }
  ],
  popularTechnologies: [
    { name: 'React 19 & TypeScript', count: 42 },
    { name: 'Node.js & Express', count: 38 },
    { name: 'Python & PyTorch', count: 35 },
    { name: 'Cyber Security & Forensics', count: 28 },
    { name: 'Docker & Kubernetes', count: 26 },
    { name: 'SQLite & Relational DBs', count: 24 },
    { name: 'Go (Golang)', count: 18 }
  ],
  domainDistribution: [
    { domain: 'Cyber Security & Forensics', percentage: 32 },
    { domain: 'Artificial Intelligence & ML', percentage: 30 },
    { domain: 'Full-Stack Web & Mobile', percentage: 24 },
    { domain: 'Cloud & Distributed Systems', percentage: 14 }
  ]
};

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep_1',
    reporterId: 'usr_student_akshay',
    reportedUserId: 'usr_mentor_vikram',
    reportType: 'MENTORSHIP_ISSUE',
    reason: 'Session Rescheduled',
    details: 'Mentor had a schedule conflict with an AWS client call and requested rescheduling to next Tuesday.',
    status: 'RESOLVED',
    adminNotes: 'Resolved amicably between student and mentor. Session successfully conducted on Tuesday.',
    createdAt: pastDate(20),
    updatedAt: pastDate(18),
    reporter: {
      id: 'usr_student_akshay',
      fullName: 'Akshay Ramkishor Rahangdale',
      role: 'STUDENT'
    },
    reportedUser: {
      id: 'usr_mentor_vikram',
      fullName: 'Vikram Sethi',
      role: 'MENTOR'
    }
  }
];
