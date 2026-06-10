import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Dialog } from './Dialog';

interface Participant {
  user_id: string; user_name: string; joined_at: string; attended: number; checked_in_at?: string;
}

interface CheckInManagerProps {
  open: boolean; onClose: () => void; postId: number;
  participants: Participant[]; isOrganizer: boolean; onRefresh: () => void;
}

export default function CheckInManager({ open, onClose, postId, participants, isOrganizer, onRefresh }: CheckInManagerProps) {
  const [checking, setChecking] = React.useState(false);

  const handleCheckIn = async (participantUserId: string, currentStatus: number) => {
    if (!isOrganizer) return;
    try {
      setChecking(true);
      const res = await fetch(`/api/posts/${postId}/checkin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ participantUserId, attended: currentStatus ? 0 : 1 }),
      });
      if (res.ok) onRefresh();
      else { const err = await res.json(); alert(err.error || 'Failed to update attendance'); }
    } catch { alert('Failed to update attendance'); } finally { setChecking(false); }
  };

  const attendedCount = participants.filter(p => p.attended).length;

  return (
    <Dialog
      open={open} onClose={onClose} title="Attendance Check-In"
      maxWidth="max-w-2xl"
      footer={<button onClick={onClose} className="btn-primary">Close</button>}
    >
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Attendance: <strong className="text-white">{attendedCount}/{participants.length}</strong>{' '}
          ({participants.length > 0 ? Math.round((attendedCount / participants.length) * 100) : 0}%)
        </p>
        {!isOrganizer && (
          <div className="mt-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-3 py-2">
            <p className="text-yellow-300 text-sm">Only the event organizer can mark attendance.</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="table-header">Participant</th>
              <th className="table-header">Registered</th>
              <th className="table-header">Status</th>
              {isOrganizer && <th className="table-header">Action</th>}
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p.user_id} className="border-b border-gray-700/50">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    {p.attended ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 rounded-full border border-gray-500" />}
                    <span className="text-white">{p.user_name}</span>
                  </div>
                </td>
                <td className="table-cell">{new Date(p.joined_at).toLocaleDateString()}</td>
                <td className="table-cell">
                  {p.attended ? (
                    <span className="badge bg-green-900/60 text-green-300 border border-green-700">Attended</span>
                  ) : (
                    <span className="badge bg-gray-700 text-gray-400 border border-gray-600">Not Attended</span>
                  )}
                </td>
                {isOrganizer && (
                  <td className="table-cell">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!p.attended}
                        onChange={() => handleCheckIn(p.user_id, p.attended)}
                        disabled={checking}
                        className="w-4 h-4 accent-blue-500"
                      />
                      <span className="text-xs text-gray-400">{p.attended ? 'Mark absent' : 'Mark attended'}</span>
                    </label>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}