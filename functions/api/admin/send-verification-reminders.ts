// functions/api/admin/send-verification-reminders.ts
import { sendEmail, generateReminderEmail } from '../../../src/utils/emailService';

interface Env {
  DB: D1Database;
  ADMIN_API_KEY: string;
  RESEND_API_KEY?: string;
  SITE_URL: string;
}

/**
 * Admin endpoint to send verification reminders to unverified users
 * This should be called via a cron job daily
 * 
 * Rules:
 * - Send reminder at 7 days after signup if not verified
 * - Send final warning at 28 days
 * - Disable account at 30 days if still not verified
 */
export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    // Verify admin key
    const apiKey = context.request.headers.get('X-Admin-API-Key');
    if (apiKey !== context.env.ADMIN_API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const twentyEightDaysAgo = now - (28 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    let remindersSent = 0;
    let accountsDisabled = 0;

    // Find users who need reminders (7 days old, not verified, no recent reminder)
    const { results: usersNeedingFirstReminder } = await context.env.DB.prepare(
      `SELECT u.id, u.email, u.name, u.created_at
       FROM user u
       LEFT JOIN email_verification_tokens evt ON u.id = evt.user_id AND evt.created_at > ?
       WHERE u.email_verified = 0 
       AND u.created_at < ? 
       AND u.created_at > ?
       AND evt.id IS NULL
       GROUP BY u.id`
    ).bind(now - (24 * 60 * 60 * 1000), sevenDaysAgo, twentyEightDaysAgo).all();

    // Send first reminder (7 days)
    for (const user of usersNeedingFirstReminder) {
      const token = crypto.randomUUID();
      const tokenId = crypto.randomUUID();
      const expiresAt = now + (24 * 60 * 60 * 1000);

      await context.env.DB.prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(tokenId, user.id, token, expiresAt, now).run();

      const siteUrl = context.env.SITE_URL || 'http://localhost:8788';
      const verificationUrl = `${siteUrl}/auth/verify?token=${token}`;

      await sendEmail(context.env, {
        to: user.email as string,
        subject: 'Reminder: Verify Your Email - Colorado Springs CS Hub',
        html: generateReminderEmail(user.name as string || 'there', verificationUrl, 23)
      });

      // Create notification
      await context.env.DB.prepare(
        `INSERT INTO notifications (id, user_id, type, title, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(),
        user.id,
        'verification_reminder',
        'Email Verification Required',
        'Please verify your email to continue using all features.',
        now
      ).run();

      remindersSent++;
    }

    // Find users needing final warning (28 days old)
    const { results: usersNeedingFinalWarning } = await context.env.DB.prepare(
      `SELECT u.id, u.email, u.name, u.created_at
       FROM user u
       LEFT JOIN email_verification_tokens evt ON u.id = evt.user_id AND evt.created_at > ?
       WHERE u.email_verified = 0 
       AND u.created_at < ? 
       AND u.created_at > ?
       AND evt.id IS NULL
       GROUP BY u.id`
    ).bind(now - (24 * 60 * 60 * 1000), twentyEightDaysAgo, thirtyDaysAgo).all();

    // Send final warning (28 days - 2 days before disable)
    for (const user of usersNeedingFinalWarning) {
      const token = crypto.randomUUID();
      const tokenId = crypto.randomUUID();
      const expiresAt = now + (48 * 60 * 60 * 1000); // 48 hours

      await context.env.DB.prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(tokenId, user.id, token, expiresAt, now).run();

      const siteUrl = context.env.SITE_URL || 'http://localhost:8788';
      const verificationUrl = `${siteUrl}/auth/verify?token=${token}`;

      await sendEmail(context.env, {
        to: user.email as string,
        subject: 'URGENT: Verify Your Email or Account Will Be Disabled',
        html: generateReminderEmail(user.name as string || 'there', verificationUrl, 2)
      });

      // Create urgent notification
      await context.env.DB.prepare(
        `INSERT INTO notifications (id, user_id, type, title, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(),
        user.id,
        'verification_urgent',
        '⚠️ Account Will Be Disabled Soon',
        'Your account will be disabled in 2 days if you do not verify your email.',
        now
      ).run();

      remindersSent++;
    }

    // Disable accounts that are 30+ days old and unverified
    const { results: accountsToDisable } = await context.env.DB.prepare(
      `SELECT id, email, name FROM user 
       WHERE email_verified = 0 AND created_at < ?`
    ).bind(thirtyDaysAgo).all();

    for (const user of accountsToDisable) {
      // Delete the user account (cascade will handle related data)
      await context.env.DB.prepare(
        `DELETE FROM user WHERE id = ?`
      ).bind(user.id).run();

      accountsDisabled++;
    }

    return new Response(JSON.stringify({ 
      success: true,
      remindersSent,
      accountsDisabled,
      message: `Sent ${remindersSent} reminders and disabled ${accountsDisabled} accounts`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Reminder sending error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}