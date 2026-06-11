import React from 'react';
import { useSession } from './lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from './hooks/useIsMobile';
import {
  PlusCircleIcon, EllipsisHorizontalIcon, PencilIcon, EyeIcon,
  TrashIcon, ArrowDownTrayIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { downloadAttendanceSheet } from './utils/attendanceSheet';
import YourPostsDialogs from './YourPostsDialogs';
import { MenuPortal, MenuItemButton, MenuItemLink, MenuDivider } from './components/Menu';

interface PostData {
  id: number; title: string; description: string; location: string;
  start_datetime: string; end_datetime: string; max_participants: number;
  current_participants: number; user_name: string; visible: number;
  created_at: string; image_url?: string;
}

type TabValue = 'created' | 'saved' | 'joined';

function truncate(text: string, isMobile: boolean) {
  const max = isMobile ? 6 : 20;
  return text.length <= max ? text : text.substring(0, max) + '…';
}

function ActionMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(!open)} className="btn-ghost p-1.5">
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
      <MenuPortal open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} width={208}>
        <div onClick={() => setOpen(false)}>{children}</div>
      </MenuPortal>
    </>
  );
}

function YourPosts() {
  type ModalState = 'closed' | 'modal' | 'confirmation';
  const [deleteState, setDeleteState] = React.useState<ModalState>('closed');
  const [createState, setCreateState] = React.useState<ModalState>('closed');
  const [editState, setEditState] = React.useState<ModalState>('closed');
  const [deletePostId, setDeletePostId] = React.useState<number | null>(null);
  const [downloading, setDownloading] = React.useState<number | null>(null);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<PostData | null>(null);
  const [editingPost, setEditingPost] = React.useState<PostData | null>(null);
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<PostData[]>([]);
  const [joinedPosts, setJoinedPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabValue>('created');
  const isMobile = useIsMobile();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts/my-posts', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setPosts(d.posts || []);
    } catch { setPosts([]); } finally { setLoading(false); }
  }, []);

  const fetchSaved = React.useCallback(async () => {
    try {
      const res = await fetch('/api/saved-posts', { credentials: 'include' });
      const d = await res.json();
      setSavedPosts(d.posts || []);
    } catch { /* silent */ }
  }, []);

  const fetchJoined = React.useCallback(async () => {
    try {
      const res = await fetch('/api/participants/my-events', { credentials: 'include' });
      const d = await res.json();
      setJoinedPosts(d.posts || []);
    } catch { /* silent */ }
  }, []);

  React.useEffect(() => { fetchPosts(); fetchSaved(); fetchJoined(); }, [fetchPosts, fetchSaved, fetchJoined]);
  React.useEffect(() => { if (!isPending && !session) navigate('/auth'); }, [session, isPending, navigate]);

  const handleDownload = async (postId: number) => {
    try {
      setDownloading(postId);
      const res = await fetch(`/api/posts/${postId}/attendance`, { credentials: 'include' });
      if (!res.ok) { const e = await res.json(); alert(e.error || 'Failed'); return; }
      const d = await res.json();
      downloadAttendanceSheet({ title: d.event.title, description: d.event.description, location: d.event.location, start_datetime: d.event.start_datetime, end_datetime: d.event.end_datetime, organizer: d.event.user_name }, d.participants);
    } catch { alert('Failed to download'); } finally { setDownloading(null); }
  };

  if (isPending) return (
    <div className="flex justify-center mt-12">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!session) return null;

  const fmtDT = (s: string) => new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const fmtD = (s: string) => new Date(s).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const COLS = ['Title', 'Location', 'Created', 'Starts', 'Ends', 'Participants'];

  const TableShell = ({ rows }: { rows: PostData[]; }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-gray-700">
            {COLS.map(c => <th key={c} className="table-header">{c}</th>)}
            <th className="table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(post => (
            <tr key={post.id} className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors">
              <td className="table-cell text-white font-medium">{truncate(post.title, isMobile)}</td>
              <td className="table-cell">{truncate(post.location, isMobile)}</td>
              <td className="table-cell">{truncate(fmtD(post.created_at), isMobile)}</td>
              <td className="table-cell">{truncate(fmtDT(post.start_datetime), isMobile)}</td>
              <td className="table-cell">{truncate(fmtDT(post.end_datetime), isMobile)}</td>
              <td className="table-cell">{post.current_participants}/{post.max_participants}</td>
              <td className="table-cell">
                <ActionMenu>
                  {activeTab === 'created' && (
                    <>
                      <MenuItemButton icon={ArrowDownTrayIcon} onClick={() => handleDownload(post.id)} disabled={downloading === post.id}>
                        {downloading === post.id ? 'Downloading...' : 'Download Attendance'}
                      </MenuItemButton>
                      <MenuDivider />
                      <MenuItemButton icon={PencilIcon} onClick={() => { setEditingPost(post); setEditState('modal'); }}>
                        Edit
                      </MenuItemButton>
                      <MenuItemLink icon={EyeIcon} href={`/post?id=${post.id}`}>View Post</MenuItemLink>
                      <MenuDivider />
                      <MenuItemButton icon={TrashIcon} danger onClick={() => { setDeletePostId(post.id); setDeleteState('modal'); }}>
                        Delete
                      </MenuItemButton>
                    </>
                  )}
                  {activeTab === 'saved' && (
                    <MenuItemLink icon={EyeIcon} href={`/post?id=${post.id}`}>View Post</MenuItemLink>
                  )}
                  {activeTab === 'joined' && (
                    <>
                      <MenuItemButton icon={CalendarDaysIcon} onClick={() => { setSelectedEvent(post); setShowCalendar(true); }}>
                        Add to Calendar
                      </MenuItemButton>
                      <MenuItemLink icon={EyeIcon} href={`/post?id=${post.id}`}>View Post</MenuItemLink>
                    </>
                  )}
                </ActionMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tabData = { created: posts, saved: savedPosts, joined: joinedPosts };
  const tabLabels: Record<TabValue, string> = { created: 'Created Events', saved: 'Saved Events', joined: 'Joined Events' };
  const emptyMessages: Record<TabValue, string> = {
    created: 'No posts yet. Create your first event!',
    saved: 'No saved events yet. Browse events and save your favorites!',
    joined: "You haven't joined any events yet.",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-900 border border-neutral-700 rounded-xl p-1 w-fit">
        {(Object.keys(tabLabels) as TabValue[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="divider" />

      {/* Tab header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">{tabLabels[activeTab]}</h1>
        {activeTab === 'created' && (
          <button onClick={() => setCreateState('modal')} className="btn-ghost p-1" title="Create new event">
            <PlusCircleIcon className="w-7 h-7 text-blue-400" />
          </button>
        )}
      </div>

      {loading && activeTab === 'created' ? (
        <div className="flex items-center gap-2 text-gray-400 py-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading posts...
        </div>
      ) : tabData[activeTab].length === 0 ? (
        <p className="text-gray-400 py-4">{emptyMessages[activeTab]}</p>
      ) : (
        <div className="card overflow-hidden">
          <TableShell rows={tabData[activeTab]} />
        </div>
      )}
      <YourPostsDialogs
        createModalState={createState}
        setCreateModalState={setCreateState}
        editModalState={editState}
        setEditModalState={setEditState}
        deleteModalState={deleteState}
        setDeleteModalState={setDeleteState}
        deletePostId={deletePostId}
        currentEditingPost={editingPost}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        showCalendarExport={showCalendar}
        setShowCalendarExport={setShowCalendar}
        session={session}
        onPostCreated={fetchPosts}
        onPostUpdated={fetchPosts}
        onPostDeleted={fetchPosts}
        isMobile={isMobile}
      />
    </div>
  );
}

export default YourPosts;