import React from 'react';
import { Title1, Text, Divider, Spinner } from "@fluentui/react-components";
import './App.css';
import PostCard from './components/PostCard';
import type { PostUI, PostData } from './utils/types';

/**
 * Posts Component - Parent Container
 * 
 * Responsibilities:
 * - Fetch all posts from API
 * - Fetch all saved post IDs in a single request (avoids N+1)
 * - Merge saved state into post data
 * - Render list of PostCard components
 * - Handle loading states
 * - Support pagination or lazy loading in future
 */
function Posts() {
  const [posts, setPosts] = React.useState<PostUI[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Fetch all posts and their saved status on mount
   */
  React.useEffect(() => {
    fetchPostsWithSavedStatus();
  }, []);

  /**
   * Fetch posts and saved status in parallel
   * Eliminates N+1 API calls by fetching all saved posts at once
   */
  const fetchPostsWithSavedStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch posts and saved posts in parallel
      const [postsRes, savedRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/saved-posts', { credentials: 'include' }).catch(() => null),
      ]);

      if (!postsRes.ok) {
        throw new Error('Failed to load posts');
      }

      const postsData = await postsRes.json();
      const posts: PostData[] = postsData.posts || [];

      // Get saved post IDs
      let savedPostIds: number[] = [];
      if (savedRes?.ok) {
        try {
          const savedData = await savedRes.json();
          savedPostIds = savedData.savedPostIds || [];
        } catch {
          console.warn('Failed to parse saved posts');
        }
      }

      // Merge saved status into posts
      const postsWithSaved: PostUI[] = posts.map((post) => ({
        ...post,
        isSaved: savedPostIds.includes(post.id),
      }));

      setPosts(postsWithSaved);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load posts';
      setError(errorMsg);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle save toggle - update local state optimistically
   * The actual API call happens in PostCard via useSavedPosts hook
   */
  const handleSaveToggle = (postId: number, isSaved: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isSaved } : post
      )
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div>
        <Title1>Posts</Title1>
        <Divider style={{ marginTop: '16px', marginBottom: '32px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Spinner label="Loading events..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div>
        <Title1>Posts</Title1>
        <Divider style={{ marginTop: '16px', marginBottom: '32px' }} />
        <Text style={{ color: '#e81123' }}>
          Error: {error}
        </Text>
      </div>
    );
  }

  // Render empty state
  if (posts.length === 0) {
    return (
      <div>
        <Title1>Posts</Title1>
        <Divider style={{ marginTop: '16px', marginBottom: '32px' }} />
        <Text>No events available yet. Check back soon!</Text>
      </div>
    );
  }

  // Render posts grid
  return (
    <div>
      <Title1>Posts</Title1>
      <Divider style={{ marginTop: '16px', marginBottom: '32px' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onSaveToggle={handleSaveToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default Posts;