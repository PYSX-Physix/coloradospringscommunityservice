import React from "react";
import {
  Title1, Title2, Divider, Card, CardHeader,
  Table, TableHeader, TableRow, TableHeaderCell,
  TableCell, TableBody, Text, Spinner, Badge,
} from "@fluentui/react-components";
import { useSession } from "./lib/auth-client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "./hooks/useIsMobile";

interface AttendanceRecord {
  event_title: string;
  event_organizer: string;
  event_location: string;
  event_start_datetime: string;
  event_end_datetime: string;
  checked_in_at: number;
}

function ShortText(text: string, isMobile: boolean): string {
  const maxChars = isMobile ? 8 : 24;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "...";
}

export default function Profile() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [eventHistory, setEventHistory] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!isPending && !session) {
      navigate("/auth");
    }
  }, [session, isPending, navigate]);

  React.useEffect(() => {
    if (session?.user) {
      fetchEventHistory();
    }
  }, [session]);

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/participants/history', {
        credentials: 'include',
      });
      const data = await res.json();
      setEventHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching event history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string | number) => {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (value: string | number) => {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isPending) {
    return <Spinner label="Loading profile..." />;
  }

  if (!session) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title1>Profile</Title1>
      </div>
      <Divider style={{ marginTop: '16px', marginBottom: '32px' }} />

      <Card>
        <CardHeader header={<Title2>Event Attendance History</Title2>} />
        <div style={{ padding: '16px' }}>
          <Text style={{ marginBottom: '16px', display: 'block' }}>
            Shows only events where an organizer confirmed your attendance. Records are kept permanently — even if the event is later deleted.
          </Text>

          {loading ? (
            <Spinner label="Loading attendance history..." />
          ) : eventHistory.length === 0 ? (
            <Text>You haven't attended any confirmed events yet.</Text>
          ) : (
            <>
              <Badge appearance="filled" color="success" style={{ marginBottom: '16px' }}>
                Total Events Attended: {eventHistory.length}
              </Badge>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <Table style={{ minWidth: '500px' }}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Event</TableHeaderCell>
                      <TableHeaderCell>Organizer</TableHeaderCell>
                      <TableHeaderCell>Location</TableHeaderCell>
                      <TableHeaderCell>Event Date</TableHeaderCell>
                      <TableHeaderCell>Attended On</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{ShortText(record.event_title, isMobile)}</TableCell>
                        <TableCell>{ShortText(record.event_organizer, isMobile)}</TableCell>
                        <TableCell>{ShortText(record.event_location, isMobile)}</TableCell>
                        <TableCell>{formatDate(record.event_start_datetime)}</TableCell>
                        <TableCell>{formatDate(record.event_end_datetime)}</TableCell>
                        <TableCell>{formatTime(record.checked_in_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}