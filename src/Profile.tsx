import React from "react";
import { useSession } from "./lib/auth-client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "./hooks/useIsMobile";

interface AttendanceRecord {
  event_title: string;
  event_organizer: string;
  event_location: string;
  event_start_datetime: string;
  event_end_datetime: string;
  checked_in_at: number;
}

function truncate(text: string, isMobile: boolean): string {
  const maxChars = isMobile ? 8 : 24;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "...";
}

export default function Profile() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [eventHistory, setEventHistory] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!isPending && !session) {
      navigate("/auth");
    }
  }, [session, isPending, navigate]);

  React.useEffect(() => {
    if (session?.user) {
      fetchEventHistory();
    }
  }, [session]);

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/participants/history', {
        credentials: 'include',
      });
      const data = await res.json();
      setEventHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching event history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string | number) => {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (value: string | number) => {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const thClass = "text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-700";
  const tdClass = "px-4 py-3 text-sm text-gray-300 border-b border-gray-700/50";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Profile</h1>
      <hr className="border-gray-600"/>

      <div className="bg[#2d2d2d] border border-gray-700 rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Event Attendance History</h2>
        <p className="text-sm text-gray-400">
          Shows only events where an organizer confirmed your attendance. Records are kept
          permanently, even if the event is later deleted.
        </p>
        {loading ? (
          <p className="text-gray-400 animate-pulse text-sm">Loading attendance history</p>
        ): eventHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">
            You haven't attended any confirmed events yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Badge */}
            <div className="self-start bg-green-900/40 border border-green-700 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
              Total Events Attended: {eventHistory.length}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full">
                <thead className="bg-[#242424]">
                  <tr>
                    <th className={thClass}>Event</th>
                    <th className={thClass}>Organizer</th>
                    <th className={thClass}>Location</th>
                    <th className={thClass}>Event Date</th>
                    <th className={thClass}>End Date</th>
                    <th className={thClass}>Attended On</th>
                  </tr>
                </thead>
                <tbody className="bg-[#2d2d2d]">
                  {eventHistory.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-[#333] transition-colors"
                    >
                      <td className={tdClass}>
                        {truncate(record.event_title, isMobile)}
                      </td>
                      <td className={tdClass}>
                        {truncate(record.event_organizer, isMobile)}
                      </td>
                      <td className={tdClass}>
                        {truncate(record.event_location, isMobile)}
                      </td>
                      <td className={tdClass}>
                        {formatDate(record.event_start_datetime)}
                      </td>
                      <td className={tdClass}>
                        {formatDate(record.event_end_datetime)}
                      </td>
                      <td className={tdClass}>
                        {formatTime(record.checked_in_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}