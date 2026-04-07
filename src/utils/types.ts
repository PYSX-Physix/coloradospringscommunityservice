/**
 * Original post data from API
 */
export interface PostData {
  id: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  current_participants: number;
  user_name: string;
  created_at: string;
  image_url?: string;
}

/**
 * Extended post data with UI-specific information
 */
export interface PostUI extends PostData {
  isSaved: boolean;
}

/**
 * Report categories for validation
 */
export const REPORT_CATEGORIES = [
  { value: 'spam_misleading', label: 'Spam or Misleading' },
  { value: 'inappropriate_content', label: 'Offensive or Harmful Content' },
  { value: 'safety_concerns', label: 'Safety Concerns' },
  { value: 'terms_violation', label: 'Violation of Terms' },
  { value: 'other', label: 'Other' },
] as const;

export type ReportCategoryType = typeof REPORT_CATEGORIES[number]['value'];
