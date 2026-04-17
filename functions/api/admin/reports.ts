import { corsJson } from "../../lib/cors";

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const url = new URL(context.request.url);
    const status = url.searchParams.get("status") || "pending";
    const limit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10);

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
      "SELECT COUNT(*) as count FROM reports WHERE status = ?"
    ).bind(status).first<{ count: number }>();

    return corsJson(context.request, {
      reports,
      total: totalCount?.count ?? 0,
      status,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching reports", error);
    return corsJson(context.request, { error: "Internal server error" }, 500);
  }
}
