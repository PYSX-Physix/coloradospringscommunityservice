import React from 'react';
import {
  BookmarkIcon as BookmarkOutline,
  ShareIcon, ExclamationTriangleIcon, EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid} from '@heroicons/react/24/solid';
import { useSavedPosts } from '../hooks/useSavedPosts';
import { useErrorNotice } from '../hooks/useErrorNotice';
import type { PostUI } from '../utils/types';
import ShareEvent from './ShareEvent';
import { NoticeDialog } from './Dialog';
import { MenuPortal, MenuItemButton } from './Menu';
import { ReportUser } from './ReportUser';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=200&fit=crop';

interface PostCardProps {
  post: PostUI;
  onSaveToggle?: (postId: number, isSaved: boolean) => void;
}

export default React.memo(function PostCard({ post, onSaveToggle }: PostCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showShare, setShowShare] = React.useState(false);
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);

  const { isSaved, loading: saving, toggleSave } = useSavedPosts(post.isSaved, onSaveError);
  const [showReport, setShowReport] = React.useState(false);
  const [reportedUserId, setReportedUserId] = React.useState<string | null>(null);
  const [reportedUserName, setReportedUserName] = React.useState('');
  const { notice, isOpen: noticeOpen, showError, closeError } = useErrorNotice();

  async function handleSave() {
    setMenuOpen(false);
    const result = await toggleSave(post.id);
    onSaveToggle?.(post.id, result);
  }

  function onSaveError(e: string) { showError('Failed to Save Post', e); }

  const isFull = post.current_participants >= post.max_participants;
  const isPast = new Date(post.end_datetime) < new Date();

  return (
    <div className="card w-80 flex flex-col overflow-hidden hover:border-neutral-400 transition-colors">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-neutral-700">
        <img
          src={post.image_url || DEFAULT_IMG}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.src = DEFAULT_IMG; }}
        />
        <div className="absolute top-2 right-2 flex flex-row gap-2">
          {isFull && (
            <div className="badge bg-red-900/90 text-red-300 border border-red-700">
              Event Full
            </div>
          )}
          { isPast && (
            <div className="badge bg-yellow-300 text-black border border-yellow-500">
              Event Ended
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-white text-base leading-snug line-clamp-2">{post.title}</h3>
          <p className="text-gray-400 text-sm mt-1 line-clamp-3">{post.description}</p>
        </div>

        {/* Footer actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <a href={`/post?id=${post.id}`} className="btn-primary text-sm flex-1 text-center">
            View Event
          </a>
          <button
            ref={menuTriggerRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn-ghost p-2"
            aria-label="More options"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
          <MenuPortal open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={menuTriggerRef} width={176}>
            <MenuItemButton
              icon={isSaved ? BookmarkSolid : BookmarkOutline}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Updating...' : isSaved ? 'Unsave Post' : 'Save Post'}
            </MenuItemButton>
            <MenuItemButton icon={ShareIcon} onClick={() => { setMenuOpen(false); setShowShare(true); }}>
              Share Post
            </MenuItemButton>
            <MenuItemButton icon={ExclamationTriangleIcon} danger onClick={() => { setMenuOpen(false); setShowReport(true); }}>
              Report Post
            </MenuItemButton>
          </MenuPortal>
        </div>
      </div>

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

      <ShareEvent
        open={showShare}
        onClose={() => setShowShare(false)}
        event={{ id: post.id, title: post.title, description: post.description, location: post.location, start_time: post.start_datetime, image_url: post.image_url }}
      />

      <NoticeDialog
        open={noticeOpen}
        title={notice?.title || ''}
        description={notice?.description || ''}
        onClose={closeError}
      />
    </div>
  );
});