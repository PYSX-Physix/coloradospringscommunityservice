import { Title1, Image, Divider, Title2, Text, List, ListItem, Title3, Persona, Button, Spinner } from "@fluentui/react-components";
import { Calendar16Color, LocationRipple16Color, CalendarAdd20Regular } from "@fluentui/react-icons";
import React from "react";
import { useSearchParams } from "react-router-dom";
import CheckInManager from "./components/CheckInManager";
import { useSession } from "./lib/auth-client";
import CalendarExport from "./components/CalendarExport";

interface PostData {
  id: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  current_participants: number;
  user_id: string;
  user_name: string;
  visible: number;
  created_at: string;
}

interface Participant {
  user_id: string;
  user_name: string;
  joined_at: string;
  attended: number;
  checked_in_at?: string;
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
  
  const [showCalendarExport, setShowCalendarExport] = React.useState(false);
  const [hasJoined, setHasJoined] = React.useState(false);

  const { data: session } = useSession();

  const fetchPost = React.useCallback(async () => {
    if (!postId) {
      setError("No post ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}`);

      if (!res.ok) {
        throw new Error('Post not found');
      }

      const data = await res.json();
      setPost(data.post);
      setParticipants(data.participants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  React.useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  React.useEffect(() => {
    if (post && session?.user && participants) {
      setIsOrganizer(post.user_id === session.user.id);
      // Check if current user is in participants list
      const userParticipant = participants.find(
        p => p.user_id === session.user.id
      );
      setHasJoined(!!userParticipant);
    }
  }, [post, session, participants]);

  const handleJoin = async () => {
    if (!postId) return;

    try {
      setJoining(true);
      const res = await fetch(`/api/posts/${postId}/participants`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        alert('Successfully joined the event!');
        setHasJoined(true); // Add this line
        fetchPost();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to join event');
      }
    } catch (err) {
      console.error('Join error:', err);
      alert('Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spinner label="Loading post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div>
        <Title1>Error</Title1>
        <Text>{error || 'Post not found'}</Text>
      </div>
    );
  }

  const isFull = post.current_participants >= post.max_participants;

  return (
    <div>
      <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <Title1>{post.title}</Title1>
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto' }}>
          {!hasJoined && (
            <Button 
              appearance="primary" 
              onClick={handleJoin}
              disabled={isFull || joining}
            >
              {joining ? 'Joining...' : isFull ? 'Event Full' : 'Sign Up'}
            </Button>
          )}
          
          {hasJoined && (
            <Button
              appearance="outline"
              icon={<CalendarAdd20Regular />}
              onClick={() => setShowCalendarExport(true)}
            >
              Add to Calendar
            </Button>
          )}
          
          {isOrganizer && (
            <Button 
              appearance="secondary"
              onClick={() => setShowCheckIn(true)}
            >
              Manage Attendance
            </Button>
          )}
        </div>
      </div>

      <Divider style={{ marginTop: '15px', marginBottom: '15px' }} />
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Image 
            style={{ maxWidth: '900px', borderRadius: '5px' }} 
            fit='contain' 
            src="https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2F8_Pikes%2520Peak-Garden%2520of%2520the%2520Gods.jpg&w=2048&q=75" 
            alt="Event" 
          />
          <Title2 style={{ marginTop: '15px' }}>Description</Title2>
          <Divider style={{ marginTop: '15px', marginBottom: '15px' }} />
          <Text>{post.description}</Text>
          
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: '16px' }}>
              <div>
                <Calendar16Color style={{ marginRight: '16px' }} />
                <Text><strong>Starts</strong>: {formatDateTime(post.start_datetime)}</Text>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Text><strong>Ends</strong>: {formatDateTime(post.end_datetime)}</Text>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Text>
                <LocationRipple16Color style={{ marginRight: '16px' }} />
                <strong>Location:</strong> {post.location}
              </Text>
            </div>
            <Persona name={post.user_name} style={{ marginTop: '16px' }} />
            
            
          </div>
        </div>

        <div style={{ marginLeft: '15px', width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title2>Participants</Title2>
            <Title3>{post.current_participants}/{post.max_participants}</Title3>
          </div>
          <Divider style={{ marginTop: '15px', marginBottom: '15px' }} />
          
          {participants.length === 0 ? (
            <Text>No participants yet. Be the first to join!</Text>
          ) : (
            <List>
              {participants.map((participant) => (
                <ListItem key={participant.user_id}>
                  <Persona name={participant.user_name} style={{ marginTop: '16px' }} />
                </ListItem>
              ))}
            </List>
          )}
        </div>
      </div>

      <CalendarExport
        open={showCalendarExport}
        onClose={() => setShowCalendarExport(false)}
        event={{
          title: post.title,
          description: post.description,
          location: post.location,
          startDateTime: post.start_datetime,
          endDateTime: post.end_datetime,
          organizerName: post.user_name,
        }}
      />

      <CheckInManager
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        postId={Number(postId)}
        participants={participants}
        isOrganizer={isOrganizer}
        onRefresh={fetchPost}
      />
    </div>
  );
}