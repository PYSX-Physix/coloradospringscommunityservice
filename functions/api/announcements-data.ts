// functions/api/announcements-data.ts
//
// Shared types for announcements, plus the DB row ↔ AnnouncementData mapper.
// The hardcoded `announcements` array has been removed — data now lives in
// the `announcements` D1 table. Use the /api/announcements endpoints to read
// and manage announcements.

export interface AnnouncementSection {
  type: 'text' | 'list' | 'card' | 'tip';
  content?: string;
  items?: string[];
  title?: string;
}

export interface AnnouncementArticle {
  intro: string;
  sections: {
    title: string;
    content: AnnouncementSection[];
  }[];
}

export interface AnnouncementData {
  id: string;
  version: string;
  date: string;
  title: string;
  type: 'warning' | 'info';
  message: string;
  items?: string[];
  dismissible?: boolean;
  hasDetailPage: boolean;
  published?: boolean;
  article?: AnnouncementArticle;
}

/** Raw shape returned by D1 for a row in the `announcements` table. */
export interface AnnouncementRow {
  id: string;
  version: string;
  date: string;
  title: string;
  type: string;
  message: string;
  items: string | null;
  dismissible: number;
  has_detail_page: number;
  article: string | null;
  published: number;
  created_by: string | null;
  created_at: number;
  updated_at: number;
}

/** Shape accepted by POST and PUT endpoints. */
export interface AnnouncementInput {
  id: string;
  version: string;
  date: string;
  title: string;
  type: 'info' | 'warning';
  message: string;
  items?: string[];
  dismissible?: boolean;
  hasDetailPage?: boolean;
  published?: boolean;
  article?: AnnouncementArticle;
}

/** Converts a D1 row into the AnnouncementData shape used by the frontend. */
export function rowToAnnouncement(row: AnnouncementRow): AnnouncementData {
  return {
    id: row.id,
    version: row.version,
    date: row.date,
    title: row.title,
    type: row.type === 'warning' ? 'warning' : 'info',
    message: row.message,
    items: row.items ? (JSON.parse(row.items) as string[]) : undefined,
    dismissible: !!row.dismissible,
    hasDetailPage: !!row.has_detail_page,
    published: !!row.published,
    article: row.article ? (JSON.parse(row.article) as AnnouncementArticle) : undefined,
  };
}

/**
 * Groups a list of announcements by the year extracted from their `date` field.
 * Pure helper — pass in the array fetched from the API.
 */
export function getAnnouncementsByYear(
  announcements: AnnouncementData[]
): Record<string, AnnouncementData[]> {
  const byYear: Record<string, AnnouncementData[]> = {};
  announcements.forEach((a) => {
    const year = new Date(a.date).getFullYear().toString();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(a);
  });
  return byYear;
}
