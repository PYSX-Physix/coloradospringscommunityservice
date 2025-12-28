// functions/api/auth/signup.ts
import { sendEmail, generateVerificationEmail } from '../../../src/utils/emailService';

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  SITE_URL: string;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    const { email, password, name } = await context.request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(JSON.stringify({ 
        error: "Password must be at least 8 characters long" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Check if user exists
    const existing = await context.env.DB.prepare(
      "SELECT id, email_verified FROM user WHERE email = ?"
    ).bind(email).first();

    if (existing) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const now = Date.now();

    // Create user (email_verified defaults to 0)
    await context.env.DB.prepare(
      `INSERT INTO user (id, email, password_hash, name, email_verified, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 0, ?, ?)`
    ).bind(userId, email, passwordHash, name || null, now, now).run();

    // Generate verification token
    const token = crypto.randomUUID();
    const tokenId = crypto.randomUUID();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

    await context.env.DB.prepare(
      `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(tokenId, userId, token, expiresAt, now).run();

    // Send verification email
    const siteUrl = context.env.SITE_URL || 'http://localhost:8788';
    const verificationUrl = `${siteUrl}/auth/verify?token=${token}`;
    
    const emailSent = await sendEmail(context.env, {
      to: email,
      subject: 'Verify Your Email - Colorado Springs CS Hub',
      html: generateVerificationEmail(name || 'there', verificationUrl)
    });

    // Create welcome notification
    const notificationId = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      notificationId,
      userId,
      'welcome',
      'Welcome to Colorado Springs CS Hub!',
      'Please verify your email to access all features. Check your inbox for the verification link.',
      null,
      now
    ).run();

    return new Response(JSON.stringify({ 
      success: true,
      user: { id: userId, email, name },
      message: emailSent 
        ? 'Account created! Please check your email to verify your account.'
        : 'Account created! Email verification is required but could not be sent. Please contact support.'
    }), {
      status: 201,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      },
    });
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}