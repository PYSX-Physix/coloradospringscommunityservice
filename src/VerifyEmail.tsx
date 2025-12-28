import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Title1, Text, Button, Spinner, Card
} from '@fluentui/react-components';
import {
  CheckmarkCircle48Color,
  DismissCircle48Color,
  MailRegular
} from '@fluentui/react-icons';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = React.useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');
      } else {
        if (data.expired) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: '#242424'
      }}
    >
      <Card
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '48px',
          textAlign: 'center'
        }}
      >
        {status === 'loading' && (
          <>
            <Spinner size="extra-large" style={{ marginBottom: '24px' }} />
            <Title1 style={{ marginBottom: '16px' }}>Verifying your email...</Title1>
            <Text>Please wait while we verify your email address.</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckmarkCircle48Color style={{ marginBottom: '24px' }} />
            <Title1 style={{ marginBottom: '16px', color: '#107c10' }}>
              Email Verified!
            </Title1>
            <Text style={{ display: 'block', marginBottom: '32px' }}>
              {message}
            </Text>
            <Text style={{ display: 'block', marginBottom: '24px' }}>
              You can now access all features of Colorado Springs Community Service Hub.
            </Text>
            <Button
              appearance="primary"
              size="large"
              onClick={() => navigate('/')}
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <DismissCircle48Color style={{ marginBottom: '24px' }} />
            <Title1 style={{ marginBottom: '16px', color: '#d13438' }}>
              Verification Failed
            </Title1>
            <Text style={{ display: 'block', marginBottom: '32px' }}>
              {message}
            </Text>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button
                appearance="primary"
                onClick={() => navigate('/auth')}
              >
                Back to Sign In
              </Button>
            </div>
          </>
        )}

        {status === 'expired' && (
          <>
            <MailRegular fontSize={48} style={{ marginBottom: '24px', color: '#ffd60a' }} />
            <Title1 style={{ marginBottom: '16px', color: '#ffd60a' }}>
              Link Expired
            </Title1>
            <Text style={{ display: 'block', marginBottom: '32px' }}>
              {message}
            </Text>
            <Text style={{ display: 'block', marginBottom: '24px' }}>
              Sign in to your account and request a new verification email.
            </Text>
            <Button
              appearance="primary"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}