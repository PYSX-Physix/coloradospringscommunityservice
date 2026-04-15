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

    const { reportedUserId, postId, category, description } = await context.request.json();

    // Validation
    if (!reportedUserId || !category || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const reporterId = session.user_id as string;

    // Cannot report yourself
    if (reporterId === reportedUserId) {
      return new Response(JSON.stringify({ error: 'You cannot report yourself' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate description length
    if (description.length < 10) {
      return new Response(JSON.stringify({ error: 'Description must be at least 10 characters' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (description.length > 2000) {
      return new Response(JSON.stringify({ error: 'Description too long (max 2000 characters)' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate category
    const validCategories = [
      'inappropriate_content',
      'spam_misleading',
      'safety_concerns',
      'terms_violation',
      'noshow_cancellation',
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

    // Check for duplicate reports (same reporter, same user, within 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const duplicateCheck = await context.env.DB.prepare(
      `SELECT id FROM reports 
       WHERE reporter_id = ? 
       AND reported_user_id = ? 
       AND created_at > ?`
    ).bind(reporterId, reportedUserId, oneDayAgo).first();

    if (duplicateCheck) {
      return new Response(JSON.stringify({ 
        error: 'You have already reported this user recently. Please wait 24 hours before reporting again.' 
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
      postId || null, 
      category, 
      description,
      Date.now()
    ).run();

    // Optional: Auto-hide content if multiple reports
    if (postId) {
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

// GET - Get user's submitted reports (optional - for user dashboard)
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
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

    const { results } = await context.env.DB.prepare(
      `SELECT 
        r.id,
        r.category,
        r.description,
        r.status,
        r.created_at,
        u.name as reported_user_name,
        p.title as post_title
      FROM reports r
      LEFT JOIN user u ON r.reported_user_id = u.id
      LEFT JOIN posts p ON r.post_id = p.id
      WHERE r.reporter_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50`
    ).bind(session.user_id).all();

    return new Response(JSON.stringify({ reports: results }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reports' }), {
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
