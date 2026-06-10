import React from 'react';
import { MegaphoneIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getLatestAnnouncement } from '../functions/api/announcements-data';

export function AnnouncementBanner() {
  const latestAnnouncement = getLatestAnnouncement();

  const [dismissed, setDismissed] = React.useState(() => {
    try {
      const stored = localStorage.getItem('dismissed-announcements');
      if (stored) return JSON.parse(stored).includes(latestAnnouncement.id);
    } catch { /* silent */ }
    return false;
  });

  const handleDismiss = () => {
    try {
      const stored = localStorage.getItem('dismissed-announcements');
      const parsed = stored ? JSON.parse(stored) : [];
      parsed.push(latestAnnouncement.id);
      localStorage.setItem('dismissed-announcements', JSON.stringify(parsed));
    } catch { /* silent */ }
    setDismissed(true);
  };

  if (dismissed || !latestAnnouncement.dismissible) return null;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border mb-4 ${
      latestAnnouncement.type === 'warning'
        ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-200'
        : 'bg-blue-900/30 border-blue-700/50 text-blue-200'
    }`}>
      <MegaphoneIcon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{latestAnnouncement.title}</p>
        <p className="text-sm opacity-80 mt-0.5">{latestAnnouncement.message}</p>
        {latestAnnouncement.hasDetailPage && (
          <Link to={`/announcements/${latestAnnouncement.id}`} className="text-xs underline mt-1 inline-flex items-center gap-1">
            Learn more <ChevronRightIcon className="w-3 h-3" />
          </Link>
        )}
      </div>
      {latestAnnouncement.dismissible && (
        <button onClick={handleDismiss} className="p-1 opacity-60 hover:opacity-100">
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function AnnouncementPopover() {
  const latestAnnouncement = getLatestAnnouncement();
  const [open, setOpen] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(() => {
    try {
      return localStorage.getItem('last-seen-announcement') !== latestAnnouncement.id;
    } catch { return true; }
  });
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    setHasUnread(false);
    try { localStorage.setItem('last-seen-announcement', latestAnnouncement.id); } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="btn-ghost p-2 relative" aria-label="Announcements">
        <MegaphoneIcon className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="font-semibold text-white text-sm">What's New</span>
            <span className="badge bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {latestAnnouncement.version}
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-white">{latestAnnouncement.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{latestAnnouncement.date}</p>
            <div className="divider" />
            <p className="text-sm text-gray-300">{latestAnnouncement.message}</p>
            {latestAnnouncement.items && latestAnnouncement.items.length > 0 && (
              <ul className="mt-2 space-y-1">
                {latestAnnouncement.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                    <span className="text-blue-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            )}
            {latestAnnouncement.hasDetailPage && (
              <Link
                to={`/announcements/${latestAnnouncement.id}`}
                onClick={() => setOpen(false)}
                className="mt-3 btn-primary text-sm w-full text-center block"
              >
                Read Full Article
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}