interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    // Get user from session
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

    const session = await context.env.DB.prepare(
      `SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?`
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

    const { postId } = await context.request.json();

    if (!postId) {
      return new Response(JSON.stringify({ error: 'Missing post ID' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const userId = session.user_id as string;

    // Check if already saved
    const existing = await context.env.DB.prepare(
      `SELECT id FROM saved_posts WHERE post_id = ? AND user_id = ?`
    ).bind(postId, userId).first();

    if (existing) {
      // Unsave
      await context.env.DB.prepare(
        `DELETE FROM saved_posts WHERE post_id = ? AND user_id = ?`
      ).bind(postId, userId).run();

      return new Response(JSON.stringify({ 
        success: true,
        saved: false 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    } else {
      // Save
      await context.env.DB.prepare(
        `INSERT INTO saved_posts (post_id, user_id, saved_at)
         VALUES (?, ?, ?)`
      ).bind(postId, userId, Date.now()).run();

      return new Response(JSON.stringify({ 
        success: true,
        saved: true 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }
  } catch (error: any) {
    console.error('Error toggling saved post:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}