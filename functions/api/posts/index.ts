interface Env {
  DB: D1Database;
}

interface Post {
  title: string;
  desc: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  participants: string;
}

// GET all posts
export async function onRequestGet(context: { env: Env }) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT 
        id, 
        title, 
        description, 
        location,
        start_date,
        start_time,
        end_date,
        end_time,
        max_participants,
        current_participants,
        user_name,
        visible,
        created_at
      FROM posts 
      WHERE visible = 1
      ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({ posts: results }), {
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

// POST new post
export async function onRequestPost(context: { 
  request: Request; 
  env: Env;
}) {
  try {
    const body = await context.request.json() as Post;
    
    // Validate required fields
    if (!body.title || !body.desc || !body.location || !body.startDate || 
        !body.startTime || !body.endDate || !body.endTime || !body.participants) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Insert post
    const result = await context.env.DB.prepare(
      `INSERT INTO posts 
        (title, description, location, start_date, start_time, end_date, end_time, max_participants, user_id, user_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.title,
      body.desc,
      body.location,
      body.startDate,
      body.startTime,
      body.endDate,
      body.endTime,
      parseInt(body.participants),
      'temp-user-id', // Replace with actual user ID from auth
      'Test User' // Replace with actual user name from auth
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