// String and date formatting utilities for Guidely Client

const HONORIFICS = new Set([
  'dr', 'dr.', 'prof', 'prof.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.',
  'miss', 'er', 'er.', 'shri', 'smt', 'sir', 'madam'
]);

/**
 * Formats a user's full name into an appropriate greeting / short display name.
 * Prevents titles/honorifics (e.g., "Dr.", "Prof.") from showing alone without the actual name.
 *
 * Examples:
 * - "Dr. Rohan Mehra" -> "Dr. Rohan"
 * - "Prof. Nitin Choudhary" -> "Prof. Nitin"
 * - "Akshay Sharma" -> "Akshay"
 * - "Dr. Rohan" -> "Dr. Rohan"
 * - "Dr." -> fallback
 */
export const formatGreetingName = (fullName?: string | null, fallback: string = 'User'): string => {
  if (!fullName || !fullName.trim()) return fallback;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return fallback;

  let index = 0;
  const titles: string[] = [];
  while (index < parts.length && HONORIFICS.has(parts[index].toLowerCase())) {
    titles.push(parts[index]);
    index++;
  }

  // If there are titles and an actual name after them
  if (titles.length > 0) {
    if (index < parts.length) {
      return `${titles.join(' ')} ${parts[index]}`;
    }
    // Only title was given, fallback
    return fallback;
  }

  // Regular name, return first name
  return parts[0];
};

/**
 * Returns initials from a name, safely ignoring leading honorifics like "Dr." or "Prof."
 * Example: "Dr. Rohan Mehra" -> "RM"
 */
export const formatInitials = (name?: string | null, fallback: string = 'U'): string => {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const nonHonorificParts = parts.filter(p => !HONORIFICS.has(p.toLowerCase()));
  const targetParts = nonHonorificParts.length > 0 ? nonHonorificParts : parts;

  return targetParts
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || fallback;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
