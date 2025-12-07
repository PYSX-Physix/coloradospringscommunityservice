import { createNotification } from '../../notifications/send';

interface Env {
  DB: D1Database;
}

// Mark participant as attended AND save event details to their history
export async function onRequestPost(context: { 
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

    const { participantUserId, attended } = await context.request.json();

    // Get the post to verify the current user is the organizer
    const post = await context.env.DB.prepare(
      `SELECT user_id, title, description, location, start_datetime, end_datetime 
       FROM posts WHERE id = ?`
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Only the event organizer can check people in
    if (post.user_id !== session.user_id) {
      return new Response(JSON.stringify({ error: 'Only event organizer can check in participants' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (attended) {
      // If marking as attended, save event details to their permanent history
      await context.env.DB.prepare(
        `UPDATE participants 
         SET attended = 1, 
             checked_in_at = ?,
             checked_in_by = ?,
             event_title = ?,
             event_description = ?,
             event_location = ?,
             event_start_datetime = ?,
             event_end_datetime = ?
         WHERE post_id = ? AND user_id = ?`
      ).bind(
        Date.now(), 
        session.user_id,
        post.title,
        post.description,
        post.location,
        post.start_datetime,
        post.end_datetime,
        id, 
        participantUserId
      ).run();

      await createNotification(
        context.env.DB,
        participantUserId,
        'checked_in',
        'You have been checked in',
        `You have been checked in for the event "${post.title}".`,
        `/post?id=${id}`
      );
    } else {
      // If unmarking attendance, remove event details from history
      await context.env.DB.prepare(
        `UPDATE participants 
         SET attended = 0, 
             checked_in_at = NULL,
             checked_in_by = NULL,
             event_title = NULL,
             event_description = NULL,
             event_location = NULL,
             event_start_datetime = NULL,
             event_end_datetime = NULL
         WHERE post_id = ? AND user_id = ?`
      ).bind(id, participantUserId).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error checking in participant:', error);
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