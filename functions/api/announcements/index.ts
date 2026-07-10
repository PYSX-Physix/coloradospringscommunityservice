// functions/api/announcements/index.ts
//
// GET  /api/announcements         → list published announcements (newest first)
// GET  /api/announcements?all=1   → list all incl. drafts (admin only)
// POST /api/announcements         → create a new announcement (admin only)
//
// Auth/CORS/CSRF are handled by functions/api/_middleware.ts, so we only
// need to check isAdmin here — exactly like admin/blacklist.ts does.

import { corsJson } from '../../lib/cors';
import { getSession } from '../../lib/auth';
import { rowToAnnouncement, type AnnouncementRow, type AnnouncementInput } from '../announcements-data';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const wantAll = url.searchParams.get('all') === '1';

  try {
    let includeDrafts = false;
    if (wantAll) {
      const session = await getSession(env, request);
      includeDrafts = !!session?.user.isAdmin;
    }

    const query = includeDrafts
      ? `SELECT * FROM announcements ORDER BY created_at DESC`
      : `SELECT * FROM announcements WHERE published = 1 ORDER BY created_at DESC`;

    const { results } = await env.DB.prepare(query).all<AnnouncementRow>();
    return corsJson(request, { announcements: (results ?? []).map(rowToAnnouncement) });
  } catch (error) {
    console.error('Error fetching announcements', error);
    return corsJson(request, { error: 'Internal server error' }, 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const session = await getSession(env, request);
    if (!session) return corsJson(request, { error: 'Unauthorized' }, 401);
    if (!session.user.isAdmin) return corsJson(request, { error: 'Admin access required' }, 403);

    const body = await request.json() as AnnouncementInput;

    const required = ['id', 'version', 'date', 'title', 'type', 'message'] as const;
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string') {
        return corsJson(request, { error: `Missing or invalid field: ${field}` }, 400);
      }
    }

    if (!/^[a-z0-9-]+$/.test(body.id)) {
      return corsJson(request, { error: 'id must be a lowercase slug (letters, numbers, hyphens)' }, 400);
    }

    if (body.type !== 'info' && body.type !== 'warning') {
      return corsJson(request, { error: "type must be 'info' or 'warning'" }, 400);
    }

    const existing = await env.DB
      .prepare('SELECT id FROM announcements WHERE id = ?')
      .bind(body.id)
      .first();
    if (existing) {
      return corsJson(request, { error: `An announcement with id "${body.id}" already exists` }, 409);
    }

    const now = Date.now();
    const hasDetailPage = !!body.hasDetailPage && !!body.article;

    await env.DB.prepare(
      `INSERT INTO announcements
         (id, version, date, title, type, message, items, dismissible,
          has_detail_page, article, published, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.id,
      body.version,
      body.date,
      body.title,
      body.type,
      body.message,
      body.items?.length ? JSON.stringify(body.items) : null,
      body.dismissible === false ? 0 : 1,
      hasDetailPage ? 1 : 0,
      hasDetailPage ? JSON.stringify(body.article) : null,
      body.published === false ? 0 : 1,
      session.user.id,
      now,
      now
    ).run();

    const row = await env.DB
      .prepare('SELECT * FROM announcements WHERE id = ?')
      .bind(body.id)
      .first<AnnouncementRow>();

    return corsJson(request, { announcement: rowToAnnouncement(row!) }, 201);
  } catch (error) {
    console.error('Error creating announcement', error);
    return corsJson(request, { error: 'Internal server error' }, 500);
  }
}

export async function onRequestOptions(context: { request: Request }) {
  return corsJson(context.request, null, 204);
}
