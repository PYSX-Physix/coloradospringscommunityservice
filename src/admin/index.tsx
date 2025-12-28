import React from "react";
import {
  Title1, Title2, Text, Button, Divider, Spinner,
  Table, TableHeader, TableRow, TableHeaderCell,
  TableCell, TableBody, Badge, Menu, MenuTrigger,
  MenuPopover, MenuList, MenuItem, Dialog, DialogSurface,
  DialogBody, DialogTitle, DialogContent, DialogActions,
  Field, Textarea, Select, Card, CardHeader,
  TabList, Tab
} from "@fluentui/react-components";
import {
  ShieldTaskRegular, PersonRegular, DocumentRegular,
  ChevronRight20Regular, CheckmarkCircle20Regular,
  Dismiss20Regular, MoreHorizontal20Regular
} from "@fluentui/react-icons";
import { useSession } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";

interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  reported_user_id: string;
  reported_user_name: string;
  reported_user_email: string;
  post_id: number | null;
  post_title: string | null;
  category: string;
  description: string;
  status: string;
  created_at: number;
  reviewed_at: number | null;
  reviewed_by: string | null;
  action_taken: string | null;
  notes: string | null;
}

interface Stats {
  totalReports: number;
  pendingReports: number;
  totalUsers: number;
  totalPosts: number;
  reportsToday: number;
}

type TabValue = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export default function AdminPanel() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = React.useState<TabValue>('pending');
  const [reports, setReports] = React.useState<Report[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  
  // Review form state
  const [reviewStatus, setReviewStatus] = React.useState('resolved');
  const [actionTaken, setActionTaken] = React.useState('');
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    if (session?.user && !(session.user as any).isAdmin) {
      navigate("/");
      return;
    }
  }, [session, isPending, navigate]);

  React.useEffect(() => {
    if (session?.user && (session.user as any).isAdmin) {
      fetchReports(activeTab);
      fetchStats();
    }
  }, [session, activeTab]);

  const fetchReports = async (status: TabValue) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?status=${status}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    setReviewStatus(report.status || 'resolved');
    setActionTaken(report.action_taken || '');
    setReviewNotes(report.notes || '');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: reviewStatus,
          actionTaken,
          notes: reviewNotes,
        }),
      });

      if (res.ok) {
        setShowReviewDialog(false);
        fetchReports(activeTab);
        fetchStats();
      } else {
        alert('Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      inappropriate_content: 'Inappropriate Content',
      spam_misleading: 'Spam/Misleading',
      safety_concerns: 'Safety Concerns',
      terms_violation: 'Terms Violation',
      noshow_cancellation: 'No-Show/Cancellation',
      other: 'Other'
    };
    return labels[category] || category;
  };

  if (isPending) {
    return <Spinner label="Loading admin panel..." />;
  }

  if (!session || !(session.user as any).isAdmin) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <ShieldTaskRegular fontSize={32} />
        <Title1>Admin Panel</Title1>
      </div>

      <Divider style={{ marginBottom: '32px' }} />

      {/* Stats Dashboard */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          <Card>
            <CardHeader header={<Title2>{stats.pendingReports}</Title2>} />
            <Text>Pending Reports</Text>
          </Card>
          <Card>
            <CardHeader header={<Title2>{stats.totalReports}</Title2>} />
            <Text>Total Reports</Text>
          </Card>
          <Card>
            <CardHeader header={<Title2>{stats.reportsToday}</Title2>} />
            <Text>Reports Today</Text>
          </Card>
          <Card>
            <CardHeader header={<Title2>{stats.totalUsers}</Title2>} />
            <Text>Total Users</Text>
          </Card>
          <Card>
            <CardHeader header={<Title2>{stats.totalPosts}</Title2>} />
            <Text>Total Events</Text>
          </Card>
        </div>
      )}

      {/* Reports Section */}
      <Card>
        <div style={{ padding: '24px', overflow: 'hidden' }}>
          <Title2 style={{ marginBottom: '16px' }}>Reports Management</Title2>

          <TabList
            selectedValue={activeTab}
            onTabSelect={(_, data) => setActiveTab(data.value as TabValue)}
            style={{ marginBottom: '24px' }}
          >
            <Tab value="pending">
              Pending
              {stats && stats.pendingReports > 0 && (
                <Badge appearance="filled" color="important" style={{ marginLeft: '8px' }}>
                  {stats.pendingReports}
                </Badge>
              )}
            </Tab>
            <Tab value="under_review">Under Review</Tab>
            <Tab value="resolved">Resolved</Tab>
            <Tab value="dismissed">Dismissed</Tab>
          </TabList>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner label="Loading reports..." />
            </div>
          ) : reports.length === 0 ? (
            <Text style={{ display: 'block', padding: '32px', textAlign: 'center', color: '#666' }}>
              No {activeTab} reports
            </Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Report ID</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Reporter</TableHeaderCell>
                  <TableHeaderCell>Reported User</TableHeaderCell>
                  <TableHeaderCell>Event</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Text size={200} style={{ fontFamily: 'monospace' }}>
                        {report.id.substring(0, 8)}...
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge appearance="outline">
                        {getCategoryLabel(report.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Text weight="semibold">{report.reporter_name || 'Unknown'}</Text>
                        <Text size={200} style={{textOverflow: 'clip'}}>
                          {report.reporter_email || ''}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.reported_user_id ? (
                        <div>
                          <Text weight="semibold">{report.reported_user_name || 'Unknown'}</Text>
                          <Text size={200} style={{textOverflow: 'clip'}}>
                            {report.reported_user_email || ''}
                          </Text>
                        </div>
                      ) : (
                        <Badge appearance="tint">Post Only</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.post_title ? (
                        <Button
                          appearance="subtle"
                          size="small"
                          as="a"
                          href={`/post?id=${report.post_id}`}
                          target="_blank"
                          icon={<ChevronRight20Regular />}
                        >
                          {report.post_title.substring(0, 30)}...
                        </Button>
                      ) : (
                        <Text size={200}>-</Text>
                      )}
                    </TableCell>
                    <TableCell>
                      <Text size={200}>{formatDate(report.created_at)}</Text>
                    </TableCell>
                    <TableCell>
                      <Menu>
                        <MenuTrigger>
                          <Button appearance="subtle" icon={<MoreHorizontal20Regular />} />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem
                              icon={<DocumentRegular />}
                              onClick={() => handleReviewReport(report)}
                            >
                              Review Report
                            </MenuItem>
                            {report.reported_user_id && (
                              <MenuItem
                                icon={<PersonRegular />}
                                onClick={() => window.open(`/profile?user=${report.reported_user_id}`, '_blank')}
                              >
                                View Reported User
                              </MenuItem>
                            )}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Review Report Dialog */}
      <Dialog
        open={showReviewDialog}
        onOpenChange={(_, data) => !data.open && setShowReviewDialog(false)}
      >
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogBody>
            <DialogTitle>Review Report</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedReport && (
                <>
                  <div>
                    <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>
                      Report Details
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Text size={200}>
                        <strong>Category:</strong> {getCategoryLabel(selectedReport.category)}
                      </Text>
                      <Text size={200}>
                        <strong>Reporter:</strong> {selectedReport.reporter_name || 'Unknown'}
                      </Text>
                      {selectedReport.reported_user_id ? (
                        <Text size={200}>
                          <strong>Reported User:</strong> {selectedReport.reported_user_name || 'Unknown'}
                        </Text>
                      ) : (
                        <Text size={200}>
                          <strong>Report Type:</strong> Post Report Only
                        </Text>
                      )}
                      {selectedReport.post_title && (
                        <Text size={200}>
                          <strong>Event:</strong> {selectedReport.post_title}
                        </Text>
                      )}
                      <Text size={200}>
                        <strong>Date:</strong> {formatDate(selectedReport.created_at)}
                      </Text>
                    </div>
                  </div>

                  <Field label="Description">
                    <div>
                      <Text>{selectedReport.description}</Text>
                    </div>
                  </Field>

                  <Divider />

                  <Field label="Status" required>
                    <Select
                      value={reviewStatus}
                      onChange={(_, data) => setReviewStatus(data.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                      <option value="duplicate">Duplicate</option>
                    </Select>
                  </Field>

                  <Field label="Action Taken">
                    <Select
                      value={actionTaken}
                      onChange={(_, data) => setActionTaken(data.value)}
                    >
                      <option value="">-- Select Action --</option>
                      <option value="no_action">No Action Needed</option>
                      <option value="warning">User Warned</option>
                      <option value="content_removed">Content Removed</option>
                      <option value="temporary_ban">Temporary Ban</option>
                      <option value="permanent_ban">Permanent Ban</option>
                      <option value="investigating">Under Investigation</option>
                    </Select>
                  </Field>

                  <Field label="Moderator Notes">
                    <Textarea
                      placeholder="Add any notes about your decision..."
                      value={reviewNotes}
                      onChange={(_, data) => setReviewNotes(data.value)}
                      rows={4}
                    />
                  </Field>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={handleSubmitReview}
                disabled={submitting}
                icon={<CheckmarkCircle20Regular />}
              >
                {submitting ? 'Updating...' : 'Update Report'}
              </Button>
              <Button
                appearance="secondary"
                onClick={() => setShowReviewDialog(false)}
                icon={<Dismiss20Regular />}
              >
                Cancel
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}