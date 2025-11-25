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
      `SELECT user_id FROM session WHERE id = ? AND expires_at > ?`
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

    const { postId, category, details } = await context.request.json();

    if (!postId || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Insert report
    await context.env.DB.prepare(
      `INSERT INTO reports (post_id, user_id, category, details, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(postId, session.user_id, category, details || null, Date.now()).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error creating report:', error);
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