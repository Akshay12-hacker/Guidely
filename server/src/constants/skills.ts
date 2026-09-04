import { SkillItem } from '../shared/types.js';

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
 * Normalize skill name casing to official preset casing if known, otherwise clean whitespace
 */
export function normalizeSkillName(raw: string): string {
  const trimmed = raw.trim();
  const match = PRESET_SKILLS.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
  return match ? match.name : trimmed;
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
    if (!clean || clean.length > 60) continue;

    const lower = clean.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      sanitized.push(clean);
    }
  }

  return sanitized.slice(0, 50); // maximum 50 skills to prevent payload abuse
}
