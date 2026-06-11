import React from 'react';

interface UseSavedPostsReturn {
  isSaved: boolean;
  loading: boolean;
  error: string | null;
  toggleSave: (postId: number) => Promise<boolean>;
}

export function useSavedPosts(
  initialIsSaved: boolean = false,
  onError?: (error: string) => void
): UseSavedPostsReturn {
  const [isSaved, setIsSaved] = React.useState(initialIsSaved);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const previousStateRef = React.useRef(initialIsSaved);

  const toggleSave = React.useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    previousStateRef.current = isSaved;
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
        setIsSaved(previousStateRef.current);
        const errorMsg = 'You need to be signed in to save an event.';
        setError(errorMsg);
        onError?.(errorMsg);
        return previousStateRef.current;
      }
    } catch {
      setIsSaved(previousStateRef.current);
      const errorMsg = 'Failed to update saved status. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      return previousStateRef.current;
    } finally {
      setLoading(false);
    }
  }, [isSaved, onError]);

  return { isSaved, loading, error, toggleSave };
}