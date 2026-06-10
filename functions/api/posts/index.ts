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
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Simple server-side profanity / spam filter
// The client-side filter in src/lib/contentFilter.ts is easily bypassed by
// anyone posting directly to the API. This list mirrors the client list and
// runs on every POST and PATCH so it cannot be skipped.
// ---------------------------------------------------------------------------
const BLOCKED_PATTERNS: RegExp[] = [
  // Scam / spam indicators
  /\bscam\b/i,
  /\bpyramid\s+scheme\b/i,
  /\bget\s+rich\s+quick\b/i,
  /\bcrypto\s+investment\b/i,
  /\bfree\s+money\b/i,
  /\beasy\s+money\b/i,
  /\bmake\s+money\s+fast\b/i,
  /\bwork\s+from\s+home\b/i,
  /\bact\s+now\b/i,
  /\blimited\s+time\s+offer\b/i,
  /\bcash\s?app\b/i,
  /\bvenmo\s+me\b/i,
  // Threats / harassment
  /\bkill\s+yourself\b/i,
  /\bkys\b/i,
  /\bdoxx(ing)?\b/i,
  /\bswat(ting)?\b/i,
  /\bwatch\s+your\s+back\b/i,
  // Suspicious URL patterns
  /bit\.ly\//i,
  /tinyurl\.com\//i,
  /\.tk\//i,
];

function checkContent(fields: Record<string, string>): string | null {
  for (const [fieldName, value] of Object.entries(fields)) {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(value)) {
        return `Field "${fieldName}" contains prohibited content.`;
      }
    }
  }
  return null;
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
        created_at,
        image_url
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
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    if (error instanceof Error)
    {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
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
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        missingFields
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Server-side content filter — cannot be bypassed by direct API calls
    const contentViolation = checkContent({
      title: body.title,
      description: body.desc,
      location: body.location,
    });

    if (contentViolation) {
      return new Response(JSON.stringify({ error: contentViolation }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Validate datetime
    const startDate = new Date(body.startDateTime);
    const endDate = new Date(body.endDateTime);

    if (isNaN(startDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid start datetime format' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (isNaN(endDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid end datetime format' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (endDate <= startDate) {
      return new Response(JSON.stringify({ error: 'End time must be after start time' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const result = await context.env.DB.prepare(
      `INSERT INTO posts
        (title, description, location, start_datetime, end_datetime, max_participants, user_id, user_name, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.title,
      body.desc,
      body.location,
      body.startDateTime,
      body.endDateTime,
      parseInt(body.participants),
      body.userId,
      body.userName,
      body.imageUrl || null
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
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    if (error instanceof Error)
    {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}