import { Filter } from "bad-words";

// Initialize filter
const filter = new Filter();

// Add custom words to blacklist (community service specific)
const customBadWords = [
    // Add inappropriate terms specific to your community
    'scam',
    'mlm',
    'pyramid',
    "idiot",
    "moron",
    "stupid",
    "dumb",
    "loser",
    "clown",
    "freak",
    "worthless",
    "pathetic",
    "trash",
    "ugly",
    ".zip link",
    "bit.ly",
    "tinyurl",
    ".ru",
    ".cn",
    ".tk",
    "🔥🔥🔥🔥",
    "BUYBUYBUYBUY",
    "f r e e m o n e y",
    "free free free free",
    "kill yourself",
    "i'll hurt you",
    "i will hurt you",
    "i'm going to find you",
    "you better watch out",
    "i'll beat you up",
    "nigger",
    "faggot",
    "slut",
    "whore",
    "bitch",
    "cuckslur",
    "cum",
    "dick pics"
    // Add more as needed
];

filter.addWords(...customBadWords);

// Optional: Add words to whitelist (false positives)
const whitelistWords = [
  // Words that might be flagged but are OK in your context
  'damn', // Example: "damn good cause"
];

filter.removeWords(...whitelistWords);

export interface FilterResult {
  isClean: boolean;
  originalText: string;
  filteredText: string;
  badWords: string[];
}

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

/**
 * Filter and clean text (replaces bad words with asterisks)
 */
export function cleanText(text: string): string {
  return filter.clean(text);
}

/**
 * Get detailed analysis of text
 */
export function analyzeText(text: string): FilterResult {
  const isClean = !filter.isProfane(text);
  const filteredText = filter.clean(text);
  
  // Extract bad words found
  const badWords: string[] = [];
  const words = text.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    if (filter.isProfane(word)) {
      badWords.push(word);
    }
  }

  return {
    isClean,
    originalText: text,
    filteredText,
    badWords: [...new Set(badWords)] // Remove duplicates
  };
}

/**
 * Check multiple fields at once
 */
export function validateContent(fields: { [key: string]: string }): {
  isValid: boolean;
  violations: { field: string; words: string[] }[];
} {
  const violations: { field: string; words: string[] }[] = [];

  for (const [fieldName, value] of Object.entries(fields)) {
    const analysis = analyzeText(value);
    if (!analysis.isClean) {
      violations.push({
        field: fieldName,
        words: analysis.badWords
      });
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}