interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
    // Get session from cookie
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ session: null }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    // Get session and user
    const result = await context.env.DB.prepare(
      `SELECT s.id, s.expires_at, u.id as user_id, u.email, u.name, u.isAdmin
       FROM session s
       JOIN user u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!result) {
      return new Response(JSON.stringify({ session: null }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true"
        },
      });
    }

    return new Response(JSON.stringify({ 
      session: {
        id: result.id,
        user: {
          id: result.user_id,
          email: result.email,
          name: result.name,
          isAdmin: result.isAdmin
        }
      }
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      },
    });
  } catch (error: any) {
    console.error("Session check error:", error);
    return new Response(JSON.stringify({ session: null }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cookie",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}