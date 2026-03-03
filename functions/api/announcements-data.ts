export interface AnnouncementSection
{
    type: 'text' | 'list' | 'card' | 'tip';
    content?: string;
    items?: string[];
    title?: string;
}

export interface AnnouncementArticle
{
    intro: string;
    sections:
    {
        title: string;
        content: AnnouncementSection[];
    }[];
}

export interface AnnouncementData
{
    id: string;
    version: string;
    date: string;
    title: string;
    type: 'warning' | 'info'
    message: string;
    items?: string[];
    dismissible?: boolean;
    hasDetailPage: boolean;
    article?: AnnouncementArticle;
}

export const announcements: AnnouncementData[] =
[
    {
        id: 'feb-17-2026',
        version: '1.6.3',
        date: 'February 17, 2026',
        title: 'Event Sharing Now Available',
        type: 'info',
        message: 'We\'re adding a new feature that allows you to share an event with others to help them out.',
        items:
        [
            'Share events via links',
            'New events page UI',
            'Fixed issues with policies'
        ],
        dismissible: true,
        hasDetailPage: false
    }
]

// Get the latest announcements
export const getLatestAnnouncement = (): AnnouncementData =>
{
    return announcements[0];
}

// Get announcements by the year
export const getAnnouncementsByYear = (): Record<string, AnnouncementData[]> =>
{
    const byYear: Record<string, AnnouncementData[]> = {};

    announcements.forEach(announcement => {
        const year = new Date(announcement.date).getFullYear().toString();
        if (!byYear[year])
        {
            byYear[year] = [];
        }
        byYear[year].push(announcement);
    })

    return byYear;
}

export const getAnnouncementById = (id: string): AnnouncementData | undefined => {
  return announcements.find(a => a.id === id);
};