interface Env {
  DB: D1Database;
}

// PATCH /api/auth/settings — update name, email, and/or password
export async function onRequestPatch(context: {
  request: Request;
  env: Env;
}) {
  try {
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await context.env.DB.prepare(
      `SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: "Session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user_id as string;
    const { name, email, currentPassword, newPassword } = await context.request.json();

    // If changing email, verify it isn't already taken
    if (email) {
      const existing = await context.env.DB.prepare(
        `SELECT id FROM user WHERE email = ? AND id != ?`
      ).bind(email, userId).first();

      if (existing) {
        return new Response(JSON.stringify({ error: "Email already in use" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // If changing password, verify the current password first
    if (newPassword) {
      if (!currentPassword) {
        return new Response(JSON.stringify({ error: "Current password is required to set a new password" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const user = await context.env.DB.prepare(
        `SELECT password_hash FROM user WHERE id = ?`
      ).bind(userId).first();

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const valid = await verifyPassword(currentPassword, user.password_hash as string);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Current password is incorrect" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (newPassword.length < 6) {
        return new Response(JSON.stringify({ error: "New password must be at least 6 characters" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const newHash = await hashPassword(newPassword);
      await context.env.DB.prepare(
        `UPDATE user SET password_hash = ?, updated_at = ? WHERE id = ?`
      ).bind(newHash, Date.now(), userId).run();
    }

    // Update name and/or email
    if (name !== undefined || email !== undefined) {
      const current = await context.env.DB.prepare(
        `SELECT name, email FROM user WHERE id = ?`
      ).bind(userId).first();

      await context.env.DB.prepare(
        `UPDATE user SET name = ?, email = ?, updated_at = ? WHERE id = ?`
      ).bind(
        name !== undefined ? name : current?.name,
        email !== undefined ? email : current?.email,
        Date.now(),
        userId
      ).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    if (error instanceof Error)
    {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    else console.error("Unknown error: ", error);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cookie",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return `pbkdf2:${saltB64}:${hashB64}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("pbkdf2:")) {
    const [, saltB64, hashB64] = storedHash.split(":");
    const encoder = new TextEncoder();
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const expectedHash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));
    const keyMaterial = await crypto.subtle.importKey(
      "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
    );
    const derivedBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
      keyMaterial, 256
    );
    const derivedHash = new Uint8Array(derivedBuffer);
    if (derivedHash.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < derivedHash.length; i++) diff |= derivedHash[i] ^ expectedHash[i];
    return diff === 0;
  }
  // Legacy SHA-256 fallback
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  const legacyHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0")).join("");
  return legacyHash === storedHash;
}