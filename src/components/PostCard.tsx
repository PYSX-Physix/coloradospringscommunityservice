import React from 'react';
import {
  Title3, Text, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Field, RadioGroup, Radio, Divider, Textarea, Card, CardPreview, CardHeader, CardFooter,
  Image
} from "@fluentui/react-components";
import { BookmarkAdd20Regular, BookmarkAdd20Filled, Warning20Regular, CheckmarkCircle48Color, MoreHorizontal20Regular, Share20Regular } from "@fluentui/react-icons";
import { makeStyles } from "@fluentui/react-components";
import { useSavedPosts } from '../hooks/useSavedPosts';
import { useReportPost } from '../hooks/useReportPost';
import { useErrorNotice } from '../hooks/useErrorNotice';
import type { PostUI } from '../utils/types';
import { REPORT_CATEGORIES } from '../utils/types';
import ShareEvent from './ShareEvent';
import { NoticeDialog } from '../Post';
import defaultArt from "../assets/default-art.jpeg"

const cardStyles = makeStyles({
  card: {
    maxWidth: '400px',
    height: 'fit-content'
  }
});

interface PostCardProps {
  post: PostUI;
  onSaveToggle?: (postId: number, isSaved: boolean) => void;
}

/**
 * PostCard Component
 * 
 * Presentational component for rendering individual post in a card format.
 * Handles UI interactions for saving, sharing, and reporting posts.
 * 
 * Uses custom hooks for:
 * - useSavedPosts: Managing saved state with optimistic updates
 * - useReportPost: Managing report form state and submission
 * - useErrorNotice: Centralized error handling
 */
const PostCard = React.memo(function PostCard({ post, onSaveToggle }: PostCardProps) {
  const styles = cardStyles();
  const [showShareDialog, setShowShareDialog] = React.useState(false);

  // Initialize hooks
  const { isSaved, loading: saving, toggleSave } = useSavedPosts(
    post.isSaved,
    onSaveError
  );

  const {
    state: reportState,
    category: reportCategory,
    details: reportDetails,
    isSubmitting: reportSubmitting,
    setReportState,
    setCategory: setReportCategory,
    setDetails: setReportDetails,
    submitReport,
  } = useReportPost(onReportError);

  const {
    notice,
    isOpen: noticeOpen,
    showError,
    closeError,
  } = useErrorNotice();

  /**
   * Handle save toggle with optimistic updates
   */
  const handleSaveToggle = async () => {
    const result = await toggleSave(post.id);
    onSaveToggle?.(post.id, result);
  };

  /**
   * Handle report form submission
   */
  const handleReportSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    await submitReport(post.id);
  };

  /**
   * Error callback for save operations
   */
  function onSaveError(error: string) {
    showError('Failed to Save Post', error);
  }

  /**
   * Error callback for report operations
   */
  function onReportError(error: string) {
    showError('Report Error', error);
  }

  return (
    <div>
      <Card className={styles.card}>
        <CardPreview>
          <Image 
            src={post.image_url || defaultArt} 
            onError={(e) => {
              e.currentTarget.src = defaultArt;
            }}
            alt={post.title}
          />
        </CardPreview>
        <CardHeader
          header={<Title3>{post.title}</Title3>}
          description={<Text>{post.description}</Text>}
        />
        <CardFooter>
          <Button 
            appearance="primary" 
            as='a' 
            href={`/post?id=${post.id}`}
            aria-label={`View ${post.title} event details`}
          >
            View Event
          </Button>
          <Menu>
            <MenuTrigger>
              <Button 
                appearance="subtle" 
                icon={<MoreHorizontal20Regular />} 
                aria-label="Post action menu"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem 
                  icon={isSaved ? <BookmarkAdd20Filled /> : <BookmarkAdd20Regular />}
                  onClick={handleSaveToggle}
                  disabled={saving}
                  aria-label={isSaved ? 'Unsave post' : 'Save post'}
                >
                  {saving ? 'Updating...' : (isSaved ? 'Unsave Post' : 'Save Post')}
                </MenuItem>
                <MenuItem 
                  icon={<Share20Regular/>} 
                  onClick={() => setShowShareDialog(true)}
                  aria-label="Share post"
                >
                  Share Post
                </MenuItem>
                <MenuItem 
                  icon={<Warning20Regular />} 
                  onClick={() => setReportState('form')}
                  aria-label="Report post"
                >
                  Report Post
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </CardFooter>
      </Card>

      {/* Report Form Dialog */}
      <Dialog 
        open={reportState === 'form'} 
        onOpenChange={(_, data) => !data.open && setReportState('closed')}
      >
        <DialogSurface>
          <form onSubmit={handleReportSubmit}>
            <DialogBody>
              <DialogTitle>Report Post</DialogTitle>
              <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Text>
                  Reporting this post will require us to review this report. 
                  Any reports that aren't legitimate will cause your account to be flagged and blocked from sending reports.
                </Text>
                <Divider />
                
                <Field label="Select a category" required>
                  <RadioGroup 
                    value={reportCategory}
                    onChange={(_, data) => setReportCategory(data.value)}
                    aria-label="Report category selection"
                  >
                    {REPORT_CATEGORIES.map((cat) => (
                      <Radio 
                        key={cat.value}
                        value={cat.value} 
                        label={cat.label} 
                      />
                    ))}
                  </RadioGroup>
                </Field>

                <Field label="Additional Details" required>
                  <Textarea 
                    placeholder='Please provide details about the issue (minimum 10 characters)...'
                    value={reportDetails}
                    onChange={(_, data) => setReportDetails(data.value)}
                    aria-label="Report description"
                  />
                </Field>
              </DialogContent>

              <DialogActions>
                <Button 
                  appearance='primary' 
                  type='submit'
                  disabled={reportSubmitting}
                >
                  {reportSubmitting ? 'Submitting...' : 'Report'}
                </Button>
                <Button 
                  appearance='secondary' 
                  onClick={() => setReportState('closed')}
                  disabled={reportSubmitting}
                >
                  Cancel
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      {/* Report Confirmation Dialog */}
      <Dialog 
        open={reportState === 'confirmation'} 
        onOpenChange={(_, data) => !data.open && setReportState('closed')}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Report Sent</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <CheckmarkCircle48Color />
              <Text>Your report has been successfully sent and will be under review shortly.</Text>
            </DialogContent>
            <DialogActions>
              <Button 
                appearance='primary' 
                onClick={() => setReportState('closed')}
              >
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Share Event Dialog */}
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

      {/* Error Notice Dialog */}
      <NoticeDialog
        open={noticeOpen}
        title={notice?.title || ''}
        description={notice?.description || ''}
        onClose={closeError}
      />
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
