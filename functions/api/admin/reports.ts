interface Env {
  DB: D1Database;
}

// Helper function to check if user is admin
async function isAdmin(env: Env, sessionId: string): Promise<{ isAdmin: boolean; userId?: string }> {
  const session = await env.DB.prepare(
    `SELECT s.user_id, u.isAdmin
     FROM session s
     JOIN user u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > ?`
  ).bind(sessionId, Date.now()).first();

  if (!session || !session.isAdmin) {
    return { isAdmin: false };
  }

  return { isAdmin: true, userId: session.user_id as string };
}

// GET all reports (admin only)
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const adminCheck = await isAdmin(context.env, sessionId);
    if (!adminCheck.isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { results: reports } = await context.env.DB.prepare(
      `SELECT 
        r.*,
        reporter.name as reporter_name,
        reporter.email as reporter_email,
        reported.name as reported_user_name,
        reported.email as reported_user_email,
        p.title as post_title
      FROM reports r
      LEFT JOIN user reporter ON r.reporter_id = reporter.id
      LEFT JOIN user reported ON r.reported_user_id = reported.id
      LEFT JOIN posts p ON r.post_id = p.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`
    ).bind(status, limit, offset).all();

    const totalCount = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports WHERE status = ?`
    ).bind(status).first();

    return new Response(JSON.stringify({ 
      reports, 
      total: totalCount?.count || 0,
      status,
      limit,
      offset
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
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