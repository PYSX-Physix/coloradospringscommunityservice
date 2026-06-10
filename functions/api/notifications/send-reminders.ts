interface Env {
  DB: D1Database;
  ADMIN_API_KEY: string;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    // Verify admin key
    const apiKey = context.request.headers.get('X-Admin-API-Key');
    if (apiKey !== context.env.ADMIN_API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get events happening in the next 24 hours
    const tomorrow = Date.now() + (24 * 60 * 60 * 1000);
    const { results: upcomingEvents } = await context.env.DB.prepare(
      `SELECT id, title, start_datetime, user_id
       FROM posts
       WHERE start_datetime > ? AND start_datetime < ?
       AND visible = 1`
    ).bind(new Date().toISOString(), new Date(tomorrow).toISOString()).all();

    let notificationsSent = 0;

    for (const event of upcomingEvents) {
      // Get all participants for this event
      const { results: participants } = await context.env.DB.prepare(
        `SELECT user_id FROM participants WHERE post_id = ?`
      ).bind(event.id).all();

      for (const participant of participants) {
        const notificationId = crypto.randomUUID();
        await context.env.DB.prepare(
          `INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          notificationId,
          participant.user_id,
          'event_reminder',
          'Event Reminder',
          `Your event "${event.title}" is happening soon!`,
          `/post?id=${event.id}`,
          Date.now()
        ).run();
        
        notificationsSent++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      notificationsSent,
      eventsProcessed: upcomingEvents.length
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error)
    {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    else console.error("Unknown Error: ", error);
  }
}