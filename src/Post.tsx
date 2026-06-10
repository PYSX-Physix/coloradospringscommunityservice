import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarIcon, MapPinIcon, UserGroupIcon, ShareIcon,
  CalendarDaysIcon, EllipsisHorizontalIcon, ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { useSession } from './lib/auth-client';
import { useIsMobile } from './hooks/useIsMobile';
import CheckInManager from './components/CheckInManager';
import CalendarExport from './components/CalendarExport';
import { ReportUser } from './components/ReportUser';
import ShareEvent from './components/ShareEvent';
import { NoticeDialog } from './components/Dialog';
import DefaultImage from './assets/default-art.jpeg'

const DEFAULT_IMG = DefaultImage;

interface PostData {
  id: number; title: string; description: string; location: string;
  start_datetime: string; end_datetime: string; max_participants: number;
  current_participants: number; user_id: string; user_name: string;
  visible: number; created_at: string; image_url?: string;
}
interface Participant {
  user_id: string; user_name: string; joined_at: string; attended: number; checked_in_at?: string;
}

export default function Post() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  const [post, setPost] = React.useState<PostData | null>(null);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [joining, setJoining] = React.useState(false);
  const [showCheckIn, setShowCheckIn] = React.useState(false);
  const [isOrganizer, setIsOrganizer] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [hasJoined, setHasJoined] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);
  const [reportedUserId, setReportedUserId] = React.useState<string | null>(null);
  const [reportedUserName, setReportedUserName] = React.useState('');
  const [showShare, setShowShare] = React.useState(false);
  const [notice, setNotice] = React.useState({ open: false, title: '', description: '' });
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const fetchPost = React.useCallback(async () => {
    if (!postId) { setError('No post ID provided'); setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error('Post not found');
      const data = await res.json();
      setPost(data.post);
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally { setLoading(false); }
  }, [postId]);

  React.useEffect(() => { fetchPost(); }, [fetchPost]);

  React.useEffect(() => {
    if (post && session?.user) {
      setIsOrganizer(post.user_id === session.user.id);
      setHasJoined(!!participants.find(p => p.user_id === session.user.id));
    }
  }, [post, session, participants]);

  const handleJoin = async () => {
    if (!postId) return;
    try {
      setJoining(true);
      const res = await fetch(`/api/posts/${postId}/participants`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setNotice({ open: true, title: 'Event Joined', description: 'Successfully joined this event.' });
        setHasJoined(true);
        fetchPost();
      } else {
        const err = await res.json();
        setNotice({ open: true, title: 'Failed to Join', description: err.error?.toString() || 'An error occurred.' });
      }
    } catch { setNotice({ open: true, title: 'Error', description: 'Check your developer console.' }); }
    finally { setJoining(false); }
  };

  const fmtDT = (s: string) => new Date(s).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const fmtT = (s: string) => new Date(s).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Loading event...
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
      <p className="text-gray-400">{error || 'This event does not exist or has been removed.'}</p>
    </div>
  );

  const isFull = post.current_participants >= post.max_participants;
  const spotsRemaining = post.max_participants - post.current_participants;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{post.title}</h1>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {post.user_name[0].toUpperCase()}
              </div>
              <span className="text-gray-300 text-sm">Organized by <strong className="text-white">{post.user_name}</strong></span>
              {!isOrganizer && (
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === 'organizer' ? null : 'organizer')} className="btn-ghost p-1">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>
                  {menuOpen === 'organizer' && (
                    <div className="absolute left-0 mt-1 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10">
                      <button
                        onClick={() => { setMenuOpen(null); setReportedUserId(post.user_id); setReportedUserName(post.user_name); setShowReport(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700"
                      >
                        <ShieldExclamationIcon className="w-4 h-4" /> Report Organizer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowShare(true)} className="btn-secondary text-sm flex items-center gap-2">
              <ShareIcon className="w-4 h-4" /> Share Event
            </button>
            {hasJoined && (
              <button onClick={() => setShowCalendar(true)} className="btn-secondary text-sm flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" /> Add to Calendar
              </button>
            )}
            {isOrganizer && (
              <button onClick={() => setShowCheckIn(true)} className="btn-primary text-sm">Manage Attendance</button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_360px]'}`}>
        {/* Left */}
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <img src={post.image_url || DEFAULT_IMG} alt={post.title} className="w-full max-h-96 object-cover" onError={e => { e.currentTarget.src = DEFAULT_IMG; }} />
          </div>

          <div className={`card p-4 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Date & Time</p>
                <p className="text-sm text-gray-400">{fmtDT(post.start_datetime)}</p>
                <p className="text-sm text-gray-400">Ends at {fmtT(post.end_datetime)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Location</p>
                <p className="text-sm text-gray-400">{post.location}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold text-white mb-3">About This Event</h2>
            <div className="divider" />
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.description}</p>
          </div>
        </div>

        {/* Right */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" /> Participants
            </h2>
            <span className={`badge ${isFull ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-green-900/60 text-green-300 border border-green-700'}`}>
              {post.current_participants}/{post.max_participants}
            </span>
          </div>

          {!hasJoined && !isOrganizer && (
            <button onClick={handleJoin} disabled={isFull || joining} className="btn-primary w-full mb-3">
              {joining ? 'Joining...' : isFull ? 'Event Full' : 'Sign Up'}
            </button>
          )}

          {!isFull && spotsRemaining <= 5 && spotsRemaining > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-3 py-2 mb-3">
              <p className="text-yellow-300 text-sm font-semibold">Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining!</p>
            </div>
          )}

          <div className="divider" />

          {participants.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No participants yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map(p => (
                <div key={p.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {p.user_name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 flex-1 truncate">{p.user_name}</span>
                  <div className="flex items-center gap-1">
                    {p.user_id === session?.user.id && (
                      <span className="badge bg-blue-900/60 text-blue-300 border border-blue-700/50">You</span>
                    )}
                    {p.user_id === post.user_id && (
                      <span className="badge bg-orange-900/60 text-orange-300 border border-orange-700/50">Organizer</span>
                    )}
                    {p.user_id !== session?.user.id && (
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === p.user_id ? null : p.user_id)} className="btn-ghost p-1">
                          <EllipsisHorizontalIcon className="w-4 h-4" />
                        </button>
                        {menuOpen === p.user_id && (
                          <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10">
                            <button
                              onClick={() => { setMenuOpen(null); setReportedUserId(p.user_id); setReportedUserName(p.user_name); setShowReport(true); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700"
                            >
                              <ShieldExclamationIcon className="w-4 h-4" /> Report User
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {reportedUserId && (
        <ReportUser
          open={showReport}
          onClose={() => { setShowReport(false); setReportedUserId(null); setReportedUserName(''); }}
          reportedUserId={reportedUserId}
          reportedUserName={reportedUserName}
          postId={post?.id}
          postTitle={post?.title}
        />
      )}

      <CalendarExport
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        event={{ title: post.title, description: post.description, location: post.location, startDateTime: post.start_datetime, endDateTime: post.end_datetime, organizerName: post.user_name }}
      />

      <CheckInManager
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        postId={Number(postId)}
        participants={participants}
        isOrganizer={isOrganizer}
        onRefresh={fetchPost}
      />

      <ShareEvent
        open={showShare}
        onClose={() => setShowShare(false)}
        event={{ id: post.id, title: post.title, description: post.description, location: post.location, start_time: post.start_datetime, image_url: post.image_url }}
      />

      <NoticeDialog open={notice.open} title={notice.title} description={notice.description} onClose={() => setNotice(p => ({ ...p, open: false }))} />
    </div>
  );
}