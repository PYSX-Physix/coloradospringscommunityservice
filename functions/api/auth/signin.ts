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

    const passwordValid = await verifyPassword(password, user.password_hash as string);
    if (!passwordValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    await context.env.DB.prepare(
      "INSERT INTO session (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt, Date.now()).run();

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

/**
 * Verify a password against a stored PBKDF2 hash.
 * Falls back to legacy SHA-256 verification so existing accounts
 * (if any) are not immediately broken. On next login, encourage
 * a password reset to upgrade to PBKDF2.
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // New PBKDF2 format: "pbkdf2:<base64 salt>:<base64 hash>"
  if (storedHash.startsWith("pbkdf2:")) {
    const [, saltB64, hashB64] = storedHash.split(":");
    const encoder = new TextEncoder();

    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const expectedHash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const derivedHash = new Uint8Array(derivedBuffer);

    // Constant-time comparison to prevent timing attacks
    if (derivedHash.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < derivedHash.length; i++) {
      diff |= derivedHash[i] ^ expectedHash[i];
    }
    return diff === 0;
  }

  // Legacy SHA-256 fallback (for any accounts created before this update)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const legacyHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return legacyHash === storedHash;
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