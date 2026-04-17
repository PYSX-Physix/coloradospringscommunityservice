// Fixed functions/api/reports/create.ts
interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}) {
  try {
    // Get user from session
    const cookie = context.request.headers.get("Cookie");
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const session = await context.env.DB.prepare(
      `SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?`
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const { postId, category, details } = await context.request.json();

    if (!postId || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate category
    const validCategories = ['spam', 'offensive', 'misinformation', 'safety concerns', 'duplicate', 'other'];
    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get the post to find the reported user
    const post = await context.env.DB.prepare(
      `SELECT user_id FROM posts WHERE id = ?`
    ).bind(postId).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const reporterId = session.user_id as string;
    const reportedUserId = post.user_id as string;

    // Cannot report your own post
    if (reporterId === reportedUserId) {
      return new Response(JSON.stringify({ error: 'You cannot report your own post' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check for duplicate reports (same reporter, same post, within 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const duplicateCheck = await context.env.DB.prepare(
      `SELECT id FROM reports 
       WHERE reporter_id = ? 
       AND post_id = ? 
       AND created_at > ?`
    ).bind(reporterId, postId, oneDayAgo).first();

    if (duplicateCheck) {
      return new Response(JSON.stringify({ 
        error: 'You have already reported this post recently.' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check daily report limit
    const reportCount = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports 
       WHERE reporter_id = ? 
       AND created_at > ?`
    ).bind(reporterId, oneDayAgo).first();

    if (reportCount && (reportCount.count as number) >= 10) {
      return new Response(JSON.stringify({ 
        error: 'Report limit reached. Please try again tomorrow.' 
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Insert report with both post_id and reported_user_id
    const reportId = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO reports (
        id,
        reporter_id,
        reported_user_id,
        post_id,
        category,
        description,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).bind(
      reportId,
      reporterId,
      reportedUserId,
      postId,
      category,
      details || null,
      Date.now()
    ).run();

    // Auto-hide post after 3 reports
    const postReportCount = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports 
       WHERE post_id = ? AND status = 'pending'`
    ).bind(postId).first();

    if (postReportCount && (postReportCount.count as number) >= 3) {
      await context.env.DB.prepare(
        `UPDATE posts SET visible = 0 WHERE id = ?`
      ).bind(postId).run();
    }

    return new Response(JSON.stringify({ 
      success: true,
      reportId,
      message: 'Report submitted successfully'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Error creating report:', error);
    if (error instanceof Error)
    {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
