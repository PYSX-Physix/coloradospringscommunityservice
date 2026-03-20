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

    const { results: participants } = await context.env.DB.prepare(
      `SELECT user_id, user_name, joined_at, attended, checked_in_at
       FROM participants 
       WHERE post_id = ?
       ORDER BY joined_at ASC`
    ).bind(id).all();

    return new Response(JSON.stringify({ post, participants }), {
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

    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const session = await context.env.DB.prepare(
      `SELECT user_id FROM session WHERE id = ? AND expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const post = await context.env.DB.prepare(
      `SELECT user_id, title, location, start_datetime, user_name
       FROM posts WHERE id = ?`
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (post.user_id !== session.user_id) {
      return new Response(JSON.stringify({ error: 'Only the organizer can delete this event' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // -------------------------------------------------------------------------
    // Save the five fields that matter to each attended participant's permanent
    // record. attendance_history has no foreign key to posts so these rows
    // survive indefinitely after the post is deleted.
    //
    // INSERT OR IGNORE means re-running this (e.g. after a failed deploy) is
    // safe — existing history rows are never overwritten or duplicated.
    // -------------------------------------------------------------------------
    const { results: attended } = await context.env.DB.prepare(
      `SELECT user_id, checked_in_at FROM participants
       WHERE post_id = ? AND attended = 1`
    ).bind(id).all();

    for (const p of attended) {
      await context.env.DB.prepare(
        `INSERT OR IGNORE INTO attendance_history
           (user_id, event_title, event_organizer, event_location,
            event_start_datetime, checked_in_at, original_post_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        p.user_id,
        post.title,
        post.user_name,
        post.location,
        post.start_datetime,
        p.checked_in_at,
        id
      ).run();
    }

    // Delete all participants for this post explicitly before deleting the post.
    // This prevents ON DELETE CASCADE from firing — though after the loop above
    // the cascade would only hit unattended rows anyway.
    await context.env.DB.prepare(
      `DELETE FROM participants WHERE post_id = ?`
    ).bind(id).run();

    await context.env.DB.prepare(
      `DELETE FROM posts WHERE id = ?`
    ).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500
    });
  }
}

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