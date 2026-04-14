import { validateCSRF } from "../../../lib/csrf";

interface Env {
  DB: D1Database;
}

// PATCH - Update post
export async function onRequestPatch(context: { 
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
      `SELECT user_id, csrf_token FROM sessions WHERE id = ? AND expires_at > ?`
    ).bind(sessionId, Date.now()).first<{user_id: string; csrf_token: string}>();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const csrfError = await validateCSRF(context.request, session);
    if (csrfError) return csrfError;

    // Get the post to verify ownership
    const post = await context.env.DB.prepare(
      `SELECT user_id FROM posts WHERE id = ?`
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
      return new Response(JSON.stringify({ error: 'Only the organizer can edit this event' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get update data
    const { 
      title, 
      description, 
      location, 
      startDateTime, 
      endDateTime, 
      maxParticipants,
      imageUrl 
    } = await context.request.json();

    // Validate required fields
    if (!title || !description || !location || !startDateTime || !endDateTime || !maxParticipants) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate datetime
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid datetime format' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (endDate <= startDate) {
      return new Response(JSON.stringify({ error: 'End time must be after start time' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Update the post
    await context.env.DB.prepare(
      `UPDATE posts 
       SET title = ?,
           description = ?,
           location = ?,
           start_datetime = ?,
           end_datetime = ?,
           max_participants = ?,
           image_url = ?,
           updated_at = ?
       WHERE id = ?`
    ).bind(
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      parseInt(maxParticipants),
      imageUrl || null,
      Date.now(),
      id
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      status: 200
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}