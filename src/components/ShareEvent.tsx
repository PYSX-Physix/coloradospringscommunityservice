import { Dialog, DialogContent, DialogBody, DialogTitle, Button, Text, DialogSurface, Input } from "@fluentui/react-components";
import { Copy20Regular } from "@fluentui/react-icons";

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
        <DialogSurface>
            <DialogContent>
                <DialogTitle>Share Event</DialogTitle>
                <DialogBody>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <Text weight="semibold" block style={{ marginBottom: '8px' }}>Event Link</Text>
                        <Input type="text" defaultValue={eventUrl} readOnly contentAfter={ <Button onClick={handleCopyLink} icon={<Copy20Regular/>} appearance="transparent"/> }/>
                        <Button appearance="secondary" onClick={onClose}>Close</Button>
                    </div>
                </DialogBody>
            </DialogContent>
        </DialogSurface>
    </Dialog>
  );
}