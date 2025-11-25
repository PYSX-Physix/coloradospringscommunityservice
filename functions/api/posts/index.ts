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
  userId: string;
  userName: string;
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
        start_datetime,
        end_datetime,
        max_participants,
        current_participants,
        user_name,
        visible,
        created_at
      FROM posts 
      WHERE visible = 1
      ORDER BY start_datetime ASC`
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

// POST new post
export async function onRequestPost(context: { 
  request: Request; 
  env: Env;
}) {
  try {
    const body = await context.request.json() as Post;
    
    console.log('Received POST request:', body);
    
    // Validate required fields
    const missingFields = [];
    if (!body.title) missingFields.push('title');
    if (!body.desc) missingFields.push('desc');
    if (!body.location) missingFields.push('location');
    if (!body.startDateTime) missingFields.push('startDateTime');
    if (!body.endDateTime) missingFields.push('endDateTime');
    if (!body.participants) missingFields.push('participants');
    if (!body.userId) missingFields.push('userId');
    if (!body.userName) missingFields.push('userName');
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        missingFields
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Validate datetime format
    const startDate = new Date(body.startDateTime);
    const endDate = new Date(body.endDateTime);
    
    if (isNaN(startDate.getTime())) {
      return new Response(JSON.stringify({ 
        error: 'Invalid start datetime format'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    if (isNaN(endDate.getTime())) {
      return new Response(JSON.stringify({ 
        error: 'Invalid end datetime format'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (endDate <= startDate) {
      return new Response(JSON.stringify({ 
        error: 'End time must be after start time'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('Inserting into database...');

    // Insert with real user data
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
      body.userId,
      body.userName
    ).run();

    console.log('Insert successful:', result.meta);

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
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
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