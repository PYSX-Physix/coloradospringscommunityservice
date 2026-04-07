import React from 'react';

interface UseSavedPostsState {
  isSaved: boolean;
  loading: boolean;
  error: string | null;
}

interface UseSavedPostsReturn extends UseSavedPostsState {
  toggleSave: (postId: number) => Promise<boolean>;
}

/**
 * Custom hook to manage saved posts state with optimistic updates.
 * Handles toggle logic, loading state, and error management.
 * 
 * @param initialIsSaved - Whether the post is initially saved
 * @param onError - Callback when an error occurs
 * @returns Object containing isSaved state, loading state, and toggleSave function
 */
export function useSavedPosts(
  initialIsSaved: boolean = false,
  onError?: (error: string) => void
): UseSavedPostsReturn {
  const [isSaved, setIsSaved] = React.useState(initialIsSaved);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const previousStateRef = React.useRef(initialIsSaved);

  /**
   * Toggle the saved state of a post with optimistic updates.
   * Updates UI immediately, rolls back on failure.
   */
  const toggleSave = React.useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    
    // Store previous state for rollback
    previousStateRef.current = isSaved;
    
    // Optimistic update
    const newState = !isSaved;
    setIsSaved(newState);
    setLoading(true);

    try {
      const res = await fetch('/api/saved-posts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        return data.saved;
      } else {
        // Rollback on failure
        setIsSaved(previousStateRef.current);
        const errorMsg = 'You need to be signed in to save an event.';
        setError(errorMsg);
        onError?.(errorMsg);
        return previousStateRef.current;
      }
    } catch (err) {
      // Rollback on error
      setIsSaved(previousStateRef.current);
      const errorMsg = 'Failed to update saved status. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('Save error:', err);
      return previousStateRef.current;
    } finally {
      setLoading(false);
    }
  }, [isSaved, onError]);

  return {
    isSaved,
    loading,
    error,
    toggleSave,
  };
}
