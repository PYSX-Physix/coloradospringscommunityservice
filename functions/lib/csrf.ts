interface SessionWithCSRF {
    csrf_token?: string | null;
    csrfToken?: string | null;
}

export function generateCSRFToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}

export async function attachCSRFToSession(db: D1Database, sessionId: string): Promise<string> {
    const csrfToken = generateCSRFToken();
    await db.prepare("UPDATE sessions SET csrf_token = ? WHERE id = ?").bind(csrfToken, sessionId).run();
    return csrfToken;
}

export async function validateCSRF(request: Request, session: SessionWithCSRF): Promise<Response | null> {
  const token = request.headers.get("X-CSRF-Token");
  const sessionToken = session.csrf_token ?? session.csrfToken ?? null;

  if (!token || !sessionToken || token !== sessionToken) {
    return new Response(JSON.stringify({ error: "Invalid CSRF token" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}