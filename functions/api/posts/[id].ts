interface Env {
  DB: D1Database;
}

// GET single post
export async function onRequestGet(context: { 
  params: { id: string }; 
  env: Env;
}) {
  try {
    const { id } = context.params;
    
    const post = await context.env.DB.prepare(
      `SELECT 
        p.*,
        COUNT(pt.id) as participant_count
      FROM posts p
      LEFT JOIN participants pt ON p.id = pt.post_id
      WHERE p.id = ?
      GROUP BY p.id`
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }

    // Get participants
    const { results: participants } = await context.env.DB.prepare(
      `SELECT user_id, user_name, joined_at, attended, checked_in_at
       FROM participants 
       WHERE post_id = ?
       ORDER BY joined_at ASC`
    ).bind(id).all();

    return new Response(JSON.stringify({ 
      post, 
      participants 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// DELETE post
export async function onRequestDelete(context: { 
  params: { id: string }; 
  env: Env;
  request: Request;
}) {
  try {
    const { id } = context.params;
    
    // Get user from session to verify they're the organizer
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

    // Get the post details
    const post = await context.env.DB.prepare(
      `SELECT user_id, title, description, location, start_datetime, end_datetime 
       FROM posts WHERE id = ?`
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

    // Verify the user is the organizer
    if (post.user_id !== session.user_id) {
      return new Response(JSON.stringify({ error: 'Only the organizer can delete this event' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // CRITICAL: Save event details for all participants who attended (attended = 1)
    // This preserves their attendance record even after the event is deleted
    await context.env.DB.prepare(
      `UPDATE participants 
       SET event_title = ?,
           event_description = ?,
           event_location = ?,
           event_start_datetime = ?,
           event_end_datetime = ?
       WHERE post_id = ? AND attended = 1`
    ).bind(
      post.title,
      post.description,
      post.location,
      post.start_datetime,
      post.end_datetime,
      id
    ).run();

    console.log('Event details saved for attended participants');
    
    // Now delete the post
    await context.env.DB.prepare(
      `DELETE FROM posts WHERE id = ?`
    ).bind(id).run();

    console.log('Post deleted');

    // Clean up participants who didn't attend (attended = 0)
    // These are people who only registered but never showed up
    // Their registration record is removed completely
    await context.env.DB.prepare(
      `DELETE FROM participants WHERE post_id = ? AND attended = 0`
    ).bind(id).run();

    console.log('Non-attended participants cleaned up');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500
    });
  }
}

// Handle CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}