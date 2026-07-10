import React from 'react';
import { MagnifyingGlassIcon, CalendarIcon, MapPinIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';

interface PostData {
  id: number; title: string; description: string; location: string;
  start_datetime: string; end_datetime: string; max_participants: number;
  current_participants: number; user_name: string; created_at: string; image_url?: string;
}

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=200&fit=crop';

function Search() {
  const [query, setQuery] = React.useState('');
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setPosts([]); setSearched(false); return; }
    try {
      setLoading(true);
      setSearched(true);
      const res = await fetch(`/api/posts/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { setPosts([]); } finally { setLoading(false); }
  };

  React.useEffect(() => {
    const t = setTimeout(() => { if (query) handleSearch(query); }, 500);
    return () => clearTimeout(t);
  }, [query]);

  const fmt = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Search Events</h1>
      <div className="divider" />

      <div className="relative max-w-xl">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by title, description, location, or organizer..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400 mt-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Searching...
        </div>
      )}

      {!loading && searched && posts.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-300">No events found matching "{query}"</p>
          <p className="text-gray-500 text-sm mt-1">Try different keywords or check spelling</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <p className="text-sm text-gray-400">Found {posts.length} event{posts.length !== 1 ? 's' : ''} matching "{query}"</p>
          <div className="flex flex-wrap gap-4">
            {posts.map(post => (
              <div key={post.id} className="card w-80 flex flex-col overflow-hidden hover:border-gray-600 transition-colors">
                <div className="h-40 overflow-hidden bg-gray-700">
                  <img src={post.image_url || DEFAULT_IMG} alt={post.title} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = DEFAULT_IMG; }} />
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-semibold text-white">{post.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.description}</p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" />{fmt(post.start_datetime)}</div>
                    <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" />{post.location}</div>
                    <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" />{post.user_name}</div>
                    <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4" />{post.current_participants}/{post.max_participants} participants</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {post.current_participants === post.max_participants && (
                      <span className="badge bg-red-900/60 text-red-300 border border-red-700 w-fit">Event Full</span>
                    )}
                    {new Date(post.end_datetime) < new Date() && (
                      <span className="badge bg-yellow-300 text-black border border-yellow-500 w-fit">Event Ended</span>
                    )}
                  </div>
                  <a href={`/post?id=${post.id}`} className="btn-primary text-sm text-center mt-auto">View Event</a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Search;