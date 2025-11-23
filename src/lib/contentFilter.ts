import { Filter } from "bad-words";

// Initialize filter
const filter = new Filter();

// Add custom words to blacklist (community service specific)
const customBadWords = [
    // Scam/spam indicators
    'scam',
    'mlm',
    'pyramid scheme',
    'get rich quick',
    'crypto investment',
    'investment opportunity',
    'act now',
    'limited time',
    'cash app',
    'venmo me',
    'zelle',
    
    // Suspicious links
    '.zip link',
    'bit.ly',
    'tinyurl',
    '.ru/',
    '.cn/',
    '.tk/',
    'download here',
    'click here now',
    
    // Spam patterns
    '🔥🔥🔥',
    'free money',
    'easy money',
    'work from home',
    'make money fast',
    
    // Direct threats (combine with context)
    'kill yourself',
    'kys',
    'hurt you',
    "i'm going to find you",
    'watch your back',
    'you better watch out',
    
    // Harassment patterns
    'doxx',
    'dox',
    'swat',
    'your address',
];

filter.addWords(...customBadWords);

const whitelistWords = [
  // Words that might be flagged but are OK in your context
  'damn',
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