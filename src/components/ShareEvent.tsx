import React from "react";
import { Dialog, DialogContent, DialogBody, DialogSurface, DialogTitle, Text, Input, Tooltip, Button } from "@fluentui/react-components";
import { Checkmark20Regular, Copy20Regular } from "@fluentui/react-icons"
interface ShareEventProps
{
    open: boolean;
    onClose: () => void;
    event:
    {
        id: number;
        title: string;
        description: string;
        location: string;
        start_time: string;
        image_url?: string;
    }
}

export default function ShareEvent({open, onClose, event}: ShareEventProps)
{
    const [copied, setCopied] = React.useState(false);

    // Create a shareable url
    const shareUrl = `${window.location.origin}/post?id=${event.id}`;

    // Format the date for sharing
    /*
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };
    */
    // The text displayed when presenting the community service
    // const shareMessage = `Hey! I found this community service event you might want to do: ${event.title} | ${formatDate(event.start_time)} at ${event.location}`;
    
    // This function will handle copying the link
    const handleCopyLink = async () =>
    {
        try
        {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

        } catch (err)
        {
            console.error('Failed to Copy: ', err);
        }
    }   
    /*
    const facebookShare = () =>
    {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank', 'width=600, height=400');
    }        

    const twitterShare = () =>
    {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank', 'width=600, height=400');
    }

    const linkedInShare = () =>
    {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600, height=400');
    }

    const emailShare = () =>
    {
        const subject = encodeURIComponent(`Community Service Opportunity: ${event.title}`);
        const body = encodeURIComponent(
            `I found this community service event that you might want to do:` +
            `${event.title}\n` +
            `${formatDate(event.start_time)}\n` +
            `${event.location}\n\n` +
            `${event.description}\n\n` +
            `Learn more and sign up: ${shareUrl}`
        );

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
    
    const nativeShare = async () =>
    {
       if (navigator.share) {
            try {
                await navigator.share({
                title: event.title,
                text: shareMessage,
                url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }

    }
    */
    // Main HTML
    return
    {
        <div>
            <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Share Event</DialogTitle>
                        <DialogContent>
                            <Text>Share Link</Text>
                            <Input readOnly value={shareUrl}
                            contentAfter={
                                <Tooltip content={copied ? "Copied" : "Copy Link"} relationship="label">
                                    <Button appearance="transparent" icon={copied ? <Checkmark20Regular/> : <Copy20Regular/>} onClick={handleCopyLink}/>
                                </Tooltip>
                            }/>
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    }
}