import React from "react";
import { Button, Input, Text, Field, Dialog, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea,
  Table, TableHeader, TableRow, TableHeaderCell, TableCell, TableBody, Title1,
  TableCellLayout, Menu, MenuTrigger, MenuList, MenuPopover, MenuItem,
  MenuDivider,
  SpinButton, Spinner,
  MenuItemLink,
  TabList, Tab} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import { EditRegular, EyeRegular, AddCircle32Color, MoreHorizontal20Regular, DeleteRegular, DocumentArrowDown20Regular, CalendarAddRegular } from "@fluentui/react-icons";

import { useSession } from "./lib/auth-client";
import { downloadAttendanceSheet } from './utils/attendanceSheet';
import { useNavigate } from "react-router-dom";

import CalendarExport from "./components/CalendarExport";
import { AddressAutocomplete } from "./components/AddressAutoComplete";

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
  image_url?: string;
}

type TabValue = 'created' | 'saved' | 'joined';

function ShortText(text: string, isMobile: boolean): string {
  const maxChars = isMobile ? 3 : 20;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "...";
}

function YourPosts() {
  type DeleteModalState = 'closed' | 'modal' | 'confirmation'
  const [deleteModalState, setDeleteModalState] = React.useState<DeleteModalState>("closed")
  const [deletePostId, setDeletePostId] = React.useState<number | null>(null);

  type CreateModalState = 'closed' | 'modal' | 'confirmation'
  const [createModalState, setCreateModalState] = React.useState<CreateModalState>("closed")

  type EditModalState = 'closed' | 'modal' | 'confirmation'
  const [editModalState, setEditModalState] = React.useState<EditModalState>("closed")
  const [editingPostId, setEditingPostId] = React.useState<number | null>(null);

  // Event Post details
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [participants, setParticipants] = React.useState<number>(1);
  const [imageUrl, setImageUrl] = React.useState<string>("");

  // Posts data from API
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<PostData[]>([]);
  const [joinedPosts, setJoinedPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabValue>('created');

  const [downloadingAttendance, setDownloadingAttendance] = React.useState<number | null>(null);

  const [showCalendarExport, setShowCalendarExport] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<PostData | null>(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 500);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setImageUrl("");
    setLocation("");
    setStartDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setParticipants(1);
    setEditingPostId(null);
  };

  // Fetch Posts function
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
      month: 'short',
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
      imageUrl,
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
        resetForm();
        
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

  const handleEdit = (post: PostData) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setDesc(post.description);
    setLocation(post.location);
    setImageUrl(post.image_url || "");
    
    // Parse the stored datetime
    const startDT = new Date(post.start_datetime);
    const endDT = new Date(post.end_datetime);
    
    // For DatePicker: set the date portion only
    setStartDate(new Date(startDT.getFullYear(), startDT.getMonth(), startDT.getDate()));
    setEndDate(new Date(endDT.getFullYear(), endDT.getMonth(), endDT.getDate()));
    
    setStartTime(new Date(startDT.getHours(), startDT.getMinutes()));
    setEndTime(new Date(endDT.getHours(), endDT.getMinutes()));
    
    setParticipants(post.max_participants);
    
    setEditModalState('modal');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPostId) return;

    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);

    if (!startDateTime || !endDateTime) {
      alert('Please select both date and time for start and end');
      return;
    }
    
    const updateData = { 
      title, 
      description: desc,
      imageUrl,
      location, 
      startDateTime,
      endDateTime,
      maxParticipants: participants.toString(),
    };

    try {
      const res = await fetch(`/api/posts/${editingPostId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        // Reset form
        resetForm();
        
        // Close dialog and refresh posts
        setEditModalState("confirmation")
        fetchPosts();
      } else {
        const error = await res.json();
        alert('Error: ' + (error.error || 'Failed to update post'));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update post');
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
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <TabList selectedValue={activeTab} onTabSelect={(_, data) => setActiveTab(data.value as TabValue)} style={{ marginBottom: '16px' }}>
          <Tab value="created">Created Events</Tab>
          <Tab value="saved">Saved Events</Tab>
          <Tab value="joined">Joined Events</Tab>
        </TabList>
      </div>

      <Divider style={{ marginBottom: '16px'}}/>
      
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
              style={{alignSelf: "start", marginLeft: '16px', marginTop: 'auto', marginBottom: 'auto'}}
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
                      {ShortText(column.label, isMobile)}
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{ShortText(post.title, isMobile)}</TableCell>
                    <TableCell>{ShortText(post.location, isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDate(post.created_at), isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDateTime(post.start_datetime), isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDateTime(post.end_datetime), isMobile)}</TableCell>
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
                              <MenuItem icon={<EditRegular />} onClick={ () => handleEdit(post)}>Edit</MenuItem>
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
                      {ShortText(column.label, isMobile)}
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{ShortText(post.title, isMobile)}</TableCell>
                    <TableCell>{ShortText(post.location, isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDate(post.created_at), isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDateTime(post.start_datetime), isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDateTime(post.end_datetime), isMobile)}</TableCell>
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
                      {ShortText(column.label, isMobile)}
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {joinedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{ShortText(post.title, isMobile)}</TableCell>
                    <TableCell>{ShortText(post.location, isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDate(post.created_at), isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDateTime(post.start_datetime), isMobile)}</TableCell>
                    <TableCell>{ShortText(formatDateTime(post.end_datetime), isMobile)}</TableCell>
                    <TableCell>{post.current_participants}/{post.max_participants}</TableCell>
                    <TableCell role="gridcell">
                      <TableCellLayout>
                        <Menu>
                          <MenuTrigger>
                            <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem icon={<CalendarAddRegular />} onClick={() => setShowCalendarExport(true)}>Add to Calendar</MenuItem>
                              <MenuItemLink icon={<EyeRegular/>} href={`/post?id=${post.id}`}>View Post</MenuItemLink>
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
                    resize="vertical"
                    required
                  />
                </Field>
                <Field label={"Image URL"}>
                  <Input 
                    placeholder="Optional image URL for the event" 
                    value={imageUrl} 
                    onChange={(_, data) => setImageUrl(data.value)}
                  />
                </Field>
                <AddressAutocomplete value={location} onChange={setLocation} required label="Location"/>
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

      <Dialog open={editModalState === 'modal'} onOpenChange={() => {
        setEditModalState("closed");
        resetForm();
      }}>
        <DialogSurface>
          <form onSubmit={handleEditSubmit}>
            <DialogBody>
              <DialogTitle>Edit Community Service Event</DialogTitle>
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
                    resize="vertical"
                  />
                </Field>
                <Field label={"Image URL"}>
                  <Input 
                    placeholder="Optional image URL for the event" 
                    value={imageUrl} 
                    onChange={(_, data) => setImageUrl(data.value)}
                  />
                </Field>
                <AddressAutocomplete value={location} onChange={setLocation} required label="Location"/>
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
                <Button appearance="primary" type="submit">Update</Button>
                <Button appearance="secondary" onClick={() => {
                  setEditModalState("closed");
                  resetForm();
                }}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      {/* Event Updated Confirmation Dialog */}
      <Dialog open={editModalState === 'confirmation'} onOpenChange={() => setEditModalState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Event Updated!</DialogTitle>
            <DialogContent>Your event has been updated successfully!</DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setEditModalState('closed')}>Ok</Button>
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

      {selectedEvent && (
        <CalendarExport
          open={showCalendarExport}
          onClose={() => {
            setShowCalendarExport(false);
            setSelectedEvent(null);
          }}
          event={{
            title: selectedEvent.title,
            description: selectedEvent.description,
            location: selectedEvent.location,
            startDateTime: selectedEvent.start_datetime,
            endDateTime: selectedEvent.end_datetime,
            organizerName: selectedEvent.user_name,
          }}
        />
      )}
    </div>
  );
}

export default YourPosts;