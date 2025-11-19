import React from "react";
import { Button, Input, Text, Field, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogContent, DialogActions, DialogBody, Divider, Textarea,
  Table, TableHeader, TableRow, TableHeaderCell, TableCell, TableBody, Title1,
  TableCellLayout, Menu, MenuTrigger, MenuList, MenuPopover, MenuItem,
  MenuDivider,
  SpinButton, Spinner} from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import { TimePicker } from "@fluentui/react-timepicker-compat";
import { EditRegular, EyeRegular, AddCircle32Color, MoreHorizontal20Regular, DeleteRegular } from "@fluentui/react-icons";

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
  const [loading, setLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Fetch posts from API
  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch posts on component mount
  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
      participants: participants.toString()
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
        const data = JSON.parse(responseText);
        alert('Post created successfully with ID: ' + data.id);
        
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
        setCreateDialogOpen(false);
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
    {columnKey: "visible", label: "Visibility"}
  ];

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Title1 style={{marginBottom: '16px'}}>Saved Events</Title1>
      <Text>Saved posts will go here</Text>
      <Divider style={{marginTop: "16px", marginBottom: "16px"}}/>
      <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
        <Title1>Manage Events</Title1>
        <Dialog open={createDialogOpen} onOpenChange={(_, data) => setCreateDialogOpen(data.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button 
              size="large" 
              icon={<AddCircle32Color/>} 
              appearance="subtle" 
              style={{alignSelf: "start", marginLeft: '16px'}}
            />
          </DialogTrigger>
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
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                </DialogActions>
              </DialogBody>
            </form>
          </DialogSurface>
        </Dialog>
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
                <TableCell>{post.visible ? 'Visible' : 'Hidden'}</TableCell>
                <TableCell role="gridcell">
                  <TableCellLayout>
                    <Menu>
                      <MenuTrigger>
                        <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem icon={<EditRegular />}>Edit</MenuItem>
                          <MenuItem icon={<EyeRegular />}><a  href={`/post?id=${post.id}`}>View Post</a></MenuItem>
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