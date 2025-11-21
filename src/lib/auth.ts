import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    // Better Auth will work with D1 directly
    provider: "sqlite", // D1 uses SQLite
    url: "file:local.db" // For local dev, will be overridden in production
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  socialProviders: {
    // This needs to be added later because we can't afford this.
  },
});

export type Session = typeof auth.$Infer.Session;