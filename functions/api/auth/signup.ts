interface Env {
  DB: D1Database;
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

    // Check if user exists
    const existing = await context.env.DB.prepare(
      "SELECT id FROM user WHERE email = ?"
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

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const now = Date.now();

    await context.env.DB.prepare(
      "INSERT INTO user (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(userId, email, passwordHash, name || null, now, now).run();

    return new Response(JSON.stringify({
      success: true,
      user: { id: userId, email, name }
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

/**
 * Hash a password using PBKDF2 via the Web Crypto API.
 * PBKDF2 is intentionally slow (100,000 iterations) making brute-force
 * attacks expensive. SHA-256 is NOT suitable for password hashing because
 * it is fast — that's a vulnerability, not a feature.
 *
 * Output format: "pbkdf2:<base64 salt>:<base64 hash>"
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();

  // Generate a random 16-byte salt unique to this password
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Import the raw password as a key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Derive 256 bits using 100,000 iterations of SHA-256
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return `pbkdf2:${saltB64}:${hashB64}`;
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