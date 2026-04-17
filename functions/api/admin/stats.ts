import { corsJson } from "../../lib/cors";

interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const totalReportsResult = await context.env.DB.prepare("SELECT COUNT(*) as count FROM reports").first<{ count: number }>();
    const pendingReportsResult = await context.env.DB.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").first<{ count: number }>();
    const totalUsersResult = await context.env.DB.prepare("SELECT COUNT(*) as count FROM user").first<{ count: number }>();
    const totalPostsResult = await context.env.DB.prepare("SELECT COUNT(*) as count FROM posts WHERE visible = 1").first<{ count: number }>();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const reportsTodayResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM reports WHERE created_at >= ?"
    ).bind(todayStart.getTime()).first<{ count: number }>();

    return corsJson(context.request, {
      totalReports: totalReportsResult?.count ?? 0,
      pendingReports: pendingReportsResult?.count ?? 0,
      totalUsers: totalUsersResult?.count ?? 0,
      totalPosts: totalPostsResult?.count ?? 0,
      reportsToday: reportsTodayResult?.count ?? 0,
    });
  } catch (error) {
    console.error("Error fetching stats", error);
    return corsJson(context.request, { error: "Internal server error" }, 500);
  }
}
