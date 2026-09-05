import { SkillItem, AvailabilityPreset, TimezoneOption, AvailabilityScheduleData } from '../shared/types.js';

export const SKILL_CATEGORIES = [
  'All',
  'Languages',
  'Frontend & Mobile',
  'Backend & APIs',
  'Databases & Storage',
  'Cloud & DevOps',
  'AI / ML & Data',
  'Systems & Security'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export const PRESET_SKILLS: SkillItem[] = [
  // Programming Languages
  { name: 'Python', category: 'Languages' },
  { name: 'JavaScript', category: 'Languages' },
  { name: 'TypeScript', category: 'Languages' },
  { name: 'C / C++', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'Go', category: 'Languages' },
  { name: 'Rust', category: 'Languages' },
  { name: 'C#', category: 'Languages' },
  { name: 'Kotlin', category: 'Languages' },
  { name: 'Swift', category: 'Languages' },
  { name: 'PHP', category: 'Languages' },
  { name: 'Ruby', category: 'Languages' },
  { name: 'Dart', category: 'Languages' },
  { name: 'Scala', category: 'Languages' },
  { name: 'R', category: 'Languages' },
  { name: 'SQL', category: 'Languages' },
  { name: 'Linux / Bash', category: 'Languages' },
  { name: 'Solidity', category: 'Languages' },
  { name: 'Elixir', category: 'Languages' },

  // Frontend & Mobile
  { name: 'React', category: 'Frontend & Mobile' },
  { name: 'Next.js', category: 'Frontend & Mobile' },
  { name: 'React Native', category: 'Frontend & Mobile' },
  { name: 'Vue.js', category: 'Frontend & Mobile' },
  { name: 'Angular', category: 'Frontend & Mobile' },
  { name: 'Svelte', category: 'Frontend & Mobile' },
  { name: 'Flutter', category: 'Frontend & Mobile' },
  { name: 'Tailwind CSS', category: 'Frontend & Mobile' },
  { name: 'HTML / CSS', category: 'Frontend & Mobile' },
  { name: 'Redux', category: 'Frontend & Mobile' },
  { name: 'Vite', category: 'Frontend & Mobile' },
  { name: 'WebSockets', category: 'Frontend & Mobile' },
  { name: 'WebRTC', category: 'Frontend & Mobile' },
  { name: 'Three.js / 3D Web', category: 'Frontend & Mobile' },

  // Backend & APIs
  { name: 'Node.js', category: 'Backend & APIs' },
  { name: 'Express', category: 'Backend & APIs' },
  { name: 'FastAPI', category: 'Backend & APIs' },
  { name: 'Django', category: 'Backend & APIs' },
  { name: 'Flask', category: 'Backend & APIs' },
  { name: 'Spring Boot', category: 'Backend & APIs' },
  { name: 'ASP.NET Core', category: 'Backend & APIs' },
  { name: 'NestJS', category: 'Backend & APIs' },
  { name: 'REST APIs', category: 'Backend & APIs' },
  { name: 'GraphQL', category: 'Backend & APIs' },
  { name: 'gRPC', category: 'Backend & APIs' },
  { name: 'Microservices', category: 'Backend & APIs' },
  { name: 'Kafka', category: 'Backend & APIs' },
  { name: 'RabbitMQ', category: 'Backend & APIs' },

  // Databases & Storage
  { name: 'PostgreSQL', category: 'Databases & Storage' },
  { name: 'MongoDB', category: 'Databases & Storage' },
  { name: 'MySQL', category: 'Databases & Storage' },
  { name: 'Redis', category: 'Databases & Storage' },
  { name: 'SQLite', category: 'Databases & Storage' },
  { name: 'Firebase', category: 'Databases & Storage' },
  { name: 'Supabase', category: 'Databases & Storage' },
  { name: 'Elasticsearch', category: 'Databases & Storage' },
  { name: 'Prisma ORM', category: 'Databases & Storage' },
  { name: 'Cassandra', category: 'Databases & Storage' },
  { name: 'DynamoDB', category: 'Databases & Storage' },

  // Cloud & DevOps
  { name: 'Docker', category: 'Cloud & DevOps' },
  { name: 'Kubernetes', category: 'Cloud & DevOps' },
  { name: 'Git', category: 'Cloud & DevOps' },
  { name: 'GitHub Actions', category: 'Cloud & DevOps' },
  { name: 'CI/CD', category: 'Cloud & DevOps' },
  { name: 'AWS', category: 'Cloud & DevOps' },
  { name: 'Google Cloud (GCP)', category: 'Cloud & DevOps' },
  { name: 'Microsoft Azure', category: 'Cloud & DevOps' },
  { name: 'Terraform', category: 'Cloud & DevOps' },
  { name: 'Nginx', category: 'Cloud & DevOps' },

  // AI / ML & Data
  { name: 'Data Structures & Algorithms', category: 'AI / ML & Data' },
  { name: 'Machine Learning', category: 'AI / ML & Data' },
  { name: 'Deep Learning', category: 'AI / ML & Data' },
  { name: 'PyTorch', category: 'AI / ML & Data' },
  { name: 'TensorFlow', category: 'AI / ML & Data' },
  { name: 'Scikit-Learn', category: 'AI / ML & Data' },
  { name: 'Pandas & NumPy', category: 'AI / ML & Data' },
  { name: 'Large Language Models (LLMs)', category: 'AI / ML & Data' },
  { name: 'LangChain', category: 'AI / ML & Data' },
  { name: 'Computer Vision', category: 'AI / ML & Data' },
  { name: 'Natural Language Processing (NLP)', category: 'AI / ML & Data' },
  { name: 'MLOps', category: 'AI / ML & Data' },

  // Core CS & Systems
  { name: 'System Design', category: 'Core CS & Systems' },
  { name: 'Distributed Systems', category: 'Core CS & Systems' },
  { name: 'Cybersecurity', category: 'Core CS & Systems' },
  { name: 'Penetration Testing', category: 'Core CS & Systems' },
  { name: 'Operating Systems', category: 'Core CS & Systems' },
  { name: 'Computer Networks', category: 'Core CS & Systems' },
  { name: 'Cryptography', category: 'Core CS & Systems' },
  { name: 'Concurrency & Multithreading', category: 'Core CS & Systems' }
];

export const PRESET_SKILL_NAMES = new Set(PRESET_SKILLS.map(s => s.name.toLowerCase()));

/**
 * Filter skills catalog by search query and category
 */
export function searchSkillsCatalog(query?: string, category?: string): SkillItem[] {
  let results = [...PRESET_SKILLS];

  if (category && category !== 'All') {
    results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(s => s.name.toLowerCase().includes(q));
  }

  return results;
}

/**
 * Standard Target Technologies for Student Onboarding & Projects
 * Includes "No idea (Help Me Decide)" and high-demand modern technologies.
 */
export const NO_IDEA_TECH = 'No idea (Help Me Decide)';

export const TARGET_TECHNOLOGIES = [
  NO_IDEA_TECH,
  'AI Agents & LangChain',
  'LLMs & Fine-Tuning',
  'Go (Golang)',
  'Rust',
  'PyTorch & Deep Learning',
  'Kubernetes & Cloud Native',
  'Docker & Microservices',
  'Next.js & React',
  'TypeScript / Node.js',
  'FastAPI & Python',
  'PostgreSQL & pgvector',
  'Redis & Caching',
  'Apache Kafka',
  'GraphQL & gRPC',
  'WebSockets & Realtime',
  'Flutter & Mobile',
  'React Native & Expo',
  'AWS / Cloud Architecture',
  'Solidity & Smart Contracts',
  'Cybersecurity & SIEM',
  'Supabase & Serverless'
] as const;

/**
 * Standard Guidance Areas for Student Onboarding & Mentorship Requests
 * Includes "No idea (Need Guidance to Figure Out)" and modern engineering mentorship topics.
 */
export const NO_IDEA_HELP = 'No idea (Need Guidance to Figure Out)';

export const HELP_NEEDED_AREAS = [
  NO_IDEA_HELP,
  'Architecture & System Design',
  'Project Ideation & 0-to-1 Scoping',
  'Tech Stack & Framework Selection',
  'Concurrency & Deadlock Prevention',
  'Database Schema & Normalization',
  '1-on-1 Code Reviews & Clean Code',
  'AI Model Integration & Prompts',
  'Benchmarking, Latency & Load Testing',
  'CI/CD Pipelines & Cloud Deployment',
  'Authentication, RBAC & Security Hardening',
  'Resume, GitHub & Portfolio Review',
  'Technical Interview & Viva Prep'
] as const;

/**
 * Mentor Onboarding Preset Constants
 */
export const MENTOR_PRESET_SKILLS = [
  'Distributed Systems',
  'System Design',
  'Concurrency & Multithreading',
  'Deep Learning & PyTorch',
  'Computer Vision',
  'Full Stack Architecture',
  'Smart Contract Security',
  'WebRTC & Streaming',
  'Database Internals',
  'Microservices',
  'Code Reviews & Refactoring',
  'DevOps & Kubernetes',
  'Generative AI & LLMs',
  'Cloud Infrastructure',
  'Cybersecurity & Forensics',
  'Mobile Architecture',
  'API Design & Optimization',
  'Data Engineering & ETL'
] as const;

export const MENTOR_PRESET_TECHNOLOGIES = [
  'Go (Golang)',
  'Python',
  'PyTorch',
  'Rust',
  'TypeScript',
  'React',
  'Next.js',
  'gRPC',
  'Kubernetes',
  'Docker',
  'PostgreSQL',
  'Redis',
  'Kafka',
  'Solidity',
  'FastAPI',
  'AWS / GCP',
  'WebRTC',
  'Flutter',
  'C / C++',
  'GraphQL',
  'Java / Spring Boot',
  'Node.js',
  'Tailwind CSS',
  'LangChain',
  'MongoDB',
  'Terraform',
  'RabbitMQ',
  'Elasticsearch',
  'Swift',
  'Kotlin'
] as const;

export const MENTOR_PRESET_EXPERIENCE_HIGHLIGHTS = [
  'Open Source Maintainer / Core Contributor',
  'High-Throughput Production Systems (10k+ QPS)',
  'Multi-Region Cloud Architecture (AWS / GCP / Azure)',
  'Microservices & Distributed Tracing',
  'Tech Lead & Engineering Management',
  'AI / LLM Production Pipeline Deployment',
  'Research Publication (IEEE / ACM / NeurIPS)',
  'Startup Founder / 0-to-1 Architecture',
  'Security Auditing & Penetration Testing',
  'Zero-Downtime Database Migration'
] as const;

export const MENTOR_PRESET_TOPICS = [
  'System Architecture Formulation',
  'PR Code Reviews & Concurrency Debugging',
  'Research Formulation & Paper Guidance',
  'Mock System Design & Resume Polish',
  'Capstone Milestone Planning',
  'Benchmarking & Performance Profiling',
  'Database Normalization & Query Tuning',
  'Security Hardening & Code Audits',
  'Production Incident Post-Mortems',
  'Career & Interview Transition'
] as const;

/**
 * Normalize skill or technology name casing to official preset casing if known, otherwise clean whitespace
 */
export function normalizeSkillName(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  const skillMatch = PRESET_SKILLS.find(s => s.name.toLowerCase() === lower);
  if (skillMatch) return skillMatch.name;

  const mentorSkillMatch = MENTOR_PRESET_SKILLS.find(s => s.toLowerCase() === lower);
  if (mentorSkillMatch) return mentorSkillMatch;

  const mentorTechMatch = MENTOR_PRESET_TECHNOLOGIES.find(t => t.toLowerCase() === lower);
  if (mentorTechMatch) return mentorTechMatch;

  const mentorHighlightMatch = MENTOR_PRESET_EXPERIENCE_HIGHLIGHTS.find(h => h.toLowerCase() === lower);
  if (mentorHighlightMatch) return mentorHighlightMatch;

  const mentorTopicMatch = MENTOR_PRESET_TOPICS.find(tp => tp.toLowerCase() === lower);
  if (mentorTopicMatch) return mentorTopicMatch;

  const techMatch = TARGET_TECHNOLOGIES.find(t => t.toLowerCase() === lower);
  if (techMatch) return techMatch;

  const helpMatch = HELP_NEEDED_AREAS.find(h => h.toLowerCase() === lower);
  if (helpMatch) return helpMatch;

  return trimmed;
}

/**
 * Sanitize and deduplicate a skills list from client payloads
 */
export function sanitizeSkillsList(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];

  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const item of skills) {
    if (typeof item !== 'string') continue;
    const clean = normalizeSkillName(item);
    if (!clean || clean.length > 70) continue;

    const lower = clean.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      sanitized.push(clean);
    }
  }

  return sanitized.slice(0, 50); // maximum 50 skills to prevent payload abuse
}

/**
 * Standard Day Definitions for Availability
 */
export const AVAILABILITY_DAYS = [
  { key: 'Mon', label: 'Mon', full: 'Monday' },
  { key: 'Tue', label: 'Tue', full: 'Tuesday' },
  { key: 'Wed', label: 'Wed', full: 'Wednesday' },
  { key: 'Thu', label: 'Thu', full: 'Thursday' },
  { key: 'Fri', label: 'Fri', full: 'Friday' },
  { key: 'Sat', label: 'Sat', full: 'Saturday' },
  { key: 'Sun', label: 'Sun', full: 'Sunday' }
] as const;

/**
 * Common Availability Time Presets for Onboarding
 */
export const AVAILABILITY_PRESETS: AvailabilityPreset[] = [
  {
    id: 'morning',
    name: '🌅 Morning',
    description: '8:00 AM – 12:00 PM',
    startHour: 8,
    endHour: 12
  },
  {
    id: 'afternoon',
    name: '☀️ Afternoon',
    description: '12:00 PM – 5:00 PM',
    startHour: 12,
    endHour: 17
  },
  {
    id: 'evening',
    name: '🌆 Evening',
    description: '5:00 PM – 9:00 PM',
    startHour: 17,
    endHour: 21
  },
  {
    id: 'post-college',
    name: '🎓 Post-College',
    description: '6:00 PM – 10:00 PM',
    startHour: 18,
    endHour: 22
  },
  {
    id: 'late-night',
    name: '🌙 Late Night',
    description: '9:00 PM – 12:00 AM',
    startHour: 21,
    endHour: 24
  }
];

/**
 * Standard Supported Timezones for Guidely Mentorship
 */
export const AVAILABILITY_TIMEZONES: TimezoneOption[] = [
  { code: 'IST', label: 'IST (India Standard Time • UTC+5:30)' },
  { code: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { code: 'EST', label: 'EST (US Eastern Time • UTC-5)' },
  { code: 'PST', label: 'PST (US Pacific Time • UTC-8)' },
  { code: 'BST', label: 'BST / GMT (British Summer Time • UTC+1)' },
  { code: 'SGT', label: 'SGT (Singapore / Asia • UTC+8)' }
];

/**
 * Format a numeric hour (0 - 24) to a friendly 12-hour AM/PM string
 */
export function formatHour(hour: number): string {
  const normalized = Math.max(0, Math.min(24, Number(hour) || 0));
  if (normalized === 24) return '12:00 AM (midnight)';
  if (normalized === 0) return '12:00 AM';

  const h = Math.floor(normalized);
  const m = Math.round((normalized - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m === 0 ? '00' : m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${period}`;
}

/**
 * Sanitize raw string availability input
 */
export function sanitizeAvailabilityString(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 500);
}

/**
 * Sanitize and validate structured availability details payload
 */
export function sanitizeAvailabilityDetails(raw: unknown): AvailabilityScheduleData | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const input = raw as Partial<AvailabilityScheduleData>;
  const validDays = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  const days = Array.isArray(input.days)
    ? input.days.filter(d => typeof d === 'string' && validDays.has(d))
    : [];

  const startHour = typeof input.startHour === 'number' ? Math.max(0, Math.min(24, input.startHour)) : 18;
  const endHour = typeof input.endHour === 'number' ? Math.max(startHour, Math.min(24, input.endHour)) : 22;

  const timezone = typeof input.timezone === 'string' && input.timezone.trim()
    ? input.timezone.trim().slice(0, 10)
    : 'IST';

  const customNote = typeof input.customNote === 'string'
    ? input.customNote.trim().slice(0, 200)
    : undefined;

  const splitWeekends = Boolean(input.splitWeekends);
  const weekendStartHour = typeof input.weekendStartHour === 'number'
    ? Math.max(0, Math.min(24, input.weekendStartHour))
    : undefined;
  const weekendEndHour = typeof input.weekendEndHour === 'number'
    ? Math.max(weekendStartHour || 0, Math.min(24, input.weekendEndHour))
    : undefined;

  const totalWeeklyHours = typeof input.totalWeeklyHours === 'number' && input.totalWeeklyHours >= 0
    ? Math.min(168, input.totalWeeklyHours)
    : undefined;

  const formattedSchedule = typeof input.formattedSchedule === 'string'
    ? input.formattedSchedule.trim().slice(0, 500)
    : undefined;

  return {
    days,
    startHour,
    endHour,
    splitWeekends,
    weekendStartHour,
    weekendEndHour,
    timezone,
    customNote,
    totalWeeklyHours,
    formattedSchedule
  };
}

