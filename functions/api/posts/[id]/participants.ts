interface Env {
  DB: D1Database;
}

// POST - Join event
export async function onRequestPost(context: { 
  params: { id: string }; 
  env: Env;
}) {
  try {
    const { id } = context.params;
    
    // Check if post exists and has space
    const post = await context.env.DB.prepare(
      `SELECT max_participants, current_participants 
       FROM posts WHERE id = ?`
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }

    if (post.current_participants >= post.max_participants) {
      return new Response(JSON.stringify({ error: 'Event is full' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Add participant
    await context.env.DB.prepare(
      `INSERT INTO participants (post_id, user_id, user_name) 
       VALUES (?, ?, ?)`
    ).bind(id, 'temp-user-id', 'Test User').run();

    // Update participant count
    await context.env.DB.prepare(
      `UPDATE posts 
       SET current_participants = current_participants + 1 
       WHERE id = ?`
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

// DELETE - Leave event
export async function onRequestDelete(context: { 
  params: { id: string }; 
  env: Env;
}) {
  try {
    const { id } = context.params;
    const userId = 'temp-user-id'; // Replace with actual user ID

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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}