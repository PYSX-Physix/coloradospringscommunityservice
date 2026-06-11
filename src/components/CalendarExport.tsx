import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Dialog } from './Dialog';
import { downloadICSFile, getGoogleCalendarUrl, getOutlookCalendarUrl, getYahooCalendarUrl } from '../utils/CalendarExports';

interface CalendarExportProps {
  open: boolean;
  onClose: () => void;
  event: { title: string; description: string; location: string; startDateTime: string; endDateTime: string; organizerName: string };
}

export default function CalendarExport({ open, onClose, event }: CalendarExportProps) {
  const options = [
    { label: 'Google Calendar', action: () => { window.open(getGoogleCalendarUrl(event), '_blank'); onClose(); } },
    { label: 'Outlook Calendar', action: () => { window.open(getOutlookCalendarUrl(event), '_blank'); onClose(); } },
    { label: 'Yahoo Calendar', action: () => { window.open(getYahooCalendarUrl(event), '_blank'); onClose(); } },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add to Calendar"
      footer={<button onClick={onClose} className="btn-secondary">Cancel</button>}
    >
      <p className="text-gray-400 text-sm mb-4">Choose where you'd like to save this event:</p>
      <div className="space-y-2">
        {options.map(o => (
          <button
            key={o.label}
            onClick={o.action}
            className="w-full flex items-center gap-3 px-4 py-3 border border-neutral-800 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
          >
            <CalendarIcon className="w-5 h-5 shrink-0" /> {o.label}
          </button>
        ))}
        <button
          onClick={() => { downloadICSFile(event); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 border border-neutral-800 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
        >
          <ArrowDownTrayIcon className="w-5 h-5 shrink-0" />
          Download .ics file (Apple Calendar, Outlook Desktop, etc.)
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        The .ics file works with Apple Calendar, Outlook Desktop, and most other calendar applications.
      </p>
    </Dialog>
  );
}