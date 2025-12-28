// functions/utils/emailService.ts
interface Env {
  RESEND_API_KEY?: string;
  SITE_URL: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend API (free tier: 3,000 emails/month)
 * Alternative: Use SendGrid, Mailgun, or AWS SES
 */
export async function sendEmail(env: Env, data: EmailData): Promise<boolean> {
  // If no API key configured, log to console (development mode)
  if (!env.RESEND_API_KEY) {
    console.log('Email would be sent:', {
      to: data.to,
      subject: data.subject,
      preview: data.html.substring(0, 100)
    });
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Colorado Springs CS Hub <noreply@yourdomain.com>',
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email sending failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

/**
 * Generate verification email HTML
 */
export function generateVerificationEmail(
  userName: string,
  verificationUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0078d4;
      margin-bottom: 10px;
    }
    h1 {
      color: #0078d4;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #0078d4;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #106ebe;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .warning {
      background: #fff4ce;
      border: 1px solid #ffd60a;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🤝 Colorado Springs CS Hub</div>
    </div>
    
    <h1>Verify Your Email Address</h1>
    
    <p>Hi ${userName || 'there'},</p>
    
    <p>Thank you for signing up for Colorado Springs Community Service Hub! To complete your registration and start creating or joining community service events, please verify your email address.</p>
    
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p><code>${verificationUrl}</code></p>
    
    <div class="warning">
      <strong>⏱️ This link will expire in 24 hours.</strong><br>
      If you didn't create an account with us, you can safely ignore this email.
    </div>
    
    <p>After verification, you'll be able to:</p>
    <ul>
      <li>Create community service events</li>
      <li>Register for events</li>
      <li>Track your volunteer hours</li>
      <li>Connect with other community members</li>
    </ul>
    
    <div class="footer">
      <p>This email was sent by Colorado Springs Community Service Hub</p>
      <p>If you have questions, please visit our Help page or contact support.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate reminder email for unverified accounts
 */
export function generateReminderEmail(
  userName: string,
  verificationUrl: string,
  daysUntilDisabled: number
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0078d4;
      margin-bottom: 10px;
    }
    h1 {
      color: #d13438;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #d13438;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .alert {
      background: #fff4ce;
      border: 1px solid #ffd60a;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🤝 Colorado Springs CS Hub</div>
    </div>
    
    <h1>⚠️ Verify Your Email to Keep Your Account</h1>
    
    <p>Hi ${userName || 'there'},</p>
    
    <div class="alert">
      Your account will be disabled in ${daysUntilDisabled} day${daysUntilDisabled !== 1 ? 's' : ''} if you don't verify your email address.
    </div>
    
    <p>We noticed you haven't verified your email address yet. To continue using Colorado Springs Community Service Hub and access all features, please verify your email now.</p>
    
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Now</a>
    </div>
    
    <p><strong>Why verify?</strong></p>
    <ul>
      <li>Ensures you receive important event notifications</li>
      <li>Protects your account from unauthorized access</li>
      <li>Helps us prevent spam and fake accounts</li>
      <li>Allows you to reset your password if needed</li>
    </ul>
    
    <p>If you didn't create this account, you can safely ignore this email.</p>
    
    <div class="footer">
      <p>This is an automated reminder from Colorado Springs Community Service Hub</p>
    </div>
  </div>
</body>
</html>
  `;
}