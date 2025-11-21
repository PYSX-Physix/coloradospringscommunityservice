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
        db: db as any, // D1 database instance
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      trustedOrigins: ["https://react-dev-accounts.coloradospringscommunityservice.pages.dev", "https://react-dev.coloradospringscommunityservice.pages.dev"],
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
  
  // Better Auth handles all /api/auth/* routes automatically
  return auth.handler(context.request);
}