import React from "react";
import { Button, Text, Divider,
  Table, TableHeader, TableRow, TableHeaderCell, TableCell, TableBody, Title1,
  TableCellLayout, Menu, MenuTrigger, MenuList, MenuPopover, MenuItem,
  MenuDivider,
  Spinner,
  MenuItemLink,
  TabList, Tab} from "@fluentui/react-components";
import { EditRegular, EyeRegular, AddCircle32Color, MoreHorizontal20Regular, DeleteRegular, DocumentArrowDown20Regular, CalendarAddRegular } from "@fluentui/react-icons";

import { useSession } from "./lib/auth-client";
import { downloadAttendanceSheet } from './utils/attendanceSheet';
import { useNavigate } from "react-router-dom";

import { useIsMobile } from "./hooks/useIsMobile";
import YourPostsDialogs from "./YourPostsDialogs";

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

  const [downloadingAttendance, setDownloadingAttendance] = React.useState<number | null>(null);

  const [showCalendarExport, setShowCalendarExport] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<PostData | null>(null);
  const [currentEditingPost, setCurrentEditingPost] = React.useState<PostData | null>(null);

  // Posts data from API
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<PostData[]>([]);
  const [joinedPosts, setJoinedPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabValue>('created');
  const isMobile = useIsMobile();

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
  // userId and userName are used in dialogs

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
            <div style={{ overflowX: 'auto', width: '100%'}}>
              <Table style={{marginTop: '16px', minWidth: '600px'}} aria-label="Your Posts Table" id="yourpoststable" sortable>
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
                                <MenuItem icon={<EditRegular />} onClick={ () => { setCurrentEditingPost(post); setEditModalState("modal"); }}>Edit</MenuItem>
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
            </div>
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
            <div style={{ overflowX: 'auto', width: '100%'}}>
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
            </div>
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
            <div style={{ overflowX: 'auto', width: '100%'}}>
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
                                <MenuItem icon={<CalendarAddRegular />} onClick={() => { setSelectedEvent(post); setShowCalendarExport(true); }}>Add to Calendar</MenuItem>
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
            </div>
            
          )}
        </>
      )}

      <YourPostsDialogs
        createModalState={createModalState}
        setCreateModalState={setCreateModalState}
        editModalState={editModalState}
        setEditModalState={setEditModalState}
        deleteModalState={deleteModalState}
        setDeleteModalState={setDeleteModalState}
        deletePostId={deletePostId}
        currentEditingPost={currentEditingPost}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        showCalendarExport={showCalendarExport}
        setShowCalendarExport={setShowCalendarExport}
        session={session}
        onPostCreated={() => fetchPosts()}
        onPostUpdated={() => fetchPosts()}
        onPostDeleted={() => fetchPosts()}
        isMobile={isMobile}
      />
    </div>
  );
}

export default YourPosts;