interface Env {
  DB: D1Database;
}

interface Post {
  title: string;
  desc: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  participants: string;
}

// POST new post
export async function onRequestPost(context: { 
  request: Request; 
  env: Env;
}) {
  try {
    const body = await context.request.json() as Post;
    
    // Validate required fields
    if (!body.title || !body.desc || !body.location || 
        !body.startDateTime || !body.endDateTime || !body.participants) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Insert post
    const result = await context.env.DB.prepare(
      `INSERT INTO posts 
        (title, description, location, start_datetime, end_datetime, max_participants, user_id, user_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.title,
      body.desc,
      body.location,
      body.startDateTime,
      body.endDateTime,
      parseInt(body.participants),
      'temp-user-id',
      'Test User'
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      id: result.meta.last_row_id 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 201
    });
  } catch (error: any) {
    console.error('Error in POST /api/posts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// GET all posts
export async function onRequestGet(context: { env: Env }) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM posts WHERE visible = 1 ORDER BY start_datetime ASC`
    ).all();

    return new Response(JSON.stringify({ posts: results }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200
    });
  } catch (error: any) {
    console.error('Error in GET /api/posts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}