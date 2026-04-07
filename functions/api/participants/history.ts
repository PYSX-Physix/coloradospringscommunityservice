interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
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

    // Two sources, same five columns surfaced to the UI:
    //   event_title, event_organizer, event_location, event_start_datetime, checked_in_at
    //
    // Source 1 — participants: events the user attended where the post still exists.
    //   Reads organizer name and location from the live posts table via JOIN.
    //
    // Source 2 — attendance_history: events where the post has been deleted.
    //   All five fields were written here at deletion time, no JOIN needed.

    const { results } = await context.env.DB.prepare(
      `SELECT
        p.title              AS event_title,
        p.user_name          AS event_organizer,
        p.location           AS event_location,
        p.start_datetime     AS event_start_datetime,
        p.end_datetime       AS event_end_datetime,
        pt.checked_in_at
      FROM participants pt
      JOIN posts p ON pt.post_id = p.id
      WHERE pt.user_id = ? AND pt.attended = 1

      UNION ALL

      SELECT
        event_title,
        event_organizer,
        event_location,
        event_start_datetime,
        event_end_datetime,
        checked_in_at
      FROM attendance_history
      WHERE user_id = ?

      ORDER BY checked_in_at DESC`
    ).bind(session.user_id, session.user_id).all();

    return new Response(JSON.stringify({ history: results }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error fetching event history:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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