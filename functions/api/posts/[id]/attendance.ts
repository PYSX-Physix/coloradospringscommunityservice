interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { 
  params: { id: string }; 
  env: Env;
  request: Request;
}) {
  try {
    const { id } = context.params;
    
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

    // Get post details
    const post = await context.env.DB.prepare(
      `SELECT 
        id, title, description, location,
        start_datetime, end_datetime, user_id, user_name
       FROM posts 
       WHERE id = ?`
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Verify the current user is the organizer
    if (post.user_id !== session.user_id) {
      return new Response(JSON.stringify({ error: 'Only event organizer can download attendance' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get all participants with attendance status
    const { results: participants } = await context.env.DB.prepare(
      `SELECT 
        user_id,
        user_name,
        joined_at,
        attended,
        checked_in_at
       FROM participants 
       WHERE post_id = ?
       ORDER BY user_name ASC`
    ).bind(id).all();

    return new Response(JSON.stringify({ 
      event: post,
      participants 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error fetching attendance data:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}