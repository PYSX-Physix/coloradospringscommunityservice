export async function onRequest(context: {
  request: Request;
  env: {
    DB: D1Database; // bound in wrangler.toml
  };
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === "POST") {
    try {
      const body = await request.json() as {
        title: string;
        desc: string;
        location?: string;
        date?: string;
        createdBy?: string;
      };

      await env.DB.prepare(
        `INSERT INTO posts (title, description, location, date, createdBy, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          body.title,
          body.desc,
          body.location ?? "",
          body.date ?? "",
          body.createdBy ?? "anonymous",
          new Date().toISOString()
        )
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare(
      `SELECT id, title, description, location, date, createdBy, createdAt
       FROM posts
       ORDER BY createdAt DESC`
    ).all();

    return new Response(JSON.stringify(result.results), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
