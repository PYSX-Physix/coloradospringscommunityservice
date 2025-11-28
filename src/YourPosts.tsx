import React from "react";
import { Button, Input, Text, Field, Dialog, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea,
  Table, TableHeader, TableRow, TableHeaderCell, TableCell, TableBody, Title1,
  TableCellLayout, Menu, MenuTrigger, MenuList, MenuPopover, MenuItem,
  MenuDivider,
  SpinButton, Spinner,
  MenuItemLink} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import { EditRegular, EyeRegular, AddCircle32Color, MoreHorizontal20Regular, DeleteRegular, DocumentArrowDown20Regular } from "@fluentui/react-icons";

import { useSession } from "./lib/auth-client";
import { downloadAttendanceSheet } from './utils/attendanceSheet';
import { useNavigate } from "react-router-dom";

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
  visible: number;
  created_at: string;
}

function YourPosts() {
  type DeleteModalState = 'closed' | 'modal' | 'confirmation'
  const [deleteModalState, setDeleteModalState] = React.useState<DeleteModalState>("closed")
  const [deletePostId, setDeletePostId] = React.useState<number | null>(null);

  type CreateModalState = 'closed' | 'modal' | 'confirmation'
  const [createModalState, setCreateModalState] = React.useState<CreateModalState>("closed")

  // Event Post details
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [participants, setParticipants] = React.useState<number>(1);

  // Posts data from API
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<PostData[]>([]);
  const [joinedPosts, setJoinedPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'created' | 'saved' | 'joined'>('created');

  const [downloadingAttendance, setDownloadingAttendance] = React.useState<number | null>(null);

  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();


  const handleDownloadAttendance = async (postId: number) => {
    try {
      setDownloadingAttendance(postId);
      
      const res = await fetch(`/api/posts/${postId}/attendance`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to download attendance sheet');
        return;
      }

      const data = await res.json();
      
      downloadAttendanceSheet(
        {
          title: data.event.title,
          description: data.event.description,
          location: data.event.location,
          start_datetime: data.event.start_datetime,
          end_datetime: data.event.end_datetime,
          organizer: data.event.user_name,
        },
        data.participants
      );
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download attendance sheet');
    } finally {
      setDownloadingAttendance(null);
    }
  };

  // Fetch Posts function (This should get only the users created events and not anyone elses)
  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts/my-posts', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedPosts = React.useCallback(async () => {
    try {
      const res = await fetch('/api/saved-posts', { credentials: 'include' });
      const data = await res.json();
      setSavedPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  }, []);

  const fetchJoinedPosts = React.useCallback(async () => {
    try {
      const res = await fetch('/api/participants/my-events', { credentials: 'include' });
      const data = await res.json();
      setJoinedPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching joined posts:', error);
    }
  }, []);

  // Fetch posts on component mount
  React.useEffect(() => {
    fetchPosts();
    fetchSavedPosts();
    fetchJoinedPosts();
  }, [fetchPosts, fetchSavedPosts, fetchJoinedPosts]);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isPending && !session) {
      navigate("/auth");
    }
  }, [session, isPending, navigate]);

  // NOW do conditional returns AFTER all hooks
  if (isPending) {
    return <Spinner label="Loading..." />;
  }

  if (!session) {
    return null;
  }

  // Get user info
  const userId = session.user.id;
  const userName = session.user.name || session.user.email;

  // Format datetime for display
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

  // Format date for "Created On" column
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const combineDateAndTime = (date: Date | null, time: Date | null): string => {
    if (!date || !time) return '';
    
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined.toISOString();
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);

    if (!startDateTime || !endDateTime) {
      alert('Please select both date and time for start and end');
      return;
    }
    
    const newPost = { 
      title, 
      desc, 
      location, 
      startDateTime,
      endDateTime,
      participants: participants.toString(),
      userId,
      userName
    };

    console.log('Sending:', newPost);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const responseText = await res.text();
      console.log('Response:', responseText);

      if (res.ok) {
        // Reset form
        setTitle("");
        setDesc("");
        setLocation("");
        setStartDate(null);
        setStartTime(null);
        setEndDate(null);
        setEndTime(null);
        setParticipants(1);
        
        // Close dialog and refresh posts
        setCreateModalState("confirmation")
        fetchPosts();
      } else {
        const error = JSON.parse(responseText);
        alert('Error: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to create post');
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      const res = await fetch(`/api/posts/${deletePostId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteModalState('confirmation');
        fetchPosts(); // Refresh the list
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    }
  };

  const columns = [
    {columnKey: "title", label: "Title"},
    {columnKey: "location", label: "Location"},
    {columnKey: "created", label: "Created On"},
    {columnKey: "start", label: "Starts"},
    {columnKey: "ends", label: "Ends"},
    {columnKey: "participants", label: "Participants"}
  ];

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Title1 style={{marginBottom: '16px'}}>My Events</Title1>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button 
          appearance={activeTab === 'created' ? 'primary' : 'subtle'}
          onClick={() => setActiveTab('created')}
        >
          Created Events ({posts.length})
        </Button>
        <Button 
          appearance={activeTab === 'saved' ? 'primary' : 'subtle'}
          onClick={() => setActiveTab('saved')}
        >
          Saved Events ({savedPosts.length})
        </Button>
        <Button 
          appearance={activeTab === 'joined' ? 'primary' : 'subtle'}
          onClick={() => setActiveTab('joined')}
        >
          Joined Events ({joinedPosts.length})
        </Button>
      </div>

      <Divider style={{marginTop: "16px", marginBottom: "16px"}}/>
      
      {/* Created Events Tab */}
      {activeTab === 'created' && (
        <>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <Title1>Manage Events</Title1>
            <Button 
              size="large" 
              icon={<AddCircle32Color/>} 
              appearance="subtle" 
              onClick={() => setCreateModalState("modal")}
              style={{alignSelf: "start", marginLeft: '16px'}}
            />
          </div>

          {loading ? (
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '32px'}}>
              <Spinner label="Loading posts..." />
            </div>
          ) : posts.length === 0 ? (
            <Text style={{marginTop: '32px'}}>No posts yet. Create your first event!</Text>
          ) : (
            <Table style={{marginTop: '16px'}} aria-label="Your Posts Table" id="yourpoststable" sortable>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>
                      {column.label}
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.location}</TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell>{formatDateTime(post.start_datetime)}</TableCell>
                    <TableCell>{formatDateTime(post.end_datetime)}</TableCell>
                    <TableCell>{post.current_participants + "/" + post.max_participants}</TableCell>
                    <TableCell role="gridcell">
                      <TableCellLayout>
                        <Menu>
                          <MenuTrigger>
                            <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem 
                                icon={<DocumentArrowDown20Regular />}
                                onClick={() => handleDownloadAttendance(post.id)}
                                disabled={downloadingAttendance === post.id}
                              >
                                {downloadingAttendance === post.id ? 'Downloading...' : 'Download Attendance Sheet'}
                              </MenuItem>
                              <MenuDivider />
                              <MenuItem icon={<EditRegular />}>Edit</MenuItem>
                              <MenuItemLink icon={<EyeRegular/>} href={`/post?id=${post.id}`}>View Post</MenuItemLink>
                              <MenuDivider/>
                              <MenuItem 
                                icon={<DeleteRegular/>} 
                                onClick={() => {
                                  setDeletePostId(post.id);
                                  setDeleteModalState("modal");
                                }}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      </TableCellLayout>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Saved Events Tab */}
      {activeTab === 'saved' && (
        <>
          <Title1>Saved Events</Title1>
          {savedPosts.length === 0 ? (
            <Text style={{marginTop: '32px'}}>No saved events yet. Browse events and save your favorites!</Text>
          ) : (
            <Table style={{marginTop: '16px'}} aria-label="Saved Posts Table">
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>
                      {column.label}
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.location}</TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell>{formatDateTime(post.start_datetime)}</TableCell>
                    <TableCell>{formatDateTime(post.end_datetime)}</TableCell>
                    <TableCell>{post.current_participants}/{post.max_participants}</TableCell>
                    <TableCell>
                      <Button as="a" href={`/post?id=${post.id}`} icon={<EyeRegular/>}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Joined Events Tab */}
      {activeTab === 'joined' && (
        <>
          <Title1>Events You've Joined</Title1>
          {joinedPosts.length === 0 ? (
            <Text style={{marginTop: '32px'}}>You haven't joined any events yet. Browse events and sign up!</Text>
          ) : (
            <Table style={{marginTop: '16px'}} aria-label="Joined Events Table">
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHeaderCell key={column.columnKey}>
                      {column.label}
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {joinedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.location}</TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell>{formatDateTime(post.start_datetime)}</TableCell>
                    <TableCell>{formatDateTime(post.end_datetime)}</TableCell>
                    <TableCell>{post.current_participants}/{post.max_participants}</TableCell>
                    <TableCell>
                      <Button as="a" href={`/post?id=${post.id}`} icon={<EyeRegular/>}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createModalState === 'modal'} onOpenChange={() => setCreateModalState("closed")}>
        <DialogSurface>
          <form onSubmit={handlePostSubmit}>
            <DialogBody>
              <DialogTitle>Create Community Service Event</DialogTitle>
              <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <Divider style={{marginBottom: '15px', marginTop: '15px'}}/>
                <Field label={"Event Name:"} required>
                  <Input 
                    placeholder="ex: Swim Competition Volunteer" 
                    value={title} 
                    onChange={(_, data) => setTitle(data.value)} 
                    required
                  />
                </Field>
                <Field label={"Description:"} required>
                  <Textarea 
                    placeholder="Be descriptive about the event here." 
                    value={desc} 
                    onChange={(_, data) => setDesc(data.value)} 
                    required 
                  />
                </Field>
                <Field label={"Location:"} required>
                  <Input 
                    placeholder="ex: 1234, Main Street Rd" 
                    value={location} 
                    onChange={(_, data) => setLocation(data.value)} 
                    required
                  />
                </Field>
                <div style={{display: "flex", flexDirection: 'row'}}>
                  <Field label={"Start Day"} required>
                    <DatePicker 
                      placeholder="Select a Date..." 
                      value={startDate} 
                      onSelectDate={(date) => setStartDate(date || null)} 
                      required
                    />
                  </Field>
                  <Field style={{marginLeft: '16px'}} label={"Start Time"} required>
                    <TimePicker 
                      placeholder="Select a Time..." 
                      selectedTime={startTime}
                      onTimeChange={(_, data) => setStartTime(data.selectedTime || null)}
                      required
                    />
                  </Field>
                </div>
                <div style={{display: "flex", flexDirection: 'row'}}>
                  <Field label={"End Day"} required>
                    <DatePicker 
                      placeholder="Select a Date..." 
                      value={endDate} 
                      onSelectDate={(date) => setEndDate(date || null)} 
                      required
                    />
                  </Field>
                  <Field style={{marginLeft: '16px'}} label={"End Time"} required>
                    <TimePicker 
                      placeholder="Select a Time..." 
                      selectedTime={endTime}
                      onTimeChange={(_, data) => setEndTime(data.selectedTime || null)}
                      required
                    />
                  </Field>
                </div>
                <Field label={"Number of Participants"} required>
                  <SpinButton 
                    value={participants} 
                    onChange={(_, data) => setParticipants(data.value || 1)} 
                    min={1} 
                    max={40} 
                    required 
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" type="submit">Create</Button>
                <Button appearance="secondary" onClick={() => setCreateModalState("closed")}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      {/* Event Created Confirmation Dialog */}
      <Dialog open={createModalState === 'confirmation'} onOpenChange={() => setCreateModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Event Created!</DialogTitle>
            <DialogContent>Your event has been created! If you want to view it, just click "View Post" under <MoreHorizontal20Regular/> menu to see it.</DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setCreateModalState('closed')}>Ok</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalState === "modal"} onOpenChange={(_, data) => !data.open && setDeleteModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Event Post?</DialogTitle>
            <DialogContent>
              <Divider style={{ marginBottom: '15px', marginTop: '15px' }} />
              <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
            </DialogContent>
            <DialogActions style={{ marginTop: '15px'}}>
              <Button appearance='primary' onClick={handleDelete}>Delete</Button>
              <Button appearance='secondary' onClick={() => setDeleteModalState("closed")}>Cancel</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Success Dialog */}
      <Dialog open={deleteModalState === 'confirmation'} onOpenChange={(_, data) => !data.open && setDeleteModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Event Deleted</DialogTitle>
            <DialogContent>Your event post has been deleted. If this was done by mistake you have to make a new event.</DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setDeleteModalState('closed')}>Ok</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default YourPosts;