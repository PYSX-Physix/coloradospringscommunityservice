import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Dialog } from './Dialog';

interface ShareEventProps {
  open: boolean;
  onClose: () => void;
  event: { id: number; title: string; description: string; location: string; start_time: string; image_url?: string };
}

export default function ShareEvent({ open, onClose, event }: ShareEventProps) {
  const eventUrl = `${window.location.origin}/post?id=${event.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventUrl);
    alert('Event link copied to clipboard!');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Share Event"
      footer={<button onClick={onClose} className="btn-secondary">Close</button>}
    >
      <div>
        <label className="label">Event Link</label>
        <div className="flex gap-2">
          <input readOnly value={eventUrl} className="input flex-1 text-sm" />
          <button onClick={handleCopy} className="btn-secondary px-3" aria-label="Copy link">
            <ClipboardDocumentIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Dialog>
  );
}