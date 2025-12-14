import React from "react";
import {
  Title1, Title2, Divider, Card, CardHeader,
  Table, TableHeader, TableRow, TableHeaderCell,
  TableCell, TableBody, Text, Spinner, Badge
} from "@fluentui/react-components";
import { useSession } from "./lib/auth-client";
import { useNavigate } from "react-router-dom";

interface Event {
  id: number;
  event_title: string;
  event_location: string;
  event_start_datetime: string;
  event_end_datetime: string;
  checked_in_at: string;
}

export default function Profile() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  
  const [eventHistory, setEventHistory] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      <Title1>Profile</Title1>
      <Divider style={{ marginTop: '16px', marginBottom: '32px' }} />

      <Card>
        <CardHeader header={<Title2>Event Attendance History</Title2>} />
        <div style={{ padding: '16px' }}>
          <Text style={{ marginBottom: '16px', display: 'block' }}>
            This shows only events you have been confirmed as attending by the event organizer. If the event is ever deleted by the organizer, it will not effect this list to keep a permanent record of your attendance.
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Event</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                    <TableHeaderCell>Event Date</TableHeaderCell>
                    <TableHeaderCell>Attended On</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventHistory.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.event_title}</TableCell>
                      <TableCell>{event.event_location}</TableCell>
                      <TableCell>{formatDateTime(event.event_start_datetime)}</TableCell>
                      <TableCell>{formatDateTime(event.checked_in_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}