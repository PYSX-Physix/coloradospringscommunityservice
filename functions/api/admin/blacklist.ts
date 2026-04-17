import { corsJson } from "../../lib/cors";

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { words } = await context.request.json<{ words?: string[] }>();

    if (!words || !Array.isArray(words)) {
      return corsJson(context.request, { error: "Invalid request. Provide an array of words." }, 400);
    }

    const now = Date.now();
    for (const word of words) {
      await context.env.DB.prepare(
        "INSERT OR IGNORE INTO blacklisted_words (word, added_at) VALUES (?, ?)"
      ).bind(word.toLowerCase(), now).run();
    }

    return corsJson(context.request, {
      success: true,
      message: `Added ${words.length} words to blacklist`,
    });
  } catch (error) {
    console.error("Blacklist update error", error);
    return corsJson(context.request, { error: "Internal server error" }, 500);
  }
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { results } = await context.env.DB.prepare("SELECT word FROM blacklisted_words ORDER BY word ASC").all();
    return corsJson(context.request, {
      words: results.map((row: { word: string }) => row.word),
    });
  } catch (error) {
    console.error("Blacklist query error", error);
    return corsJson(context.request, { error: "Internal server error" }, 500);
  }
}
