import React from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Dialog } from './Dialog';

interface ReportUserProps {
  open: boolean; onClose: () => void; reportedUserId: string;
  reportedUserName: string; postId?: number; postTitle?: string;
}

const CATEGORIES = [
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive language, harassment, hate speech' },
  { value: 'spam_misleading', label: 'Spam or Misleading', description: 'Fake events, spam, misleading information' },
  { value: 'safety_concerns', label: 'Safety Concerns', description: 'Unsafe conditions, suspicious activity, scams' },
  { value: 'terms_violation', label: 'Violation of Terms', description: 'Not a community service event, policy violations' },
  { value: 'noshow_cancellation', label: 'No-Show or Cancellation Issues', description: 'Organizer cancelled without notice' },
  { value: 'other', label: 'Other', description: 'Issues not covered above' },
];

export function ReportUser({ open, onClose, reportedUserId, reportedUserName, postId, postTitle }: ReportUserProps) {
  const [category, setCategory] = React.useState('inappropriate_content');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { alert('Please provide a description'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportedUserId, postId, category, description: description.trim() }),
      });
      if (res.ok) { setShowConfirmation(true); setDescription(''); setCategory('inappropriate_content'); }
      else { const err = await res.json(); alert(err.error || 'Failed to submit report'); }
    } catch { alert('Failed to submit report.'); } finally { setIsSubmitting(false); }
  };

  const handleClose = () => {
    if (!isSubmitting) { setDescription(''); setCategory('inappropriate_content'); setShowConfirmation(false); onClose(); }
  };

  if (showConfirmation) {
    return (
      <Dialog open={open} onClose={handleClose} title="Report Submitted"
        footer={<button onClick={handleClose} className="btn-primary">Close</button>}>
        <p className="text-gray-300 text-sm">
          Thank you for your report. Our moderation team will review this matter and take appropriate action.
        </p>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Report User"
      footer={
        <>
          <button onClick={handleClose} disabled={isSubmitting} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit as any} disabled={isSubmitting || !description.trim()} className="btn-danger flex items-center gap-2">
            <ShieldExclamationIcon className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-300"><strong className="text-white">Reporting:</strong> {reportedUserName}</p>
          {postTitle && <p className="text-xs text-gray-500 mt-0.5">Event: {postTitle}</p>}
        </div>

        <div className="divider" />

        <div>
          <label className="label">Category</label>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <label key={cat.value} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="report-category"
                  value={cat.value}
                  checked={category === cat.value}
                  onChange={() => setCategory(cat.value)}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{cat.label}</p>
                  <p className="text-xs text-gray-500">{cat.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-25 resize-y"
            placeholder="Please provide details about why you're reporting this user..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-300">
            <strong>Note:</strong> False or malicious reports may result in action against your account.
          </p>
        </div>
      </form>
    </Dialog>
  );
}