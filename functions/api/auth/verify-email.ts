// functions/api/auth/verify-email.ts
import { sendEmail, generateVerificationEmail } from '../../../src/utils/emailService';

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  SITE_URL: string;
}

// GET - Verify email with token
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
    const url = new URL(context.request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Verification token required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Find token in database
    const tokenRecord = await context.env.DB.prepare(
      `SELECT * FROM email_verification_tokens 
       WHERE token = ? AND used_at IS NULL AND expires_at > ?`
    ).bind(token, Date.now()).first();

    if (!tokenRecord) {
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired verification token',
        expired: true 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const userId = tokenRecord.user_id as string;

    // Mark user as verified
    await context.env.DB.prepare(
      `UPDATE user SET email_verified = 1 WHERE id = ?`
    ).bind(userId).run();

    // Mark token as used
    await context.env.DB.prepare(
      `UPDATE email_verification_tokens SET used_at = ? WHERE id = ?`
    ).bind(Date.now(), tokenRecord.id).run();

    // Create notification for user
    const notificationId = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      notificationId,
      userId,
      'email_verified',
      'Email Verified!',
      'Your email has been successfully verified. You now have full access to all features.',
      null,
      Date.now()
    ).run();

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email verified successfully!' 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// POST - Resend verification email
export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get user from session
    const session = await context.env.DB.prepare(
      `SELECT s.user_id, u.email, u.name, u.email_verified
       FROM session s
       JOIN user u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (session.email_verified) {
      return new Response(JSON.stringify({ 
        error: 'Email already verified' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Rate limiting: Check if email was sent recently (5 minutes)
    const recentlySent = await context.env.DB.prepare(
      `SELECT created_at FROM email_verification_tokens 
       WHERE user_id = ? AND created_at > ?
       ORDER BY created_at DESC LIMIT 1`
    ).bind(session.user_id, Date.now() - (5 * 60 * 1000)).first();

    if (recentlySent) {
      return new Response(JSON.stringify({ 
        error: 'Verification email already sent. Please wait 5 minutes before requesting another.' 
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Generate new token
    const token = crypto.randomUUID();
    const tokenId = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    await context.env.DB.prepare(
      `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(tokenId, session.user_id, token, expiresAt, Date.now()).run();

    // Send verification email
    const siteUrl = context.env.SITE_URL || 'http://localhost:8788';
    const verificationUrl = `${siteUrl}/auth/verify?token=${token}`;
    
    const emailSent = await sendEmail(context.env, {
      to: session.email as string,
      subject: 'Verify Your Email - Colorado Springs CS Hub',
      html: generateVerificationEmail(session.name as string || 'there', verificationUrl)
    });

    if (!emailSent) {
      return new Response(JSON.stringify({ 
        error: 'Failed to send verification email' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Verification email sent!' 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}