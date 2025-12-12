interface Env {
  DB: D1Database;
}

// Helper function to check if user is admin
async function isAdmin(env: Env, sessionId: string): Promise<boolean> {
  const session = await env.DB.prepare(
    `SELECT s.user_id, u.isAdmin
     FROM session s
     JOIN user u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > ?`
  ).bind(sessionId, Date.now()).first();

  return !!(session && session.isAdmin);
}

// GET admin dashboard stats
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

    const isAdminUser = await isAdmin(context.env, sessionId);
    if (!isAdminUser) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get total reports
    const totalReportsResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports`
    ).first();

    // Get pending reports
    const pendingReportsResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`
    ).first();

    // Get total users
    const totalUsersResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM user`
    ).first();

    // Get total posts
    const totalPostsResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM posts WHERE visible = 1`
    ).first();

    // Get reports from today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();

    const reportsTodayResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports WHERE created_at >= ?`
    ).bind(todayTimestamp).first();

    const stats = {
      totalReports: (totalReportsResult?.count as number) || 0,
      pendingReports: (pendingReportsResult?.count as number) || 0,
      totalUsers: (totalUsersResult?.count as number) || 0,
      totalPosts: (totalPostsResult?.count as number) || 0,
      reportsToday: (reportsTodayResult?.count as number) || 0,
    };

    return new Response(JSON.stringify(stats), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
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