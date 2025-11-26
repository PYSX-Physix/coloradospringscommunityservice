import React from "react";
import {
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent,
  DialogActions, Button, Table, TableHeader, TableRow,
  TableHeaderCell, TableCell, TableBody, Text, Checkbox,
  TableCellLayout, Badge
} from "@fluentui/react-components";
import { CheckmarkCircle20Regular, Circle20Regular } from "@fluentui/react-icons";

interface Participant {
  user_id: string;
  user_name: string;
  joined_at: string;
  attended: number;
  checked_in_at?: string;
}

interface CheckInManagerProps {
  open: boolean;
  onClose: () => void;
  postId: number;
  participants: Participant[];
  isOrganizer: boolean;
  onRefresh: () => void;
}

export default function CheckInManager({ 
  open, 
  onClose, 
  postId, 
  participants,
  isOrganizer,
  onRefresh 
}: CheckInManagerProps) {
  const [checking, setChecking] = React.useState(false);

  const handleCheckIn = async (participantUserId: string, currentStatus: number) => {
    if (!isOrganizer) return;

    try {
      setChecking(true);
      const newStatus = currentStatus ? 0 : 1; // Toggle status
      
      const res = await fetch(`/api/posts/${postId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          participantUserId,
          attended: newStatus
        }),
      });

      if (res.ok) {
        onRefresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to update attendance');
    } finally {
      setChecking(false);
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const attendedCount = participants.filter(p => p.attended).length;

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface style={{ maxWidth: '800px' }}>
        <DialogBody>
          <DialogTitle>Attendance Check-In</DialogTitle>
          <DialogContent>
            <div style={{ marginBottom: '16px' }}>
              <Text>
                <strong>Attendance Rate:</strong> {attendedCount}/{participants.length} 
                ({participants.length > 0 ? Math.round((attendedCount / participants.length) * 100) : 0}%)
              </Text>
            </div>

            {!isOrganizer && (
              <Badge appearance="outline" color="warning" style={{ marginBottom: '16px' }}>
                Only the event organizer can mark attendance
              </Badge>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Participant</TableHeaderCell>
                  <TableHeaderCell>Registered</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  {isOrganizer && <TableHeaderCell/>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.user_id}>
                    <TableCell>
                      <TableCellLayout>
                        {participant.attended ? (
                          <CheckmarkCircle20Regular style={{ color: 'green', marginRight: '16px' }} />
                        ) : (
                          <Circle20Regular />
                        )}
                        {participant.user_name}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell>
                      {new Date(participant.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {participant.attended ? (
                        <Badge appearance="filled" color="success">Attended</Badge>
                      ) : (
                        <Badge appearance="outline">Not Attended</Badge>
                      )}
                      {participant.checked_in_at && (
                        <Text size={200} style={{ display: 'block', marginTop: '4px' }}>
                          Checked in: {formatDateTime(participant.checked_in_at)}
                        </Text>
                      )}
                    </TableCell>
                    {isOrganizer && (
                      <TableCell>
                        <Checkbox
                          checked={!!participant.attended}
                          onChange={() => handleCheckIn(participant.user_id, participant.attended)}
                          disabled={checking}
                          label={participant.attended ? "Mark as not attended" : "Mark as attended"}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onClose}>Close</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}