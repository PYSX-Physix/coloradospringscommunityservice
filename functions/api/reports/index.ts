// Fixed functions/api/reports/index.ts
interface Env {
  DB: D1Database;
}

// POST - Submit a report
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
      `SELECT user_id FROM session WHERE id = ? AND expires_at > ?`
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

    // Validation
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
    const validCategories = [
      'spam',
      'offensive',
      'misinformation',
      'safety concerns',
      'duplicate',
      'other'
    ];

    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const reporterId = session.user_id as string;

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
        error: 'You have already reported this post recently. Please wait 24 hours before reporting again.' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check daily report limit (prevent spam)
    const reportCount = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports 
       WHERE reporter_id = ? 
       AND created_at > ?`
    ).bind(reporterId, oneDayAgo).first();

    if (reportCount && (reportCount.count as number) >= 5) {
      return new Response(JSON.stringify({ 
        error: 'Report limit reached. You can submit up to 5 reports per day.' 
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get post details to find the reported user
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

    const reportedUserId = post.user_id as string;

    // Cannot report yourself
    if (reporterId === reportedUserId) {
      return new Response(JSON.stringify({ error: 'You cannot report your own post' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Insert the report
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

    // Optional: Auto-hide content if multiple reports
    const reportCountForPost = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM reports 
       WHERE post_id = ? 
       AND status = 'pending'`
    ).bind(postId).first();

    if (reportCountForPost && (reportCountForPost.count as number) >= 3) {
      // Auto-hide the post after 3 reports
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

  } catch (error: any) {
    console.error('Error submitting report:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit report' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
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
