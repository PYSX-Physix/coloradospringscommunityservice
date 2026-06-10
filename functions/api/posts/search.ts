interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
    const url = new URL(context.request.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim() === '') {
      return new Response(JSON.stringify({ posts: [] }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // Search in title, description, and location
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const { results } = await context.env.DB.prepare(
      `SELECT 
        id, 
        title, 
        description, 
        location,
        start_datetime,
        end_datetime,
        max_participants,
        current_participants,
        user_name,
        created_at,
        image_url
      FROM posts 
      WHERE visible = 1
        AND (
          LOWER(title) LIKE ? 
          OR LOWER(description) LIKE ? 
          OR LOWER(location) LIKE ?
          OR LOWER(user_name) LIKE ?
        )
      ORDER BY start_datetime ASC
      LIMIT 50`
    ).bind(searchTerm, searchTerm, searchTerm, searchTerm).all();

    return new Response(JSON.stringify({ posts: results }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof Error)
    {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}