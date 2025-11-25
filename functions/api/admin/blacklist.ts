interface Env {
  DB: D1Database;
  ADMIN_API_KEY: string;
}

// Add custom words to blacklist
export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    const apiKey = context.request.headers.get('X-Admin-API-Key');
    if (apiKey !== context.env.ADMIN_API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { words } = await context.request.json();

    if (!words || !Array.isArray(words)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request. Provide an array of words.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Store in database for persistence
    for (const word of words) {
      await context.env.DB.prepare(
        `INSERT OR IGNORE INTO blacklisted_words (word, added_at) VALUES (?, ?)`
      ).bind(word.toLowerCase(), Date.now()).run();
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Added ${words.length} words to blacklist` 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Get blacklisted words
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
    const apiKey = context.request.headers.get('X-Admin-API-Key');
    if (apiKey !== context.env.ADMIN_API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results } = await context.env.DB.prepare(
      `SELECT word FROM blacklisted_words ORDER BY word ASC`
    ).all();

    return new Response(JSON.stringify({ 
      words: results.map((r: any) => r.word)
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}