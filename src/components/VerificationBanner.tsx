import React from 'react';
import { MessageBar, MessageBarActions, MessageBarBody, Button } from '@fluentui/react-components';
import { MailRegular, DismissRegular } from '@fluentui/react-icons';

interface VerificationBannerProps {
  userEmail: string;
  isVerified: boolean;
}

export default function VerificationBanner({ userEmail, isVerified }: VerificationBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // Don't show banner if verified or dismissed
  if (isVerified || dismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    try {
      setResending(true);
      setMessage('');
      
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('Failed to send verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <MessageBar intent="warning">
        <MessageBarBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MailRegular />
            <span>
              <strong>Email verification required.</strong> Please verify your email ({userEmail}) to access all features.
              {message && (
                <span style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                  {message}
                </span>
              )}
            </span>
          </div>
        </MessageBarBody>
        <MessageBarActions
          containerAction={
            <Button
              appearance="transparent"
              icon={<DismissRegular />}
              onClick={() => setDismissed(true)}
            />
          }
        >
          <Button
            appearance="primary"
            size="small"
            onClick={handleResendEmail}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend Email'}
          </Button>
        </MessageBarActions>
      </MessageBar>
    </div>
  );
}