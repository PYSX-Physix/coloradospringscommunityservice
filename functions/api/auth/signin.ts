interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    const { email, password } = await context.request.json();

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

    // Get user
    const user = await context.env.DB.prepare(
      "SELECT id, email, name, password_hash FROM user WHERE email = ?"
    ).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    await context.env.DB.prepare(
      "INSERT INTO session (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt, Date.now()).run();

    // Set session cookie
    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Set-Cookie": `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
    });

    return new Response(JSON.stringify({ 
      success: true,
      session: { id: sessionId },
      user: { id: user.id, email: user.email, name: user.name }
    }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Signin error:", error);
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