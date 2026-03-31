import React from 'react';
import {
  Title1, Title3, Text, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Field, RadioGroup, Radio, Divider, Textarea, Card, CardPreview,
  makeStyles, CardHeader, CardFooter, Spinner
} from "@fluentui/react-components";
import { BookmarkAdd20Regular, BookmarkAdd20Filled, Warning20Regular, CheckmarkCircle48Color, MoreHorizontal20Regular, Share20Regular } from "@fluentui/react-icons";
import './App.css';
import ShareEvent from './components/ShareEvent';
import defaultArt from "./assets/default-art.jpeg"
import { NoticeDialog } from './Post';

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
  image_url?: string;
}

function Posts() {
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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
  };

  return (
    <div>
      <Title1>Posts</Title1>
      <Divider style={{ marginTop: '16px', marginBottom: '32px' }}/>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Spinner label="Loading events..." />
        </div>
      ) : posts.length === 0 ? (
        <Text>No events available yet. Check back soon!</Text>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: PostData }) {
  type ReportState = "closed" | "form" | "confirmation";
  const [reportState, setReportState] = React.useState<ReportState>("closed");
  const [reportCategory, setReportCategory] = React.useState("");
  const [reportDetails, setReportDetails] = React.useState<string>("");
  const [isSaved, setIsSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(true);
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [noticeOpen, setNoticeOpen] = React.useState(false);
  const [noticeMessage, setNoticeMessage] = React.useState({ title: "", description: "" });

  const styles = cardStyles();

  React.useEffect(() => {
    checkSavedStatus();
  }, [post.id]);

  const checkSavedStatus = async () => {
    try {
      setCheckingStatus(true);
      const res = await fetch(`/api/saved-posts/check?postId=${post.id}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSaveToggle = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/saved-posts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId: post.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      } else {
        setNoticeMessage({ title: "Failed to Save Post", description: "You need to be signed in to save an event." });
        setNoticeOpen(true);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReportSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    
    try {
      const res = await fetch('/api/reports', {  // Changed from '/api/reports/create' to '/api/reports'
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post.id,
          category: reportCategory,
          description: reportDetails || 'No additional details provided',  // Changed from 'details' to 'description'
        }),
      });

      if (res.ok) {
        setReportState("confirmation");
        setReportCategory("");
        setReportDetails("");
      } else {
        const error = await res.json();
        setNoticeMessage({ title: "Failed to Submit Report", description: error.error.toLocaleString() });
        setNoticeOpen(true);
      }
    } catch (error) {
      console.error('Report error:', error);
      setNoticeMessage({ title: "Failed to Submit Report", description: "Please check the developer console for more information." });
      setNoticeOpen(true);
    }
  };

  return (
    <div>
      <Card className={styles.card}>
        <CardPreview>
          <img 
            src={post.image_url || defaultArt}
            alt="Event Image"
          />
        </CardPreview>
        <CardHeader
          header={<Title3>{post.title}</Title3>}
          description={<Text>{post.description}</Text>}
        />
        <CardFooter>
          <Button appearance="primary" as='a' href={`/post?id=${post.id}`}>View Event</Button>
          <Menu>
            <MenuTrigger>
              <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem 
                  icon={isSaved ? <BookmarkAdd20Filled /> : <BookmarkAdd20Regular />}
                  onClick={handleSaveToggle}
                  disabled={saving || checkingStatus}
                >
                  {checkingStatus ? 'Loading...' : (isSaved ? 'Unsave Post' : 'Save Post')}
                </MenuItem>
                <MenuItem icon={<Share20Regular/>} onClick={() => setShowShareDialog(true)}>Share Post</MenuItem>
                <MenuItem icon={<Warning20Regular />} onClick={() => setReportState("form")}>
                  Report Post
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </CardFooter>
      </Card>

      <Dialog open={reportState === "form"} onOpenChange={(_, data) => !data.open && setReportState("closed")}>
        <DialogSurface>
          <form onSubmit={handleReportSubmit}>
            <DialogBody>
              <DialogTitle>Report Post</DialogTitle>
              <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Text>Reporting this post will require us to review this report. Any reports that aren't legit will cause your account to be flagged and blocked from sending reports.</Text>
                <Divider style={{ marginBottom: '15px', marginTop: '15px' }} />
                <Field label={"Select a category"} required>
                  <RadioGroup 
                    value={reportCategory}
                    onChange={(_, data) => setReportCategory(data.value)}
                    required>
                    <Radio value="spam_misleading" label="Spam or Misleading" />
                    <Radio value="inappropriate_content" label="Offensive or Harmful Content" />
                    <Radio value="safety_concerns" label="Safety Concerns" />
                    <Radio value="terms_violation" label="Violation of Terms" />
                    <Radio value="other" label="Other" />
                  </RadioGroup>
                </Field>
                <Field label={"Additional Details"} required>
                  <Textarea 
                    placeholder='Please provide details about the issue...'
                    value={reportDetails}
                    onChange={(_, data) => setReportDetails(data.value)}
                    required
                    minLength={10}
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button appearance='primary' type='submit'>Report</Button>
                <Button appearance='secondary' onClick={() => setReportState("closed")}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      <Dialog open={reportState === "confirmation"} onOpenChange={(_, data) => !data.open && setReportState("closed")}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Report Sent</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
              <CheckmarkCircle48Color />
              <Text style={{ marginTop: '15px' }}>Your report has been successfully sent and will be under review shortly.</Text>
            </DialogContent>
            <DialogActions>
              <Button appearance='primary' onClick={() => setReportState('closed')}>Close</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <ShareEvent
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        event={{
          id: post.id,
          title: post.title,
          description: post.description,
          location: post.location,
          start_time: post.start_datetime,
          image_url: post.image_url,
        }}
      />

      <NoticeDialog
        open={noticeOpen}
        title={noticeMessage.title}
        description={noticeMessage.description}
        onClose={() => setNoticeOpen(false)}
      />
    </div>
  );
}

export default Posts;