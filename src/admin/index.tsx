import React from 'react';
import { useSession } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { ShieldCheckIcon, EllipsisHorizontalIcon, DocumentMagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Dialog } from '../components/Dialog';

interface Report {
  id: string; reporter_id: string; reporter_name: string; reporter_email: string;
  reported_user_id: string; reported_user_name: string; reported_user_email: string;
  post_id: number | null; post_title: string | null; category: string; description: string;
  status: string; created_at: number; reviewed_at: number | null; reviewed_by: string | null;
  action_taken: string | null; notes: string | null;
}

interface Stats { totalReports: number; pendingReports: number; totalUsers: number; totalPosts: number; reportsToday: number; }

type TabValue = 'pending' | 'under_review' | 'resolved' | 'dismissed';

const CATEGORY_LABELS: Record<string, string> = {
  inappropriate_content: 'Inappropriate Content', spam_misleading: 'Spam/Misleading',
  safety_concerns: 'Safety Concerns', terms_violation: 'Terms Violation',
  noshow_cancellation: 'No-Show/Cancellation', other: 'Other',
};

function ActionMenu({ report, onReview }: { report: Report; onReview: (r: Report) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="btn-ghost p-1.5"><EllipsisHorizontalIcon className="w-5 h-5" /></button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden" onClick={() => setOpen(false)}>
          <button onClick={() => onReview(report)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700">
            <DocumentMagnifyingGlassIcon className="w-4 h-4" /> Review Report
          </button>
          {report.post_id && (
            <a href={`/post?id=${report.post_id}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700">
              View Event
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<TabValue>('pending');
  const [reports, setReports] = React.useState<Report[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [showReview, setShowReview] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState('resolved');
  const [actionTaken, setActionTaken] = React.useState('');
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!isPending && !session) { navigate('/auth'); return; }
    if (session?.user && !(session.user as any).isAdmin) { navigate('/'); return; }
  }, [session, isPending, navigate]);

  React.useEffect(() => {
    if (session?.user && (session.user as any).isAdmin) { fetchReports(activeTab); fetchStats(); }
  }, [session, activeTab]);

  const fetchReports = async (status: TabValue) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?status=${status}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setReports(d.reports || []); }
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setStats(d); }
    } catch { /* silent */ }
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    setReviewStatus(report.status || 'resolved');
    setActionTaken(report.action_taken || '');
    setReviewNotes(report.notes || '');
    setShowReview(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReport) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: reviewStatus, actionTaken, notes: reviewNotes }),
      });
      if (res.ok) { setShowReview(false); fetchReports(activeTab); fetchStats(); }
      else alert('Failed to update report');
    } catch { alert('Failed to update report'); } finally { setSubmitting(false); }
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (isPending) return (
    <div className="flex justify-center mt-12">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!session || !(session.user as any).isAdmin) return null;

  const TABS: TabValue[] = ['pending', 'under_review', 'resolved', 'dismissed'];
  const TAB_LABELS: Record<TabValue, string> = { pending: 'Pending', under_review: 'Under Review', resolved: 'Resolved', dismissed: 'Dismissed' };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
      </div>
      <div className="divider" />

      {/* Stats */}
      {stats && (
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
          {[
            { label: 'Pending Reports', value: stats.pendingReports, highlight: stats.pendingReports > 0 },
            { label: 'Total Reports', value: stats.totalReports },
            { label: 'Reports Today', value: stats.reportsToday },
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Total Events', value: stats.totalPosts },
          ].map(s => (
            <div key={s.label} className={`card p-4 ${s.highlight ? 'border-red-700' : ''}`}>
              <p className={`text-2xl font-bold ${s.highlight ? 'text-red-400' : 'text-white'}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reports */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-3">Reports Management</h2>
          <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1 w-fit flex-wrap">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {TAB_LABELS[t]}
                {t === 'pending' && stats && stats.pendingReports > 0 && (
                  <span className="badge bg-red-600 text-white">{stats.pendingReports}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No {activeTab} reports</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Report ID', 'Category', 'Reporter', 'Reported User', 'Event', 'Date', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b border-gray-700/50">
                    <td className="table-cell font-mono text-xs">{r.id.substring(0, 8)}...</td>
                    <td className="table-cell">
                      <span className="badge bg-gray-700 text-gray-300 border border-gray-600">
                        {CATEGORY_LABELS[r.category] || r.category}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="text-white font-medium">{r.reporter_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{r.reporter_email}</p>
                    </td>
                    <td className="table-cell">
                      {r.reported_user_id ? (
                        <>
                          <p className="text-white font-medium">{r.reported_user_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{r.reported_user_email}</p>
                        </>
                      ) : <span className="badge bg-gray-700 text-gray-400">Post Only</span>}
                    </td>
                    <td className="table-cell">
                      {r.post_title ? (
                        <a href={`/post?id=${r.post_id}`} target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-xs">
                          {r.post_title.substring(0, 25)}...
                        </a>
                      ) : <span className="text-gray-500">—</span>}
                    </td>
                    <td className="table-cell text-xs">{fmtDate(r.created_at)}</td>
                    <td className="table-cell"><ActionMenu report={r} onReview={handleReviewReport} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog
        open={showReview}
        onClose={() => setShowReview(false)}
        title="Review Report"
        footer={
          <>
            <button onClick={() => setShowReview(false)} className="btn-secondary flex items-center gap-2">
              <XCircleIcon className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSubmitReview} disabled={submitting} className="btn-primary flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" /> {submitting ? 'Updating...' : 'Update Report'}
            </button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="card p-3 space-y-1 text-sm">
              <p className="text-gray-400"><strong className="text-white">Category:</strong> {CATEGORY_LABELS[selectedReport.category]}</p>
              <p className="text-gray-400"><strong className="text-white">Reporter:</strong> {selectedReport.reporter_name}</p>
              {selectedReport.reported_user_id && <p className="text-gray-400"><strong className="text-white">Reported:</strong> {selectedReport.reported_user_name}</p>}
              {selectedReport.post_title && <p className="text-gray-400"><strong className="text-white">Event:</strong> {selectedReport.post_title}</p>}
              <p className="text-gray-400"><strong className="text-white">Date:</strong> {fmtDate(selectedReport.created_at)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-300">{selectedReport.description}</p>
            </div>
            <div className="divider" />
            <div>
              <label className="label">Status</label>
              <select className="input" value={reviewStatus} onChange={e => setReviewStatus(e.target.value)}>
                {['pending', 'under_review', 'resolved', 'dismissed', 'duplicate'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Action Taken</label>
              <select className="input" value={actionTaken} onChange={e => setActionTaken(e.target.value)}>
                <option value="">-- Select Action --</option>
                {[['no_action', 'No Action Needed'], ['warning', 'User Warned'], ['content_removed', 'Content Removed'], ['temporary_ban', 'Temporary Ban'], ['permanent_ban', 'Permanent Ban'], ['investigating', 'Under Investigation']].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Moderator Notes</label>
              <textarea className="input min-h-[80px] resize-y" placeholder="Add notes about your decision..." value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}