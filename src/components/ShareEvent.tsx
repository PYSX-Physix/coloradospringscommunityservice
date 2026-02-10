import { Dialog, DialogContent, DialogBody, DialogTitle, Button, Text } from "@fluentui/react-components";

interface ShareEventEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  image_url?: string;
}

interface ShareEventProps {
  open: boolean;
  onClose: () => void;
  event: ShareEventEvent;
}

export default function ShareEvent({ open, onClose, event }: ShareEventProps) {
  const eventUrl = `${window.location.origin}?id=${event.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    alert('Event link copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogContent>
        <DialogTitle>Share Event</DialogTitle>
        <DialogBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Text weight="semibold" block style={{ marginBottom: '8px' }}>Event Link</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={eventUrl} 
                  readOnly 
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <Button onClick={handleCopyLink}>Copy</Button>
              </div>
            </div>
            <Button appearance="secondary" onClick={onClose}>Close</Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}