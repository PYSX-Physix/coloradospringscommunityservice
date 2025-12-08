import React from 'react';
import { 
  Divider, SearchBox, Title1, Text, Card, CardPreview,
  CardHeader, CardFooter, Button, Spinner, Badge,
  makeStyles
} from '@fluentui/react-components';
import { Search20Regular } from '@fluentui/react-icons';

const cardStyles = makeStyles({
  card: {
    width: '400px',
    maxWidth: '100%',
    height: 'fit-content'
  }
});

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
}

function Search() {
  const [query, setQuery] = React.useState('');
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const styles = cardStyles();

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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Title1>Search Events</Title1>
      <Divider style={{ marginTop: '15px', marginBottom: '15px' }} />
      
      <SearchBox 
        placeholder="Search by title, description, location, or organizer..." 
        value={query}
        onChange={(_, data) => setQuery(data.value)}
        contentBefore={<Search20Regular />}
        style={{ maxWidth: '600px', marginBottom: '24px' }}
      />

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Spinner label="Searching..." />
        </div>
      )}

      {!loading && searched && posts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Text size={400}>No events found matching "{query}"</Text>
          <Text size={200} style={{ display: 'block', marginTop: '8px', color: '#666' }}>
            Try different keywords or check spelling
          </Text>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <Text size={300} style={{ marginBottom: '16px' }}>
            Found {posts.length} event{posts.length !== 1 ? 's' : ''} matching "{query}"
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {posts.map((post) => (
              <Card key={post.id} className={styles.card}>
                <CardPreview>
                  <img 
                    src="https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2F8_Pikes%2520Peak-Garden%2520of%2520the%2520Gods.jpg&w=2048&q=75"
                    alt="Event" 
                  />
                </CardPreview>
                <CardHeader
                  header={
                    <div>
                      <Text weight="semibold">{post.title}</Text>
                      <div style={{ marginTop: '4px' }}>
                        <Badge appearance="outline" size="small">
                          {formatDateTime(post.start_datetime)}
                        </Badge>
                      </div>
                    </div>
                  }
                  description={
                    <Text size={200}>
                      {post.description.length > 100 
                        ? post.description.substring(0, 100) + '...' 
                        : post.description}
                    </Text>
                  }
                />
                <CardFooter>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <Text size={200}>
                      📍 {post.location}
                    </Text>
                    <Text size={200}>
                      👤 {post.user_name}
                    </Text>
                    <Text size={200}>
                      👥 {post.current_participants}/{post.max_participants} participants
                    </Text>
                    <Button 
                      appearance="primary" 
                      as='a' 
                      href={`/post?id=${post.id}`}
                      style={{ marginTop: '8px' }}
                    >
                      View Event
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {!loading && !searched && (
        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <Search20Regular style={{ fontSize: '48px', color: '#666', marginBottom: '16px' }} />
          <Text size={400} style={{ display: 'block', color: '#666' }}>
            Start typing to search for events
          </Text>
          <Text size={200} style={{ display: 'block', marginTop: '8px', color: '#999' }}>
            Search by event title, description, location, or organizer name
          </Text>
        </div>
      )}
    </div>
  );
}

export default Search;