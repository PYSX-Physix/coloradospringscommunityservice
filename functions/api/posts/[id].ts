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
    // Update the participants query to include attendance info
    const { results: participants } = await context.env.DB.prepare(
      `SELECT 
        user_id, 
        user_name, 
        joined_at,
        attended,
        checked_in_at
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
}) {
  try {
    const { id } = context.params;
    
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}