interface Env {
  DB: D1Database;
}

// POST - Join event
export async function onRequestPost(context: { 
  params: { id: string }; 
  env: Env;
  request: Request;
}) {
  try {
    const { id } = context.params;
    
    console.log('Join event request for post:', id);
    
    // Check if post exists and has space
    const post = await context.env.DB.prepare(
      `SELECT max_participants, current_participants 
       FROM posts WHERE id = ?`
    ).bind(id).first();

    console.log('Post found:', post);

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 404
      });
    }

    if (post.current_participants >= post.max_participants) {
      return new Response(JSON.stringify({ error: 'Event is full' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400
      });
    }

    // Get user from session cookie
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 401
      });
    }

    // Get user from session
    const session = await context.env.DB.prepare(
      `SELECT s.user_id, u.name, u.email
       FROM sessions s
       JOIN user u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 401
      });
    }

    const userId = session.user_id as string;
    const userName = (session.name || session.email) as string;

    console.log('User joining:', userId, userName);

    // Check if already joined
    const existing = await context.env.DB.prepare(
      `SELECT id FROM participants WHERE post_id = ? AND user_id = ?`
    ).bind(id, userId).first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Already joined this event' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400
      });
    }

    // Add participant WITHOUT event details (they haven't attended yet)
    await context.env.DB.prepare(
      `INSERT INTO participants (post_id, user_id, user_name, attended) 
       VALUES (?, ?, ?, 0)`
    ).bind(id, userId, userName).run();

    console.log('Participant added');

    // Update participant count
    await context.env.DB.prepare(
      `UPDATE posts 
       SET current_participants = current_participants + 1 
       WHERE id = ?`
    ).bind(id).run();

    console.log('Participant count updated');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      status: 200
    });
  } catch (error: any) {
    console.error('Error joining event:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500
    });
  }
}

// DELETE - Leave event
export async function onRequestDelete(context: { 
  params: { id: string }; 
  env: Env;
  request: Request;
}) {
  try {
    const { id } = context.params;

    // Get user from session cookie
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 401
      });
    }

    // Get user from session
    const session = await context.env.DB.prepare(
      `SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 401
      });
    }

    const userId = session.user_id;

    await context.env.DB.prepare(
      `DELETE FROM participants 
       WHERE post_id = ? AND user_id = ?`
    ).bind(id, userId).run();

    // Update participant count
    await context.env.DB.prepare(
      `UPDATE posts 
       SET current_participants = current_participants - 1 
       WHERE id = ?`
    ).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      status: 200
    });
  } catch (error: any) {
    console.error('Error leaving event:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}