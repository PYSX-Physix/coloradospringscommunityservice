import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MegaphoneIcon, ChevronRightIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getAnnouncementsByYear } from '../functions/api/announcements-data';
import type { AnnouncementData } from '../functions/api/announcements-data';

function AnnouncementCard({ a }: { a: AnnouncementData }) {
  const navigate = useNavigate();
  return (
    <div
      className={`card p-4 hover:border-gray-600 transition-colors ${a.hasDetailPage ? 'cursor-pointer' : ''}`}
      onClick={() => a.hasDetailPage && navigate(`/announcements/${a.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'warning' ? 'bg-yellow-900/50' : 'bg-blue-900/50'}`}>
          {a.type === 'warning'
            ? <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            : <InformationCircleIcon className="w-5 h-5 text-blue-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-white text-sm">{a.title}</span>
            <span className="badge bg-blue-900/60 text-blue-300 border border-blue-700/50">{a.version}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{a.date}</p>
          <p className="text-sm text-gray-300">{a.message}</p>
          {a.items && a.items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {a.items.map((item, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                  <span className="text-blue-400 mt-0.5 shrink-0">•</span> {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        {a.hasDetailPage && (
          <ChevronRightIcon className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<AnnouncementData[] | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/announcements', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { announcements: AnnouncementData[] }) => {
        if (!cancelled) setAnnouncements(data.announcements ?? []);
      })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  const byYear = announcements ? getAnnouncementsByYear(announcements) : {};
  const years = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <MegaphoneIcon className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Announcements & Updates</h1>
          <p className="text-sm text-gray-400 mt-0.5">Stay up to date with the latest features and changes.</p>
        </div>
      </div>

      <div className="divider" />

      {error && (
        <div className="card p-4 text-center text-sm text-red-300">
          Couldn't load announcements right now. Please try again later.
        </div>
      )}

      {!error && !announcements && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading announcements…
          </div>
        </div>
      )}

      {!error && announcements?.length === 0 && (
        <div className="card p-4 text-center text-sm text-gray-400">No announcements yet.</div>
      )}

      {years.map(year => (
        <div key={year}>
          <h2 className="text-lg font-semibold text-blue-400 mb-3">{year}</h2>
          <div className="space-y-3">
            {byYear[year].map(a => <AnnouncementCard key={a.id} a={a} />)}
          </div>
        </div>
      ))}

      <div className="card p-4 text-center">
        <p className="text-sm text-gray-400">Have feedback or suggestions? Let us know how we can improve the platform.</p>
      </div>
    </div>
  );
}
