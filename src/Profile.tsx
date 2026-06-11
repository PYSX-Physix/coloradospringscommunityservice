import React from 'react';
import { useSession } from './lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from './hooks/useIsMobile';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

interface AttendanceRecord {
  event_title: string; event_organizer: string; event_location: string;
  event_start_datetime: string; event_end_datetime: string; checked_in_at: number;
}

function truncate(text: string, isMobile: boolean) {
  const max = isMobile ? 12 : 24;
  return text.length <= max ? text : text.substring(0, max) + '…';
}

export default function Profile() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [history, setHistory] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!isPending && !session) navigate('/auth');
  }, [session, isPending, navigate]);

  React.useEffect(() => {
    if (session?.user) {
      fetch('/api/participants/history', { credentials: 'include' })
        .then(r => r.json())
        .then(d => setHistory(d.history || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const fmtDate = (v: string | number) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (v: string | number) => new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

  if (isPending) return (
    <div className="flex justify-center mt-12">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!session) return null;

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
      <div className="divider" />

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">Event Attendance History</h2>
          {history.length > 0 && (
            <span className="badge bg-green-900/60 text-green-300 border border-green-700 flex items-center gap-1">
              <CheckBadgeIcon className="w-3 h-3" /> {history.length} events
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Shows only events where an organizer confirmed your attendance. Records are kept permanently even if the event is deleted.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 py-4">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading attendance history...
          </div>
        ) : history.length === 0 ? (
          <p className="text-gray-400 py-4">You haven't attended any confirmed events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="table-header">Event</th>
                  <th className="table-header">Organizer</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Event Date</th>
                  <th className="table-header">End Date</th>
                  <th className="table-header">Attended On</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors">
                    <td className="table-cell text-white font-medium">{truncate(r.event_title, isMobile)}</td>
                    <td className="table-cell">{truncate(r.event_organizer, isMobile)}</td>
                    <td className="table-cell">{truncate(r.event_location, isMobile)}</td>
                    <td className="table-cell">{fmtDate(r.event_start_datetime)}</td>
                    <td className="table-cell">{fmtDate(r.event_end_datetime)}</td>
                    <td className="table-cell">{fmtTime(r.checked_in_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}