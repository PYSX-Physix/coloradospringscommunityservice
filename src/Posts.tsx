import React from 'react';
import {
  Title1, Title3, Text, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Field, RadioGroup, Radio, Divider, Textarea, Card, CardPreview,
  makeStyles, CardHeader, CardFooter, Spinner
} from "@fluentui/react-components";
import { BookmarkAdd20Regular, BookmarkAdd20Filled, Warning20Regular, CheckmarkCircle48Color, MoreHorizontal20Regular } from "@fluentui/react-icons";
import './App.css';

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
  const [reportDetails, setReportDetails] = React.useState("");
  const [isSaved, setIsSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(true);

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
        alert('Failed to save post. Please sign in.');
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
      const res = await fetch('/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post.id,
          category: reportCategory,
          details: reportDetails,
        }),
      });

      if (res.ok) {
        setReportState("confirmation");
        setReportCategory("");
        setReportDetails("");
      } else {
        alert('Failed to submit report. Please sign in.');
      }
    } catch (error) {
      console.error('Report error:', error);
      alert('Failed to submit report');
    }
  };

  return (
    <div>
      <Card className={styles.card}>
        <CardPreview>
          <img 
            src="https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2F8_Pikes%2520Peak-Garden%2520of%2520the%2520Gods.jpg&w=2048&q=75"
            alt="Event" 
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
                    <Radio value="spam" label="Spam" />
                    <Radio value="offensive" label="Offensive or Harmful Content" />
                    <Radio value="misinformation" label="Misinformation" />
                    <Radio value="safety concerns" label="Safety Concerns" />
                    <Radio value="duplicate" label="Duplicate Post" />
                    <Radio value="other" label="Other" />
                  </RadioGroup>
                </Field>
                <Field label={"Additional Details (Optional)"}>
                  <Textarea 
                    placeholder='Details...'
                    value={reportDetails}
                    onChange={(_, data) => setReportDetails(data.value)}
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
    </div>
  );
}

export default Posts;