import React from 'react';
import {
  Button,
  Badge,
  Text,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Divider,
  Link
} from "@fluentui/react-components";
import {
  MegaphoneLoud20Regular,
  Dismiss20Regular,
  ChevronRight20Regular
} from "@fluentui/react-icons";

// Latest announcement data
interface Announcement {
  id: string;
  version: string;
  date: string;
  title: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  items?: string[];
  link?: string;
  dismissible: boolean;
}

const latestAnnouncement: Announcement = {
  id: 'dec-27-2025',
  version: 'V12.27.2025.01',
  date: 'December 27, 2025',
  title: 'Privacy Policy & Terms of Service Updated',
  type: 'info',
  message: 'We\'ve updated our legal documents to provide more transparency about data handling.',
  items: [
    'New comprehensive Privacy Policy',
    'Updated Terms of Service',
    'Better clarity on data rights'
  ],
  link: '/policies/privacy-policy',
  dismissible: true
};

// Component 1: Top Banner (shows once per announcement)
export function AnnouncementBanner() {
  const [dismissed, setDismissed] = React.useState(() => {
    // Check if user has already dismissed this announcement
    const dismissedAnnouncements = localStorage.getItem('dismissed-announcements');
    if (dismissedAnnouncements) {
      const parsed = JSON.parse(dismissedAnnouncements);
      return parsed.includes(latestAnnouncement.id);
    }
    return false;
  });

  const handleDismiss = () => {
    const dismissedAnnouncements = localStorage.getItem('dismissed-announcements');
    const parsed = dismissedAnnouncements ? JSON.parse(dismissedAnnouncements) : [];
    parsed.push(latestAnnouncement.id);
    localStorage.setItem('dismissed-announcements', JSON.stringify(parsed));
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <MessageBar
      intent={latestAnnouncement.type}
      style={{ margin: '16px 0' }}
    >
      <MessageBarBody>
        <MessageBarTitle>{latestAnnouncement.title}</MessageBarTitle>
        <Text>{latestAnnouncement.message}</Text>
        {latestAnnouncement.link && (
          <Link href={latestAnnouncement.link} style={{ marginLeft: '8px' }}>
            Learn more <ChevronRight20Regular />
          </Link>
        )}
      </MessageBarBody>
      {latestAnnouncement.dismissible && (
        <Button
          appearance="transparent"
          icon={<Dismiss20Regular />}
          onClick={handleDismiss}
          aria-label="Dismiss"
        />
      )}
    </MessageBar>
  );
}

// Component 2: Announcement Icon with Popover (always accessible)
export function AnnouncementPopover() {
  const [hasUnread, setHasUnread] = React.useState(() => {
    const lastSeen = localStorage.getItem('last-seen-announcement');
    return lastSeen !== latestAnnouncement.id;
  });

  const handleOpen = () => {
    setHasUnread(false);
    localStorage.setItem('last-seen-announcement', latestAnnouncement.id);
  };

  return (
    <Popover onOpenChange={(_, data) => data.open && handleOpen()}>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<MegaphoneLoud20Regular />}
          style={{ position: 'relative', minWidth: '32px' }}
        >
          {hasUnread && (
            <Badge
              appearance="filled"
              color="important"
              size="small"
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                minWidth: '8px',
                height: '8px',
                padding: 0
              }}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverSurface style={{ width: '400px', maxWidth: '90vw' }}>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Text weight="bold" size={400}>What's New</Text>
            <Badge appearance="tint" color="informative" size="small">
              {latestAnnouncement.version}
            </Badge>
          </div>
          
          <Text size={300} style={{ display: 'block', marginBottom: '4px' }}>
            {latestAnnouncement.title}
          </Text>
          
          <Text size={200} style={{ display: 'block', marginBottom: '16px', color: '#666' }}>
            {latestAnnouncement.date}
          </Text>

          <Divider style={{ marginBottom: '16px' }} />

          <Text style={{ display: 'block', marginBottom: '12px' }}>
            {latestAnnouncement.message}
          </Text>

          {latestAnnouncement.items && latestAnnouncement.items.length > 0 && (
            <ul style={{ margin: '12px 0', paddingLeft: '20px' }}>
              {latestAnnouncement.items.map((item, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  <Text size={300}>{item}</Text>
                </li>
              ))}
            </ul>
          )}

          {latestAnnouncement.link && (
            <Button
              appearance="primary"
              as="a"
              href={latestAnnouncement.link}
              style={{ marginTop: '16px', width: '100%' }}
            >
              Learn More
            </Button>
          )}
        </div>
      </PopoverSurface>
    </Popover>
  );
}

// Component 3: Compact Announcement Section (for homepage/dashboard)
export function AnnouncementSection() {
  return (
    <div style={{ 
      padding: '16px', 
      border: '1px solid #333',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.1) 0%, rgba(0, 120, 212, 0.05) 100%)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <MegaphoneLoud20Regular style={{ marginTop: '2px', color: '#0078d4' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Text weight="semibold">{latestAnnouncement.title}</Text>
            <Badge appearance="tint" color="informative" size="small">
              New
            </Badge>
          </div>
          <Text size={300} style={{ display: 'block', marginBottom: '8px' }}>
            {latestAnnouncement.message}
          </Text>
          <Text size={200} style={{ color: '#666' }}>
            {latestAnnouncement.date}
          </Text>
        </div>
        {latestAnnouncement.link && (
          <Button
            appearance="subtle"
            size="small"
            as="a"
            href={latestAnnouncement.link}
            icon={<ChevronRight20Regular />}
          >
            Details
          </Button>
        )}
      </div>
    </div>
  );
}

// Component 4: Mini Version History Popover
export function VersionHistory() {
  const recentVersions = [
    { version: 'V12.27.2025', title: 'Privacy & Terms Update', date: 'Dec 27' },
    { version: 'V12.07.2025', title: 'Notifications Feature', date: 'Dec 7' },
    { version: 'V11.29.2025', title: 'Attendance Tracking', date: 'Nov 29' },
    { version: 'V11.25.2025', title: 'Beta Launch', date: 'Nov 25' }
  ];

  return (
    <Popover>
      <PopoverTrigger disableButtonEnhancement>
        <Button appearance="subtle" size="small">
          Version {latestAnnouncement.version}
        </Button>
      </PopoverTrigger>

      <PopoverSurface style={{ width: '300px' }}>
        <div style={{ padding: '16px' }}>
          <Text weight="bold" style={{ display: 'block', marginBottom: '12px' }}>
            Recent Updates
          </Text>
          
          {recentVersions.map((v, index) => (
            <div key={index} style={{ 
              padding: '8px', 
              borderLeft: index === 0 ? '3px solid #0078d4' : '3px solid transparent',
              marginBottom: '8px'
            }}>
              <Text size={300} weight={index === 0 ? 'semibold' : 'regular'} style={{ display: 'block' }}>
                {v.title}
              </Text>
              <Text size={200} style={{ color: '#666' }}>
                {v.version} • {v.date}
              </Text>
            </div>
          ))}

          <Divider style={{ margin: '12px 0' }} />
          
          <Link href="/announcements" style={{ fontSize: '14px' }}>
            View all updates
          </Link>
        </div>
      </PopoverSurface>
    </Popover>
  );
}