
import {
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent,
  DialogActions, Button, Text
} from "@fluentui/react-components";
import {
  CalendarLtr20Regular,
  ArrowDownload20Regular
} from "@fluentui/react-icons";
import {
  downloadICSFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl
} from "../utils/CalendarExport";

interface CalendarExportProps {
  open: boolean;
  onClose: () => void;
  event: {
    title: string;
    description: string;
    location: string;
    startDateTime: string;
    endDateTime: string;
    organizerName: string;
  };
}

export default function CalendarExport({
  open,
  onClose,
  event
}: CalendarExportProps) {
  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event), '_blank');
    onClose();
  };

  const handleOutlookCalendar = () => {
    window.open(getOutlookCalendarUrl(event), '_blank');
    onClose();
  };

  const handleYahooCalendar = () => {
    window.open(getYahooCalendarUrl(event), '_blank');
    onClose();
  };

  const handleDownloadICS = () => {
    downloadICSFile(event);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Add to Calendar</DialogTitle>
          <DialogContent>
            <Text style={{ display: 'block', marginBottom: '24px' }}>
              Choose where you'd like to save this event:
            </Text>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                appearance="outline"
                icon={<CalendarLtr20Regular />}
                onClick={handleGoogleCalendar}
                style={{ justifyContent: 'flex-start' }}
              >
                Google Calendar
              </Button>

              <Button
                appearance="outline"
                icon={<CalendarLtr20Regular />}
                onClick={handleOutlookCalendar}
                style={{ justifyContent: 'flex-start' }}
              >
                Outlook Calendar
              </Button>

              <Button
                appearance="outline"
                icon={<CalendarLtr20Regular />}
                onClick={handleYahooCalendar}
                style={{ justifyContent: 'flex-start' }}
              >
                Yahoo Calendar
              </Button>

              <Button
                appearance="outline"
                icon={<ArrowDownload20Regular />}
                onClick={handleDownloadICS}
                style={{ justifyContent: 'flex-start' }}
              >
                Download .ics file (Apple Calendar, Outlook Desktop, etc.)
              </Button>
            </div>

            <Text size={200} style={{ display: 'block', marginTop: '16px', color: '#666' }}>
              The .ics file works with Apple Calendar, Outlook Desktop, and most other calendar applications.
            </Text>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}