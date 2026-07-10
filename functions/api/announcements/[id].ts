// functions/api/announcements/[id].ts
//
// GET    /api/announcements/:id  → single announcement (drafts visible to admins only)
// PUT    /api/announcements/:id  → update an announcement (admin only)
// DELETE /api/announcements/:id  → delete an announcement (admin only)

import { corsJson } from '../../lib/cors';
import { getSession } from '../../lib/auth';
import { rowToAnnouncement, type AnnouncementRow, type AnnouncementInput } from '../announcements-data';

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env; params: { id: string } }) {
  const { request, env, params } = context;

  try {
    const row = await env.DB
      .prepare('SELECT * FROM announcements WHERE id = ?')
      .bind(params.id)
      .first<AnnouncementRow>();

    if (!row) return corsJson(request, { error: 'Announcement not found' }, 404);

    // Drafts are only visible to admins
    if (!row.published) {
      const session = await getSession(env, request);
      if (!session?.user.isAdmin) return corsJson(request, { error: 'Announcement not found' }, 404);
    }

    return corsJson(request, { announcement: rowToAnnouncement(row) });
  } catch (error) {
    console.error('Error fetching announcement', error);
    return corsJson(request, { error: 'Internal server error' }, 500);
  }
}

export async function onRequestPut(context: { request: Request; env: Env; params: { id: string } }) {
  const { request, env, params } = context;

  try {
    const session = await getSession(env, request);
    if (!session) return corsJson(request, { error: 'Unauthorized' }, 401);
    if (!session.user.isAdmin) return corsJson(request, { error: 'Admin access required' }, 403);

    const existing = await env.DB
      .prepare('SELECT * FROM announcements WHERE id = ?')
      .bind(params.id)
      .first<AnnouncementRow>();
    if (!existing) return corsJson(request, { error: 'Announcement not found' }, 404);

    const body = await request.json() as Partial<AnnouncementInput>;

    if (body.type && body.type !== 'info' && body.type !== 'warning') {
      return corsJson(request, { error: "type must be 'info' or 'warning'" }, 400);
    }

    // Merge so partial updates don't wipe untouched fields
    const hasDetailPage = body.hasDetailPage !== undefined
      ? (!!body.hasDetailPage && !!body.article)
      : (!!existing.has_detail_page && (body.article !== undefined ? !!body.article : !!existing.article));

    await env.DB.prepare(
      `UPDATE announcements SET
         version = ?, date = ?, title = ?, type = ?, message = ?, items = ?,
         dismissible = ?, has_detail_page = ?, article = ?, published = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      body.version       ?? existing.version,
      body.date          ?? existing.date,
      body.title         ?? existing.title,
      body.type          ?? existing.type,
      body.message       ?? existing.message,
      body.items !== undefined
        ? (body.items?.length ? JSON.stringify(body.items) : null)
        : existing.items,
      body.dismissible !== undefined ? (body.dismissible ? 1 : 0) : existing.dismissible,
      hasDetailPage ? 1 : 0,
      hasDetailPage
        ? (body.article ? JSON.stringify(body.article) : existing.article)
        : null,
      body.published !== undefined ? (body.published ? 1 : 0) : existing.published,
      Date.now(),
      params.id
    ).run();

    const row = await env.DB
      .prepare('SELECT * FROM announcements WHERE id = ?')
      .bind(params.id)
      .first<AnnouncementRow>();

    return corsJson(request, { announcement: rowToAnnouncement(row!) });
  } catch (error) {
    console.error('Error updating announcement', error);
    return corsJson(request, { error: 'Internal server error' }, 500);
  }
}

export async function onRequestDelete(context: { request: Request; env: Env; params: { id: string } }) {
  const { request, env, params } = context;

  try {
    const session = await getSession(env, request);
    if (!session) return corsJson(request, { error: 'Unauthorized' }, 401);
    if (!session.user.isAdmin) return corsJson(request, { error: 'Admin access required' }, 403);

    const existing = await env.DB
      .prepare('SELECT id FROM announcements WHERE id = ?')
      .bind(params.id)
      .first();
    if (!existing) return corsJson(request, { error: 'Announcement not found' }, 404);

    await env.DB.prepare('DELETE FROM announcements WHERE id = ?').bind(params.id).run();
    return corsJson(request, { success: true });
  } catch (error) {
    console.error('Error deleting announcement', error);
    return corsJson(request, { error: 'Internal server error' }, 500);
  }
}

export async function onRequestOptions(context: { request: Request }) {
  return corsJson(context.request, null, 204);
}
