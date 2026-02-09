import { Title1, Image, Divider, Title2, Text, List, ListItem, Avatar, Persona, Button, Spinner, MenuTrigger, Menu, MenuPopover, MenuList, MenuItem, Card, Badge} from "@fluentui/react-components";
import { Calendar16Color, LocationRipple16Color, CalendarAdd20Regular, MoreHorizontalRegular, ShieldErrorRegular, People48Regular, Share20Filled } from "@fluentui/react-icons";
import React from "react";
import { useSearchParams } from "react-router-dom";
import CheckInManager from "./components/CheckInManager";
import { useSession } from "./lib/auth-client";
import CalendarExport from "./components/CalendarExport";
import { ReportUser } from "./components/ReportUser";

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
  image_url?: string;
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

  const [showReportDialog, setShowReportDialog] = React.useState(false);
  const [reportedUserId, setReportedUserId] = React.useState<string | null>(null);
  const [reportedUserName, setReportedUserName] = React.useState("");

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
        setHasJoined(true);
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spinner label="Loading event..." size="large" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title1>Event Not Found</Title1>
        <Text style={{ marginTop: '12px', display: 'block' }}>{error || 'This event does not exist or has been removed.'}</Text>
      </div>
    );
  }

  const isFull = post.current_participants >= post.max_participants;
  const spotsRemaining = post.max_participants - post.current_participants;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <Title1 style={{ marginBottom: '8px' }}>{post.title}</Title1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <div style={{flexDirection: 'row'}}>
                <Text>Organized by: </Text>
                <Avatar name={post.user_name}/>
                <Text style={{marginLeft: '4px'}}>{post.user_name}</Text>
              </div>
              <Menu>
                <MenuTrigger>
                  <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular/>}/>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem icon={<ShieldErrorRegular/>} onClick={() => {
                      setReportedUserId(post.user_id);
                      setReportedUserName(post.user_name);
                      setShowReportDialog(true);
                    }}>
                      Report Organizer
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button appearance="secondary" icon={<Share20Filled />}>
              Share Event
            </Button>
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
                appearance="primary"
                onClick={() => setShowCheckIn(true)}
              >
                Manage Attendance
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left Column - Event Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Event Image */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Image 
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} 
              fit='cover' 
              src={post.image_url || '/default-event-image.jpg'} 
              alt={post.title}
            />
          </Card>

          {/* Date, Time & Location Card */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', width: '100%' }}>
                <Calendar16Color style={{ marginTop: '4px', fontSize: '20px' }} />
                <div style={{ flex: 1 }}>
                  <Text weight="semibold" size={400} style={{ display: 'block', marginBottom: '4px' }}>
                    Date & Time
                  </Text>
                  <Text size={300} style={{ display: 'block' }}>
                    {formatDateTime(post.start_datetime)}
                  </Text>
                  <Text size={300} style={{ display: 'block', marginTop: '4px' }}>
                    Ends at {formatTime(post.end_datetime)}
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', width: '100%' }}>
                <LocationRipple16Color style={{ marginTop: '4px', fontSize: '20px' }} />
                <div style={{ flex: 1 }}>
                  <Text weight="semibold" size={400} style={{ display: 'block', marginBottom: '4px' }}>
                    Location
                  </Text>
                  <Text size={300} style={{ display: 'block' }}>
                    {post.location}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Description Card */}
          <Card>
            <Title2>About This Event</Title2>
            <Divider  style={{ marginBottom: '6px', marginTop: '6px' }}/>
            <Text style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {post.description}
            </Text>
          </Card>
        </div>

        {/* Right Column - Participants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card style={{ position: 'sticky', top: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <People48Regular />
                Participants
              </Title2>
              <Badge 
                appearance={isFull ? "filled" : "outline"}
                color={isFull ? "danger" : "success"}
              >
                {post.current_participants}/{post.max_participants}
              </Badge>
            </div>
            {!hasJoined && !isOrganizer && (
              <Button 
                appearance="primary"
                onClick={handleJoin}
                disabled={isFull || joining}
              >
                {joining ? 'Joining...' : isFull ? 'Event Full' : 'Sign Up'}
              </Button>
            )}
            
            
            {!isFull && spotsRemaining <= 5 && spotsRemaining > 0 && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#FFF4CE', 
                borderRadius: '4px', 
                marginBottom: '16px',
                border: '1px solid #F7C548'
              }}>
                <Text size={300} weight="semibold">
                  Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining!
                </Text>
              </div>
            )}
            
            <Divider style={{ marginBottom: '16px' }} />
            
            {participants.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px 16px',
                color: '#616161'
              }}>
                <People48Regular style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }} />
                <Text size={300} style={{ display: 'block' }}>
                  No participants yet. Be the first to join!
                </Text>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <List>
                  {participants.map((participant) => (
                    <ListItem 
                      key={participant.user_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Persona 
                        name={participant.user_name} 
                        size="medium"
                      />
                      
                      {participant.user_id === session?.user.id && (
                        <Badge 
                          appearance="outline" 
                          color="brand"
                          style={{ marginLeft: '12px' }}
                        >
                          You
                        </Badge>
                      )}

                      {participant.user_id === post.user_id && (
                        <Badge 
                          appearance="filled" 
                          color="important"
                          style={{ marginLeft: '12px' }}
                        >
                          Organizer
                        </Badge>
                      )}
                      
                      {participant.user_id !== session?.user.id && (
                        <div style={{ marginLeft: 'auto' }}>
                          <Menu>
                            <MenuTrigger>
                              <Button 
                                size="small"
                                appearance="subtle" 
                                icon={<MoreHorizontalRegular/>}
                              />
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem 
                                  icon={<ShieldErrorRegular/>}
                                  onClick={() => {
                                    setReportedUserId(participant.user_id);
                                    setReportedUserName(participant.user_name);
                                    setShowReportDialog(true);
                                  }}
                                >
                                  Report User
                                </MenuItem>
                              </MenuList>
                            </MenuPopover>
                          </Menu>
                        </div>
                      )}
                    </ListItem>
                  ))}
                </List>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {reportedUserId && (
        <ReportUser
          open={showReportDialog}
          onClose={() => {
            setShowReportDialog(false);
            setReportedUserId(null);
            setReportedUserName("");
          }}
          reportedUserId={reportedUserId}
          reportedUserName={reportedUserName}
          postId={post?.id}
          postTitle={post?.title}
        />
      )}

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