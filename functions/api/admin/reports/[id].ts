import { getSession } from "../../../lib/auth";
import { corsJson } from "../../../lib/cors";

interface Env {
  DB: D1Database;
}

export async function onRequestPatch(context: { params: { id: string }; env: Env; request: Request }) {
  try {
    const session = await getSession(context.env, context.request);
    if (!session || !session.user.isAdmin) {
      return corsJson(context.request, { error: "Admin access required" }, 403);
    }

    const { id } = context.params;
    const { status, actionTaken, notes } = (await context.request.json()) as { status?: string; actionTaken?: string; notes?: string };

    const validStatuses = ["pending", "under_review", "resolved", "dismissed", "duplicate"];
    if (!status || !validStatuses.includes(status)) {
      return corsJson(context.request, { error: "Invalid status" }, 400);
    }

    await context.env.DB.prepare(
      `UPDATE reports
       SET status = ?,
           action_taken = ?,
           notes = ?,
           reviewed_by = ?,
           reviewed_at = ?
       WHERE id = ?`
    ).bind(status, actionTaken || null, notes || null, session.user.id, Date.now(), id).run();

    return corsJson(context.request, { success: true, message: "Report updated successfully" });
  } catch (error) {
    console.error("Error updating report", error);
    return corsJson(context.request, { error: "Internal server error" }, 500);
  }
}
