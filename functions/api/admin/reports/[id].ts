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

// PATCH - Update report status (admin only)
export async function onRequestPatch(context: { 
  params: { id: string }; 
  env: Env;
  request: Request;
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

    const { id } = context.params;
    const { status, actionTaken, notes } = await context.request.json();

    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed', 'duplicate'];
    
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await context.env.DB.prepare(
      `UPDATE reports 
       SET status = ?, 
           action_taken = ?,
           notes = ?,
           reviewed_by = ?,
           reviewed_at = ?
       WHERE id = ?`
    ).bind(
      status, 
      actionTaken || null, 
      notes || null, 
      adminCheck.userId, 
      Date.now(),
      id
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Report updated successfully' 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error updating report:', error);
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
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}