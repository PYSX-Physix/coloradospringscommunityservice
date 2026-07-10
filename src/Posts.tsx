import React from 'react';
import PostCard from './components/PostCard';
import type { PostUI, PostData } from './utils/types';

function Posts() {
  const [posts, setPosts] = React.useState<PostUI[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPostsWithSavedStatus();
  }, []);

  const fetchPostsWithSavedStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const [postsRes, savedRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/saved-posts', { credentials: 'include' }).catch(() => null),
      ]);

      if (!postsRes.ok) throw new Error('Failed to load posts');

      const postsData = await postsRes.json();
      const posts: PostData[] = postsData.posts || [];

      let savedPostIds: number[] = [];
      if (savedRes?.ok) {
        try {
          const savedData = await savedRes.json();
          savedPostIds = (savedData.savedPostIds || []).map((p: { id: number }) => p.id);
        } catch { /* silent */ }
      }

      setPosts(posts.map(post => ({ ...post, isSaved: savedPostIds.includes(post.id), isArchived: post.isArchived || false })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = (postId: number, isSaved: boolean) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved } : p));
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Posts</h1>
        <div className="divider" />
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading events...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Posts</h1>
        <div className="divider" />
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Posts</h1>
        <div className="divider" />
        <p className="text-gray-400">No events available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">Posts</h1>
      <div className="divider" />
      <div className="flex flex-wrap gap-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onSaveToggle={handleSaveToggle} />
        ))}
      </div>
    </div>
  );
}

export default Posts;