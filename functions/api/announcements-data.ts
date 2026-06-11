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
        id: 'june-10-2026',
        version: '1.8.1',
        date: 'June 10, 2026',
        title: 'New Look, Fixes, & Policy Updates',
        type: 'info',
        message: 'This update brings a new look along with several bug fixes from the previous version of the site! Announcements are back as well so you can look through previous patches!',
        items:
        [
            'Changed the UI framework from FluentUI (provided by Microsoft) to TailwindCSS',
            'Fixed an issue where the date and time were blank upon opening the edit dialog',
            'Fixed an issue where an organizer of an event could report themselves and their post'
        ],
        dismissible: true,
        hasDetailPage: true,
        article:
        {
            intro: 'Version 1.8.1 fixes and revamps almost the entire site! This patch brings along new changes, fixes to long time bugs, and new features and quality of life changes!',
            sections:
            [
                {
                    title: 'New UI Layout',
                    content:
                    [
                        {
                            type: 'text',
                            content: 'We\'ve decided to revamp the sites look into something else rather than relying on a full built UI framework such as FluentUI by Microsoft. This new CSS framework created by Tailwind CSS gives us greater control of how we want to design and style our site in a easy way.'
                        },
                        {
                            type: 'tip',
                            content: 'While the new look and feel of the site may be different, the overall navigation and layout of the site is still the same before we made this signifigant change. The layout is planned to stay the same in order to give a sense of familiarity to users.'
                        }
                    ]
                },
                {
                    title: 'Bug Fixes',
                    content:
                    [
                        {
                            type: 'card',
                            title: 'Date and time parameters are blank when opening the edit dialog',
                            content: 'This bug has been extremely persistent when using Fluent UI and that was part of the reason we migrated to Tailwind CSS. This bug is now fixed in this update.'
                        },
                        {
                            type: 'card',
                            title: 'Reporting yourself',
                            content: 'We\'ve removed the ability to report yourself through an event or reporting your own event. There are different reasons why we did this such as spam, false reports, and security.' 
                        },
                        {
                            type: 'card',
                            title: 'Menus and Overlays',
                            content: 'This issue has now been fixed using a different method than before.'
                        }
                    ]
                },
                {
                    title: 'Known Issues',
                    content:
                    [
                        {
                            type: 'card',
                            title: 'Layout Issues',
                            content: 'There are some layout issues regarding the notifications and announcements buttons at the top left of the pages. This will be fixed in a hotfix.'
                        }
                    ]
                },
                {
                    title: '',
                    content:
                    [
                        {
                            type: 'text',
                            content: 'That\'s it! It is understandable that this is both a big and small update to the site due to the new design and the minor bug fixes made to the project. Please note that these issues took a while to fix which is why there was little updates during April and May hopefully with this new design out of the way we can get back on track with releasing regular updates.'
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 'march-17-2026',
        version: '1.7.0',
        date: 'March 17, 2026',
        title: 'Security Updates, Bug Fixes & New Features',
        type: 'info',
        message: 'This update includes important security improvements, several bug fixes, and two new features — a fully working Settings page and an expanded Help page.',
        items:
        [
            'Improved password security (PBKDF2 hashing)',
            'Fixed event deletion requiring authentication',
            'Fixed share link pointing to wrong page',
            'Content filtering now enforced on the server',
            'New Settings page — change your name, email, and password',
            'New Help page — step-by-step guides and FAQ',
            'Updated schema documentation'
        ],
        dismissible: true,
        hasDetailPage: true,
        article:
        {
            intro: 'Version 1.7.0 is a maintenance and improvement release. It addresses several security issues found during a code review, fixes bugs that have been present since launch, and delivers two features that were previously stubbed out but non-functional.',
            sections:
            [
                {
                    title: 'Security Improvements',
                    content:
                    [
                        {
                            type: 'text',
                            content: 'Password storage has been upgraded from SHA-256 to PBKDF2 with 100,000 iterations and a unique random salt per password. SHA-256 is a fast hashing algorithm — which is exactly the wrong property for storing passwords, since it makes brute-force attacks cheap. PBKDF2 is intentionally slow, making cracking impractical.'
                        },
                        {
                            type: 'tip',
                            content: 'Existing accounts are not broken — the old format is still accepted on sign-in. New accounts and password changes will automatically use the new format.'
                        },
                        {
                            type: 'text',
                            content: 'Password verification now uses a constant-time comparison, which prevents timing attacks where an attacker could infer information about a password by measuring how long the server takes to respond.'
                        },
                        {
                            type: 'text',
                            content: 'Content filtering has been moved server-side. Previously the filter only ran in the browser, meaning anyone calling the API directly could bypass it entirely. Filters now run on every post creation and edit on the server, regardless of how the request is made.'
                        }
                    ]
                },
                {
                    title: 'Bug Fixes',
                    content:
                    [
                        {
                            type: 'card',
                            title: 'Share link was broken',
                            content: 'The "Share Event" button was generating a link to the home page (/?id=) instead of the event detail page (/post?id=). Anyone who shared an event link was sending recipients to the home page, not the event. This is now fixed.'
                        },
                        {
                            type: 'card',
                            title: 'Deleting events silently failed',
                            content: 'The delete request was missing credentials: include, so the session cookie was never sent to the server. The server would return 401 Unauthorized and the event would not be deleted, with no clear error shown to the user. This is now fixed.'
                        },
                        {
                            type: 'card',
                            title: 'Schema documentation was out of date',
                            content: 'The schema.sql file was missing most of the tables and columns that the app actually uses — including the user, session, notifications, and blacklisted_words tables, as well as all the attendance-related columns on participants. It has been fully rewritten to match the live database, with a migration section for existing databases.'
                        }
                    ]
                },
                {
                    title: 'New: Settings Page',
                    content:
                    [
                        {
                            type: 'text',
                            content: 'The Settings page was previously a placeholder that just showed a single line of text. It is now a fully functional page where you can update your display name, email address, and password.'
                        },
                        {
                            type: 'list',
                            items:
                            [
                                'Change your display name — this is what other users see on event pages and participant lists',
                                'Change your email address — verified to not already be in use',
                                'Change your password — requires entering your current password first as confirmation',
                                'Inline success and error feedback on both forms'
                            ]
                        },
                        {
                            type: 'tip',
                            content: 'To reach Settings, click your name in the top-left corner of the app and select "Settings" from the menu.'
                        }
                    ]
                },
                {
                    title: 'New: Help Page',
                    content:
                    [
                        {
                            type: 'text',
                            content: 'The Help page previously had a single card with a "Learn More" button that went nowhere. It now contains six complete step-by-step guides and a Frequently Asked Questions section.'
                        },
                        {
                            type: 'list',
                            items:
                            [
                                'Creating an Event — how to post a new community service opportunity',
                                'Signing Up for an Event — how to register as a participant',
                                'Tracking Attendance — how organizers mark attendance and download sign-in sheets',
                                'Saving Events — how to bookmark events for later',
                                'Reporting a Post or User — how to flag inappropriate content',
                                'Your Service History — how to view and understand your attendance record',
                                'FAQ — common questions about the platform'
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 'march-16-2026',
        version: '1.6.5',
        date: 'March 16, 2026',
        title: 'Fixed Mobile Layout Issues',
        type: 'info',
        message: 'We have fixed some layout issues on mobile devices, especially on the event details page and the my posts page. This is to make the site more accessible and user-friendly for mobile users.',
        items:
        [
            'Improved mobile layout for event details page',
            'Improved mobile layout for my posts page'
        ],
        dismissible: true,
        hasDetailPage: false
    },
    {
        id: 'march-5-2026',
        version: '1.6.4',
        date: 'March 5, 2026',
        title: 'Fixed Minor Layout Issues',
        type: 'info',
        message: 'As known, the \'My Posts\' tables with joined events, saved events, and created events would overlap each other and cause readability issues. This update aims to fix and mitigate this issue',
        items:
        [
            'Made system to truncate text',
            'Fixed layout issue \'My Posts\' tab'
        ],
        dismissible: true,
        hasDetailPage: false
    },
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
