import React from 'react';
import { Calendar20Color, LocationRipple20Color, PeopleCommunity20Color, Person20Color, Search20Regular } from '@fluentui/react-icons';
import defaultArt from "./assets/default-art.jpeg"

interface PostData {
  id: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  current_participants: number;
  user_name: string;
  created_at: string;
  image_url?: string;
}

function Search() {
  const [query, setQuery] = React.useState('');
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPosts([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      setPosts(data.posts || []);
    } catch (error) {
      console.error('Search error:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [query]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className='flex flex-col'>
      <h1 className="text-2xl font-semibold text-white">Search Events</h1>
      <hr className='border-gray-600' />

      <div className='relative max-w-xl'>
        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
          <Search20Regular />
        </div>
        <input type='text' value={query}
          onChange={(e) => setQuery(e.target.value)} placeholder='Search by title, description, location, or organizer...'
          className='w-full bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 pl-9 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors' />
      </div>

      {loading && (
        <p className='text-gray-400 animate-pulse text-sm'>Searching...</p>
      )}

      {!loading && searched && posts.length === 0 && (
        <div className='flex flex-col gap-1 mt-4'>
          <p className='text-gray-300'>No events found matching "{query}"</p>
          <p className='text-sm text-gray-500'>Try different keywords or check for spelling mistakes</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className='flex flex-col gap-4'>
          <p className='text-sm text-gray-400'>Found {posts.length} event{posts.length !== 1 ? 's' : ''} matching "{query}"</p>

          <div className='flex flex-wrap gap-4'>
            {posts.map((post) => (
              <div key={post.id} className='w-full max-w-sm bg-[#2d2d2d] border border-gray-700 rounded-lg overflow-hidden flex flex-col'>
                <img src={post.image_url || defaultArt} alt={post.title} onError={(e) => { e.currentTarget.src = defaultArt }}
                  className='w-full h-40 object-cover' />
                <div className='flex flex-col gap-3 p-4 flex-1'>
                  <h3 className='text-base font-semibold text-white'>{post.title}</h3>
                  <p className='text-sm text-gray-400 leading-relaxed'>{post.description.length > 100 ? post.description.substring(0, 100) + '...' : post.description}</p>
                </div>
                <div className="flex flex-col gap-1 mt-auto">
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar20Color />
                    {formatDateTime(post.start_datetime)}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <LocationRipple20Color />
                    {post.location}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <Person20Color />
                    {post.user_name}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <PeopleCommunity20Color />
                    {post.current_participants}/{post.max_participants} participants
                  </span>
                </div>
                <a href={`/post?id=${post.id}`}
                  className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded transition-colors">
                  View Event
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;