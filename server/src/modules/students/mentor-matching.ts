// Profile-Based Mentor Recommendation Engine

import { MentorProfile, User, RecommendedMentor, MentorRecommendationCriteria } from '../../shared/types.js';
import { NO_IDEA_TECH, NO_IDEA_HELP } from '../../constants/skills.js';

// Common technical aliases and normalizations
const TECH_ALIASES: Record<string, string[]> = {
  'go': ['go', 'golang', 'go (golang)'],
  'golang': ['go', 'golang', 'go (golang)'],
  'k8s': ['kubernetes', 'k8s'],
  'kubernetes': ['kubernetes', 'k8s'],
  'postgres': ['postgresql', 'postgres'],
  'postgresql': ['postgresql', 'postgres'],
  'react native': ['react native', 'mobile', 'react-native'],
  'pytorch': ['pytorch', 'torch', 'deep learning'],
  'python': ['python', 'fastapi', 'django', 'flask'],
  'node': ['node', 'node.js', 'nodejs', 'express'],
  'docker': ['docker', 'containers', 'containerization'],
  'aws': ['aws', 'amazon web services', 'cloud'],
  'security': ['security', 'cyber security', 'penetration testing', 'forensics'],
  'distributed': ['distributed systems', 'concurrency', 'raft', 'consensus', 'microservices', 'grpc', 'kafka']
};

export interface MentorWithUser {
  profile: MentorProfile;
  user: User;
}

function normalize(str: string): string {
  return (str || '').toLowerCase().trim();
}

function wordsFromText(text: string): string[] {
  if (!text) return [];
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'want', 'build',
    'need', 'like', 'some', 'into', 'have', 'help', 'using', 'will', 'what',
    'project', 'system', 'application', 'app', 'student', 'about'
  ]);
  return normalize(text)
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

function matchesTech(studentTech: string, mentorItem: string): boolean {
  const st = normalize(studentTech);
  const mt = normalize(mentorItem);
  if (!st || !mt) return false;
  if (st === mt) return true;
  if (mt.includes(st) || st.includes(mt)) return true;

  // Check aliases
  for (const [key, aliases] of Object.entries(TECH_ALIASES)) {
    if (aliases.some(a => a === st || st.includes(a))) {
      if (aliases.some(a => a === mt || mt.includes(a))) {
        return true;
      }
    }
  }

  return false;
}

export function scoreAndRankMentors(
  mentors: MentorWithUser[],
  criteria: MentorRecommendationCriteria = {},
  limit: number = 6
): RecommendedMentor[] {
  const targetTech = (criteria.targetTechnologies || []).filter((t: string) => t !== NO_IDEA_TECH);
  const helpAreas = (criteria.helpNeededAreas || []).filter((h: string) => h !== NO_IDEA_HELP);
  const currentSkills = criteria.currentSkills || [];
  const projectIdea = criteria.projectIdea || '';
  const query = criteria.query || '';
  const preferences = normalize(criteria.preferences || '');

  // Extract combined concept keywords from project description & free-text query
  const combinedText = `${projectIdea} ${query}`;
  const keywords = wordsFromText(combinedText);

  const scoredMentors = mentors.map(({ profile, user }) => {
    let score = 48; // Baseline score for verified active mentors
    const matchReasons: string[] = [];
    const matchedTechnologies: string[] = [];
    const matchedTopics: string[] = [];

    const mentorHighlights = profile.experienceHighlights || [];
    const mentorProjectsExp = profile.projectsExperience || '';
    const mentorAllTech = [...(profile.technologies || []), ...(profile.skills || [])];
    const mentorTopics = profile.mentoringTopics || [];
    const mentorBio = normalize(
      `${profile.bio} ${profile.title} ${profile.company} ${mentorProjectsExp} ${mentorHighlights.join(' ')}`
    );

    // 1. Target Technologies Match (Weight: up to 30 points)
    if (targetTech.length > 0) {
      targetTech.forEach((tech: string) => {
        const found = mentorAllTech.find(mt => matchesTech(tech, mt));
        if (found && !matchedTechnologies.includes(found)) {
          matchedTechnologies.push(found);
          score += 10;
        }
      });
      if (matchedTechnologies.length > 0) {
        matchReasons.push(`Expertise in your target stack: ${matchedTechnologies.slice(0, 3).join(', ')}`);
      }
    }

    // 2. Help Needed Areas & Mentoring Topics Match (Weight: up to 20 points)
    if (helpAreas.length > 0) {
      helpAreas.forEach((area: string) => {
        const normArea = normalize(area);
        const foundTopic = mentorTopics.find(mt => {
          const nmt = normalize(mt);
          return nmt.includes(normArea) || normArea.includes(nmt) ||
            wordsFromText(normArea).some(w => nmt.includes(w));
        });
        if (foundTopic && !matchedTopics.includes(foundTopic)) {
          matchedTopics.push(foundTopic);
          score += 8;
        }
      });
      if (matchedTopics.length > 0) {
        matchReasons.push(`Direct guidance in: ${matchedTopics.slice(0, 2).join(', ')}`);
      }
    }

    // 3. Project Idea & Keyword Domain Matching (Weight: up to 20 points)
    if (keywords.length > 0) {
      let keywordHits = 0;
      keywords.forEach(kw => {
        const hasInBio = mentorBio.includes(kw);
        const hasInTech = mentorAllTech.some(t => normalize(t).includes(kw));
        const hasInTopics = mentorTopics.some(t => normalize(t).includes(kw));
        const hasInHighlights = mentorHighlights.some(h => normalize(h).includes(kw));

        if (hasInBio || hasInTech || hasInTopics || hasInHighlights) {
          keywordHits++;
          score += 4;
        }
      });

      if (keywordHits >= 2) {
        matchReasons.push(`Specialized domain alignment with your project (${profile.company})`);
      }
    }

    // 4. Experience Highlights Alignment (Bonus Weight: up to 6 points)
    if (mentorHighlights.length > 0 && keywords.length > 0) {
      const matchedHighlight = mentorHighlights.find(h => {
        const nh = normalize(h);
        return keywords.some(kw => nh.includes(kw));
      });
      if (matchedHighlight && matchReasons.length < 3) {
        matchReasons.push(`Production experience: ${matchedHighlight}`);
        score += 6;
      }
    }

    // 5. Mentor Background & Company Preferences Match (Weight: up to 10 points)
    if (preferences) {
      if (mentorBio.includes(preferences) || preferences.split(/\s+/).some(p => p.length > 3 && mentorBio.includes(p))) {
        score += 8;
        matchReasons.push(`Matches your preference for ${profile.company}`);
      }
    }

    // 6. Mentor Seniority & Reputation Rating Factor
    const ratingBoost = Math.max(0, ((profile.rating || 5.0) - 4.5) * 8);
    const expBoost = Math.min(6, (profile.yearsExperience || 0) * 0.7);
    score += ratingBoost + expBoost;

    // Fallback reason if needed
    if (matchReasons.length === 0) {
      matchReasons.push(
        `${profile.yearsExperience}+ years experience as ${profile.title} at ${profile.company}`
      );
    }
    if (matchReasons.length === 1 && profile.studentsHelpedCount > 10) {
      matchReasons.push(`Helped ${profile.studentsHelpedCount}+ students successfully complete projects`);
    }

    // Clamp score to realistic 60% - 99%
    const finalScore = Math.min(99, Math.max(60, Math.round(score)));

    const anyUser = user as any;
    const result: RecommendedMentor = {
      id: anyUser.id || anyUser._id || profile.userId,
      userId: profile.userId,
      full_name: user.fullName,
      fullName: user.fullName,
      avatar_url: user.avatarUrl,
      avatarUrl: user.avatarUrl,
      headline: user.headline,
      title: profile.title,
      company: profile.company,
      college: profile.college,
      years_experience: profile.yearsExperience,
      yearsExperience: profile.yearsExperience,
      skills: profile.skills || [],
      technologies: profile.technologies || [],
      mentoringTopics: profile.mentoringTopics || [],
      experienceHighlights: profile.experienceHighlights || [],
      projectsExperience: profile.projectsExperience || '',
      rating: profile.rating || 5.0,
      reviews_count: profile.reviewsCount || 0,
      reviewsCount: profile.reviewsCount || 0,
      students_helped_count: profile.studentsHelpedCount || 0,
      studentsHelpedCount: profile.studentsHelpedCount || 0,
      availability_schedule: profile.availabilitySchedule || '',
      availabilitySchedule: profile.availabilitySchedule || '',
      matchScore: finalScore,
      matchReasons,
      matchedTechnologies,
      matchedTopics,
      user
    };

    return result;
  });

  scoredMentors.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return (b.studentsHelpedCount || 0) - (a.studentsHelpedCount || 0);
  });

  return scoredMentors.slice(0, limit);
}
