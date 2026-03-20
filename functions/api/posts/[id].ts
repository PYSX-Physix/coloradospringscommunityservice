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

    if (post.user_id !== session.user_id) {
      return new Response(JSON.stringify({ error: 'Only the organizer can delete this event' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // -------------------------------------------------------------------------
    // STEP 1: Snapshot event details into each attended participant row, then
    // set post_id = NULL to detach them from the foreign key before deletion.
    //
    // Without this, DELETE FROM posts triggers ON DELETE CASCADE which wipes
    // every participants row that still has post_id = this id — including the
    // attended ones whose snapshot we just wrote. Nulling post_id first breaks
    // that relationship so the cascade has nothing to touch on those rows,
    // preserving the attendance record permanently in the user's profile.
    // -------------------------------------------------------------------------
    await context.env.DB.prepare(
      `UPDATE participants 
       SET event_title          = ?,
           event_description    = ?,
           event_location       = ?,
           event_start_datetime = ?,
           event_end_datetime   = ?,
           post_id              = NULL
       WHERE post_id = ? AND attended = 1`
    ).bind(
      post.title,
      post.description,
      post.location,
      post.start_datetime,
      post.end_datetime,
      id
    ).run();

    // -------------------------------------------------------------------------
    // STEP 2: Remove participants who registered but never attended.
    // Their post_id still points at the post so the cascade would remove them
    // anyway, but doing it explicitly is clearer about intent.
    // -------------------------------------------------------------------------
    await context.env.DB.prepare(
      `DELETE FROM participants WHERE post_id = ? AND attended = 0`
    ).bind(id).run();

    // -------------------------------------------------------------------------
    // STEP 3: Delete the post. The cascade now only affects rows where
    // post_id = id — after steps 1 and 2 there should be none, so this is safe.
    // -------------------------------------------------------------------------
    await context.env.DB.prepare(
      `DELETE FROM posts WHERE id = ?`
    ).bind(id).run();

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