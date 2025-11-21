import { betterAuth } from "better-auth";

interface Env {
  DB: D1Database;
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

function getAuth(db: D1Database) {
  if (!authInstance) {
    authInstance = betterAuth({
      database: {
        provider: "sqlite",
        db: db as any,
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      trustedOrigins: [
        "http://localhost:8788",
        "http://localhost:3000",
        "https://react-dev-account.coloradospringscommunityservice.pages.dev",
        "https://react-dev-accounts.coloradospringscommunityservice.pages.dev",
      ],
    });
  }
  return authInstance;
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { path?: string };
}) {
  const auth = getAuth(context.env.DB);
  
  // Handle CORS preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": context.request.headers.get("Origin") || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Get response from Better Auth
  const response = await auth.handler(context.request);
  
  // Clone response to add CORS headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", context.request.headers.get("Origin") || "*");
  newHeaders.set("Access-Control-Allow-Credentials", "true");
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}