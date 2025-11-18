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
    
    console.log('Received POST request:', body);
    
    // Check each field individually
    const missingFields = [];
    if (!body.title) missingFields.push('title');
    if (!body.desc) missingFields.push('desc');
    if (!body.location) missingFields.push('location');
    if (!body.startDateTime) missingFields.push('startDateTime');
    if (!body.endDateTime) missingFields.push('endDateTime');
    if (!body.participants) missingFields.push('participants');
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        missingFields: missingFields,
        receivedData: body
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Validate datetime format
    const startDate = new Date(body.startDateTime);
    const endDate = new Date(body.endDateTime);
    
    if (isNaN(startDate.getTime())) {
      console.error('Invalid start datetime:', body.startDateTime);
      return new Response(JSON.stringify({ 
        error: 'Invalid start datetime format',
        received: body.startDateTime
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    if (isNaN(endDate.getTime())) {
      console.error('Invalid end datetime:', body.endDateTime);
      return new Response(JSON.stringify({ 
        error: 'Invalid end datetime format',
        received: body.endDateTime
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (endDate <= startDate) {
      console.error('End time before start time');
      return new Response(JSON.stringify({ 
        error: 'End time must be after start time',
        start: body.startDateTime,
        end: body.endDateTime
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('Inserting into database...');

    // Insert post with combined datetime
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
      error: error.message,
      stack: error.stack
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}